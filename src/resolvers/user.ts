import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'

import { User } from "../entities/User";
import { MyContext } from "../types";
import { COOKIE_NAME } from "../constants";
import { getConnection } from "typeorm";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        }

        const user = await getConnection()
            .getRepository(User)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.posts", "post")
        // .where("user.id = :id", { id: 3 })

        if (req.session.userId) {
            user.where("user.id = :id", { id: req.session.userId })
        }

        // return User.findOne(req.session.userId)
        return user.getOne();
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater then 2"
                    }
                ]
            }
        }

        if (options.password.length <= 3) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater then 3"
                    }
                ]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        let user;
        try {
            // User.create({}).save()
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(
                    {
                        username: options.username,
                        password: hashedPassword,
                    }
            )
                .returning('*')
                .execute()
            user = result.raw[0];
        } catch (err) {
            //|| err.detail.includes("already exists")
            // duplicate username error
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken"
                        }
                    ]
                }
            }
        }

        // store user id session
        // this will set a cookie on the user
        // keep them logged in
        req.session.userId = user.id

        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne({ where: { username: options.username } })
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password)
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            }
        }

        req.session.userId = user.id


        return {
            user,
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve =>
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME)
                if (err) {
                    console.log(err)
                    resolve(false)
                    return
                }

                resolve(true)
            })
        )
    }
}