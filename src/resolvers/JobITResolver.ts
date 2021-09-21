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

import { JobIT, User } from "../entities"
import { StatusJob } from "../types";


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

    @Field(() => [JobIT], { nullable: true })
    jobIT?: JobIT[];
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

        await JobIT.create({
            titled: input.titled,
            desiredDate: input.desiredDate,
            category: input.category,
            creatorId: req.session.userId
        }).save()

        const jobIT = await JobIT.find()

        return { jobIT }
    }

    @Query(() => [JobIT])
    async jobITByCreatorId(@Ctx() { req }: MyContext): Promise<JobIT[] | undefined> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        return await JobIT.find({ creatorId: req.session.userId });
    }

    @Mutation(() => JobIT)
    async updateJobIT(
        @Arg("id", () => Int) id: number,
        @Arg("newStatus") newStatus: StatusJob,
        @Ctx() { req }: MyContext
    ): Promise<JobIT> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })

        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }

        const job = await JobIT.findOne({ id })
        if (!job) throw new Error("jobIT not found.")

        job.status = newStatus
        const jobIT = await job.save()

        return jobIT
    }

    @Mutation(() => JobIT)
    async jobITComment(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: string,
        @Ctx() { req }: MyContext
    ): Promise<JobIT> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })

        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }

        const job = await JobIT.findOne({ id })
        if (!job) throw new Error("jobIT not found.")

        job.itActionName = user?.fullNameTH
        job.itComment = input
        const jobIT = await job.save()

        return jobIT
    }

}