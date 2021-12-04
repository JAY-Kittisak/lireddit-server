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

import { SalesRole, User, SalesActual, Customer } from "../entities"
import { CurrentStatus, Branch } from "../types"

@InputType()
class SalesRole_Input {
    @Field()
    salesRole: string
    @Field()
    channel: string
    @Field()
    targetId: number
    @Field()
    branch: Branch
    @Field()
    status: CurrentStatus
    @Field()
    userId: number
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
    salesRole?: SalesRole[];
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
            targetId: input.targetId,
            channel: input.channel,
            branch: input.branch,
            status: input.status,
            userId: input.userId,
        }).save()

        const salesRole = await getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy('s.salesRole', "DESC")
            .getMany()

        return { salesRole }
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
}