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

import { Leave, User } from "../entities"
import { UserRole, Approve, Position } from "../types";
const { lineNotifyToDevGroup } = require('../notify')

@InputType()
class Leave_Input {
    @Field()
    title: string
    @Field()
    detail: string
    @Field()
    sumDate: string
    @Field()
    sumHour: string
    @Field()
    dateBegin: string
    @Field()
    dateEnd: string
}

@ObjectType()
class FieldErrorLeave {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class Leave_Response {
    @Field(() => [FieldErrorLeave], { nullable: true })
    errors?: FieldErrorLeave[];

    @Field(() => [Leave], { nullable: true })
    leave?: Leave[];
}

@Resolver()
export class LeaveResolver {
    @Query(() => [Leave], { nullable: true })
    async leaves(
        @Arg("createBy", () => Boolean) createBy: boolean,
        @Ctx() { req }: MyContext
    ): Promise<Leave[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const leave = getConnection()
            .getRepository(Leave)
            .createQueryBuilder("l")
            .orderBy('l.createdAt', "DESC")

        if (createBy) {
            leave.where("l.creatorId = :id", { id: req.session.userId })
        }

        return await leave.getMany()
    }

    @Query(() => Leave)
    async leaveById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Leave | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return await Leave.findOne(id);
    }

    @Mutation(() => Leave_Response)
    async createLeave(
        @Arg("input") input: Leave_Input,
        @Ctx() { req }: MyContext
    ): Promise<Leave_Response> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (input.detail.length <= 5) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }

        const user = await User.findOne({ where: { id: req.session.userId } })

        let branchNt = ""
        if (user?.roles.includes(UserRole.CLIENT_LKB)) {
            branchNt = "ลาดกระบัง"
            await Leave.create({
                title: input.title,
                detail: input.detail,
                sumDate: input.sumDate,
                sumHour: input.sumHour,
                dateBegin: input.dateBegin,
                dateEnd: input.dateEnd,
                creatorId: req.session.userId,
            }).save()
        }

        if (user?.roles.includes(UserRole.CLIENT_CDC)) {
            branchNt = "ชลบุรี"
            await Leave.create({
                title: input.title,
                detail: input.detail,
                sumDate: input.sumDate,
                sumHour: input.sumHour,
                dateBegin: input.dateBegin,
                dateEnd: input.dateEnd,
                creatorId: req.session.userId,
                branch: 1
            }).save()
        }

        lineNotifyToDevGroup(
            `ลางานออนไลน์ \nUser: ${await user?.fullNameTH} สาขา: ${branchNt}\nขออนุมัติ: ${input.title}\nเหตุผล: ${input.detail}\nจำนวนวัน: ${input.sumDate} วัน ${input.sumHour} ชั่วโมง\nวันที่ลา: ${input.dateBegin} ถึง ${input.dateEnd}\n`
        )

        const leave = await Leave.find({ where: { creatorId: req.session.userId } })

        return { leave }
    }

    @Mutation(() => Leave)
    async updateLeave(
        @Arg("id", () => Int) id: number,
        @Arg("newStatus") newStatus: Approve,
        @Ctx() { req }: MyContext
    ): Promise<Leave> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })
        if (!user) throw new Error("user not found.")

        if (user.position.includes(Position.OFFICER)) {
            throw new Error("ต้องเป็นหัวหน้าถึงจะมีสิทธิ์")
        }

        const leave = await Leave.findOne({ id })
        if (!leave) throw new Error("leave not found.")

        const client = await leave.creator
        if (client.departments !== user.departments) {
            throw new Error("ผู้แจ้งงานกับผู้อนุมัติ อยู่คนละแผนกกัน")
        }

        leave.status = newStatus
        leave.BossActionName = user.fullNameTH

        return await leave.save()
    }
}