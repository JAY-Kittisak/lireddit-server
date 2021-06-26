import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

// const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 100)
    }
//rerd
    @Query(() => [Post])
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        // @Info() info: any
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit)
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("post")
            // .where('post."id" = :id', { id: 1 })
            // .innerJoinAndSelect("post.creator", "user")
            // .where("user.id = :id", { id: 1 })
            .orderBy('post."id"', "DESC")
            .take(realLimit)

        if (cursor) {
            qb.where('post."id" < :cursor', {
                cursor: new Date(parseInt(cursor))
            })
        }
        // const replacements: any[] = [realLimit]
        // if (cursor) {
        //     replacements.push(new Date(parseInt(cursor)))
        // }

        // const posts = await getConnection().query(
        //     `
        //     select p.*,
        //     json_build_object(
        //         'id', u.id,
        //         'username', u.username,
        //     ) creator
        //     from post p
        //     inner join public.user u on u.id = p."creatorId"
        //     ${cursor ? `where p."createAt" < $2` : ""}
        //     order by p."createdAt" DESC
        //     limit $1
        //     `,
        //     replacements
        // )
        // console.log("posts =>", posts)
        // return posts.slice(0, realLimit)
        return qb.getMany()
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("id") id: number): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save()
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne(id)
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            await Post.update({ id }, { title })
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number): Promise<boolean> {
        await Post.delete(id)
        return true
    }
}