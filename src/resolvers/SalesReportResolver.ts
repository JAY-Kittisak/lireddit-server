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

import {
    User, Customer, SalesRole,
    SalesActual, SalesTarget, SalesIssue
} from "../entities"
import { CurrentStatus, Branch } from "../types"

@InputType()
class SalesRole_Input {
    @Field()
    salesRole: string
    @Field()
    channel: string
    @Field()
    branch: Branch
    @Field()
    status: CurrentStatus
    @Field()
    userId: number
}

@InputType()
class SalesTarget_Input {
    @Field()
    year: number
    @Field()
    value: number
    @Field()
    branch: Branch
    @Field()
    salesRoleId: number
}

@InputType()
class SalesIssue_Input {
    @Field()
    title: string
    @Field()
    detail: string
    @Field()
    brand: string
    @Field()
    size?: string
    @Field()
    model?: string
    @Field()
    value: number
    @Field()
    branch: Branch
    @Field()
    status: string
    @Field()
    contact: string
    @Field()
    salesRoleId: number
}

@InputType()
class SalesActual_Input {
    @Field()
    title: string
    @Field()
    detail: string
    @Field()
    actual: number
    @Field()
    branch: Branch
    @Field()
    customerId: number
    @Field()
    userId: number
    @Field()
    salesRoleId: number
}

@ObjectType()
class FieldErrorSalesRole {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class SalesRole_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesRole], { nullable: true })
    salesRoles?: SalesRole[];
}

@ObjectType()
class SalesTarget_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesTarget], { nullable: true })
    salesTargets?: SalesTarget[];
}

@ObjectType()
class SalesIssue_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesIssue], { nullable: true })
    salesIssues?: SalesIssue[];
}

@ObjectType()
class SalesActual_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesActual], { nullable: true })
    salesActual?: SalesActual[];
}

@Resolver()
export class SalesReportResolver {
    @Query(() => [SalesRole], { nullable: true })
    async salesRoles(
        @Ctx() { req }: MyContext
    ): Promise<SalesRole[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const role = getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy('s.salesRole', "ASC")

        return await role.getMany()
    }

