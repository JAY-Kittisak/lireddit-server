import argon2 from 'argon2';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver, Int } from "type-graphql";
import { getConnection } from "typeorm";
import { GraphQLUpload } from 'graphql-upload'
import { createWriteStream } from "fs";
import { join, parse } from "path";

import { URL } from '../config'
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { Departments, MyContext, UserRole, Upload, Position } from "../types";


@InputType()
class RegisterInput {
    @Field()
    username: string
    @Field()
    password: string
    @Field()
    email: string
    @Field()
    roles: UserRole
    @Field()
    departments: Departments
}

@InputType()
class updateUserInput {
    @Field()
    fullNameTH: string
    @Field()
    fullNameEN: string
    @Field()
    nickName: string
    @Field()
    email: string
}

@InputType()
class LoginInput {
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
    @Query(() => [User])
    async users(
        @Ctx() { req }: MyContext
    ): Promise<User[]> {
        if (!req.session.userId) throw new Error("Please Login.")
        const admin = await User.findOne(req.session.userId)
        // const isAdmin = admin?.roles.includes(UserRole.SUPER_ADMIN || UserRole.ADMIN)
        // if (!isAdmin) throw new Error("สิทธิของคุณไม่ถึง")
        if (admin?.roles.includes(UserRole.CLIENT_LKB)) {
            throw new Error("สิทธิของคุณไม่ถึง")
        }
        if (admin?.roles.includes(UserRole.CLIENT_CDC)) {
            throw new Error("สิทธิของคุณไม่ถึง")
        }

        const user = await getConnection()
            .getRepository(User)
            .createQueryBuilder("u")
            .orderBy('u.createdAt', "DESC")
            .getMany()

        return user
    }

    @Query(() => [User])
    async userAdmin(@Ctx() { req }: MyContext): Promise<User[]> {
        if (!req.session.userId) throw new Error("Please Login.")
        const admin = await User.findOne(req.session.userId)
        // const isAdmin = admin?.roles.includes(UserRole.SUPER_ADMIN || UserRole.ADMIN)
        // if (!isAdmin) throw new Error("สิทธิของคุณไม่ถึง")
        if (admin?.roles.includes(UserRole.CLIENT_LKB)) {
            throw new Error("สิทธิของคุณไม่ถึง")
        }
        if (admin?.roles.includes(UserRole.CLIENT_CDC)) {
            throw new Error("สิทธิของคุณไม่ถึง")
        }
        if (admin?.roles.includes(UserRole.ADMIN)) {
            return User.find({ where: { roles: admin.roles } })
        }
        if (admin?.roles.includes(UserRole.SUPER_ADMIN)) {
            return User.find({ where: { roles: admin.roles } })
        }
        return User.find()
    }

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
            // .leftJoinAndSelect(Manufacturer, 'mf', 'mf.creatorFactory = u.companyName')
            // .leftJoinAndSelect(User, 'u', 'u.creatorFactory = companyName')
            // .leftJoinAndSelect("user.posts", "post")
        // .where("user.id = :id", { id: 3 })

        if (req.session.userId) {
            user.where("user.id = :id", { id: req.session.userId })
        }

        // return User.findOne(req.session.userId)
        return user.getOne();
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: RegisterInput,
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
                        email: options.email,
                        roles: options.roles,
                        departments: options.departments,
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
        @Arg('options') options: LoginInput,
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

    @Mutation(() => UserResponse)
    async uploadImageMe(
        @Arg('options', () => GraphQLUpload)
        {
            filename,
            createReadStream
        }: Upload,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse | null> {
            let stream = createReadStream()

            let {
                ext,
                name
            } = parse(filename)

            name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');

            let serverFile = join(
                __dirname, `../../dist/images/users/${name}-${Date.now()}${ext}`
            );

            serverFile = serverFile.replace(' ', '_');

            let writeStream = await createWriteStream(serverFile);

            await stream.pipe(writeStream);

            serverFile = `${URL}${serverFile.split('images')[1]}`;

            console.log("URL รูปภาพ", serverFile)
            // return serverFile;
            if (!req.session.userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "โปรด Login"
                        }
                    ]
                }
            }
            const user = await User.findOne({ where: { id: req.session.userId } })
            if (!user) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "ไม่พบ ID นี้"
                        }
                    ]
                }
            }
            user.imageUrl = serverFile

            await user.save()

        return { user }
    }

    @Mutation(() => UserResponse)
    async updateRoles(
        @Arg("newRoles") newRoles: UserRole,
        @Arg("newPosition") newPosition: Position,
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse | null> {
        if (!req.session.userId)
            return {
                errors: [
                    {
                        field: "userId",
                        message: "โปรด Login"
                    }
                ]
            }

            const superAdmin = await User.findOne(req.session.userId)
            const isSuperAdmin = superAdmin?.roles.includes(UserRole.SUPER_ADMIN)

            if (!isSuperAdmin) throw new Error("สิทธิของคุณไม่ถึง")

            const user = await User.findOne(id)
            if (!user) throw new Error("User not found.")

            user.roles = newRoles
        user.position = newPosition
            await user.save()
        return { user }
    }

    @Mutation(() => UserResponse)
    async updateUser(
        @Arg("options") options: updateUserInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse | null> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const user = await User.findOne(req.session.userId)
        if (!user) throw new Error("User not found.")

        if (options.fullNameTH.length <= 6) {
            return {
                errors: [
                    {
                        field: "fullNameTH",
                        message: "length must be greater then 6"
                    }
                ]
            }
        }

        if (options.fullNameEN.length <= 6) {
            return {
                errors: [
                    {
                        field: "fullNameEN",
                        message: "length must be greater then 6"
                    }
                ]
            }
        }

        if (options.nickName.length <= 1) {
            return {
                errors: [
                    {
                        field: "nickName",
                        message: "length must be greater then 1"
                    }
                ]
            }
        }

        if (options.email.length <= 6) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "length must be greater then 10"
                    }
                ]
            }
        }

        user.fullNameTH = options.fullNameTH
        user.fullNameEN = options.fullNameEN
        user.nickName = options.nickName
        user.email = options.email

        await user.save()
        return { user }
    }

    @Mutation(() => Boolean)
    // @UseMiddleware(isAuth)
    async deleteUser(
        @Arg("id") id: number
    ): Promise<boolean> {
        await User.delete(id)
        return true
    }
}