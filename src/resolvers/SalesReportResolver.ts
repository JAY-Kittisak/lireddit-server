import { MyContext } from "../types";
import {
    Field,
    InputType,
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    // Int,
    ObjectType,
} from "type-graphql";
import { getConnection } from "typeorm"

import { SalesRole, User } from "../entities"
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
            .orderBy('s.salesRole', "DESC")

        return await role.getMany()
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
        if (input.salesRole.length > 7) {
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
}