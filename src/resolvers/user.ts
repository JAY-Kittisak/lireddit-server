import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2'

import { User } from "../entities/User";
import { MyContext } from "../types";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class UserResponse {
    @Field()
    errors: Error[]

    @Field()
    user: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ) {
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword
        })
        await em.persistAndFlush(user)
        return user
    }

    @Mutation(() => User)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ) {
        const user = await em.findOne(User, {
            username: options.username.toLowerCase(),
            password: options.password
        })
        if (!user) {
            return {
                errors: [{}]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        return user
    }
}