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
import { getConnection } from "typeorm"

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

@InputType()
class QueryJobIT_Input {
    @Field({ nullable: true })
    nameItAction: string
    @Field({ nullable: true })
    status: string
    @Field({ nullable: true })
    dateBegin: string
    @Field({ nullable: true })
    dateEnd: string
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
    async jobITs(
        @Arg("input") input: QueryJobIT_Input,
        @Ctx() { req }: MyContext
    ): Promise<JobIT[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        // return await JobIT.find()
        const jobIt = getConnection()
            .getRepository(JobIT)
            .createQueryBuilder("j")
            .orderBy('j.createdAt', "DESC")


        if (input.nameItAction) {
            jobIt.where("j.itActionName = :itActionName", { itActionName: input.nameItAction })
        }

        if (input.status) {
            jobIt.where("j.status = :status", { status: input.status })
        }

        if (input.dateBegin && input.dateEnd) {
            const dateBegin = new Date(input.dateBegin)
            const dateEnd = new Date(input.dateEnd)
            dateEnd.setDate(dateEnd.getDate() + 1)

            const beginning = dateBegin.toISOString()
            const ending = dateEnd.toISOString()

            jobIt.andWhere(`"j"."createdAt"BETWEEN :begin AND :end`, { begin: beginning, end: ending });
        }

        return jobIt.getMany()
    }

    @Query(() => JobIT)
    async jobITById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<JobIT | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return await JobIT.findOne(id);
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

        const user = await User.findOne({ where: { id: req.session.userId } })

        // if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
        //     throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        // }
        if (user?.roles === "client-LKB") {
            await JobIT.create({
                titled: input.titled,
                desiredDate: input.desiredDate,
                category: input.category,
                creatorId: req.session.userId,
            }).save()
        }
        // branch 0
        if (user?.roles === "client-CDC") {
            await JobIT.create({
                titled: input.titled,
                desiredDate: input.desiredDate,
                category: input.category,
                creatorId: req.session.userId,
                branch: 1
            }).save()
        }

        const jobIT = await JobIT.find()

        return { jobIT }
    }

    @Query(() => [JobIT])
    async jobITByCreatorId(@Ctx() { req }: MyContext): Promise<JobIT[] | undefined> {
        if (!req.session.userId) throw new Error("กรุณา Login.")
        // return await JobIT.find({ creatorId: req.session.userId });
        const jobIt = getConnection()
            .getRepository(JobIT)
            .createQueryBuilder("j")
            .orderBy('j.createdAt', "DESC")

        if (req.session.userId) {
            jobIt.where("j.creatorId = :id", { id: req.session.userId })
        }

        return jobIt.getMany()
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