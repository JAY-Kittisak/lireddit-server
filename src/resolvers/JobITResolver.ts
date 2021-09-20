import { MyContext } from "../types";
import {
    Field,
    InputType,
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    Int,
    ObjectType,
} from "type-graphql";

import { JobIT } from "../entities"


@InputType()
class JobIT_Input {
    @Field()
    titled: string
    @Field()
    desiredDate: string
    @Field()
    category: string
}

@ObjectType()
class FieldErrorJobIT {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class JobIT_Response {
    @Field(() => [FieldErrorJobIT], { nullable: true })
    errors?: FieldErrorJobIT[];

    @Field(() => JobIT, { nullable: true })
    jobIT?: JobIT;
}

@Resolver()
export class JobITResolver {
    @Query(() => [JobIT], { nullable: true })
    async jobITs(@Ctx() { req }: MyContext): Promise<JobIT[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return JobIT.find()
    }

    @Query(() => JobIT)
    async jobITById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<JobIT | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return JobIT.findOne(id);
    }

    @Mutation(() => JobIT_Response)
    async createJobIT(
        @Arg("input") input: JobIT_Input,
        @Ctx() { req }: MyContext
    ): Promise<JobIT_Response> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (input.titled.length <= 5) {
            return {
                errors: [
                    {
                        field: "titled",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }
        if (input.category === "") {
            return {
                errors: [
                    {
                        field: "category",
                        message: "โปรดเลือกตัวเลือกด้านบน"
                    }
                ]
            }
        }

        const jobIT = await JobIT.create({
            titled: input.titled,
            desiredDate: input.desiredDate,
            category: input.category,
            creatorId: req.session.userId
        }).save()

        return { jobIT }
    }

}