    @Query(() => SalesRole)
    async salesRoleById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesRole | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return await SalesRole.findOne(id);
    }

    @Mutation(() => SalesRole_Response)
    async createSalesRole(
        @Arg("input") input: SalesRole_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesRole_Response> {
        if (!req.session.userId) throw new Error("Please Login.")
        const user = await User.findOne({ where: { id: req.session.userId } })

        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID"
                    }
                ]
            }
        }
        if (input.salesRole.length !== 7) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "ความยาวต้องมากกว่า 6"
                    }
                ]
            }
        }
        if (input.channel.length <= 3) {
            return {
                errors: [
                    {
                        field: "channel",
                        message: "ความยาวต้องมากกว่า 3"
                    }
                ]
            }
        }

        await SalesRole.create({
            salesRole: input.salesRole,
            channel: input.channel,
            branch: input.branch,
            status: input.status,
            userId: input.userId,
        }).save()

        const salesRoles = await getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy('s.salesRole', "DESC")
            .getMany()

        return { salesRoles }
    }

    @Query(() => [SalesActual], { nullable: true })
    async salesActuals(
        @Ctx() { req }: MyContext
    ): Promise<SalesActual[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const actual = getConnection()
            .getRepository(SalesActual)
            .createQueryBuilder("sa")
            .orderBy('sa.id', "DESC")

        return await actual.getMany()
    }

    @Mutation(() => SalesActual_Response)
    async createSalesActual(
        @Arg("input") input: SalesActual_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesActual_Response> {
        if (!req.session.userId) throw new Error("Please Login.")
        const customer = await Customer.findOne({ where: { id: input.customerId } })
        const salesRole = await SalesRole.findOne({ where: { id: input.salesRoleId } })
        const user = await User.findOne({ where: { id: req.session.userId } })

        if (!customer) {
            return {
                errors: [
                    {
                        field: "customer",
                        message: "Error! ไม่พบ Customer ID"
                    }
                ]
            }
        }
        if (!salesRole) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "Error! ไม่พบ SalesRole ID"
                    }
                ]
            }
        }
        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID"
                    }
                ]
            }
        }
        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID"
                    }
                ]
            }
        }
        if (input.title.length <= 5) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }
        if (input.detail.length <= 3) {
            return {
                errors: [
                    {
                        field: "channel",
                        message: "ความยาวต้องมากกว่า 3"
                    }
                ]
            }
        }

        const { title, detail, actual, branch, customerId, userId, salesRoleId } = input
        await SalesActual.create({
            title,
            detail,
            actual,
            branch,
            customerId,
            userId,
            salesRoleId,
        }).save()

        const salesActual = await getConnection()
            .getRepository(SalesActual)
            .createQueryBuilder("sa")
            .orderBy('sa.id', "DESC")
            .getMany()

        return { salesActual }
    }

    @Mutation(() => Boolean)
    async deleteSalesActual(
        @Arg("id", () => Int) id: number
    ): Promise<boolean> {
        await SalesActual.delete(id)
        return true
    }

    @Mutation(() => Boolean)
    async deleteSalesRole(
        @Arg("id", () => Int) id: number
    ): Promise<boolean> {
        await SalesRole.delete(id)
        return true
    }


    // ------------------------------------------- TARGET ------------------------------------------------
    @Query(() => [SalesTarget], { nullable: true })
    async targetByRoleId(
        @Arg("salesRoleId", () => Int) salesRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const target = getConnection()
            .getRepository(SalesTarget)
            .createQueryBuilder("t")
            .orderBy('t.year', "DESC")
            .where("t.salesRoleId = :salesRoleId", { salesRoleId })

        return await target.getMany()
    }


    @Mutation(() => SalesTarget_Response)
    async createSalesTarget(
        @Arg("input") input: SalesTarget_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget_Response> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (!input.year) {
            return {
                errors: [
                    {
                        field: "year",
                        message: "โปรดใส่ปีให้ถูกต้อง"
                    }
                ]
            }
        }
        if (!input.value) {
            return {
                errors: [
                    {
                        field: "value",
                        message: "โปรดใส่ Target"
                    }
                ]
            }
        }

        await SalesTarget.create({
            year: input.year,
            value: input.value,
            branch: input.branch,
            salesRoleId: input.salesRoleId
        }).save()

        const salesTargets = await getConnection()
            .getRepository(SalesTarget)
            .createQueryBuilder("t")
            .orderBy('t.year', "DESC")
            .where("t.salesRoleId = :salesRoleId", { salesRoleId: input.salesRoleId })
            .getMany()

        return { salesTargets }
    }

    // ------------------------------------------- ISSUE ------------------------------------------------
    @Query(() => [SalesIssue], { nullable: true })
    async issueByRoleId(
        @Arg("salesRoleId", () => Int) salesRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const issue = getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy('i.createdAt', "DESC")
            .where("i.salesRoleId = :salesRoleId", { salesRoleId })

        return await issue.getMany()
    }


    @Mutation(() => SalesIssue_Response)
    async createSalesIssue(
        @Arg("input") input: SalesIssue_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue_Response> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (input.title.length < 1) {
            return {
                errors: [
                    {
                        field: "title",
                        message: "โปรดใส่ข้อมูล"
                    }
                ]
            }
        }
        if (input.detail.length < 1) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "โปรดใส่ข้อมูล"
                    }
                ]
            }
        }
        if (input.branch.length < 1) {
            return {
                errors: [
                    {
                        field: "branch",
                        message: "โปรดใส่ข้อมูล"
                    }
                ]
            }
        }
        if (!input.value) {
            return {
                errors: [
                    {
                        field: "value",
                        message: "โปรดใส่ข้อมูล"
                    }
                ]
            }
        }
        if (input.contact.length < 1) {
            return {
                errors: [
                    {
                        field: "contact",
                        message: "โปรดใส่ข้อมูล"
                    }
                ]
            }
        }
        const { title, detail, brand, size, model, value, branch, status, contact, salesRoleId } = input
        await SalesIssue.create({
            title,
            detail,
            brand,
            size,
            model,
            value,
            branch,
            status,
            contact,
            salesRoleId
        }).save()

        const salesIssues = await getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy('i.createdAt', "DESC")
            .where("i.salesRoleId = :salesRoleId", { salesRoleId: input.salesRoleId })
            .getMany()

        return { salesIssues }
    }
}