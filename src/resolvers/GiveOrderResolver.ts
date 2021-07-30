import { MyContext } from "src/types";
import {
    Field,
    InputType,
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    Int,
    ObjectType
} from "type-graphql";
import { Give } from "../entities/giveaways/Give";
import { GiveOrder } from "../entities/giveaways/GiveOrder";
// import { ApolloError } from "apollo-server-express";

type categoryGive = "USB" | "สมุด" | "ปากกา";

@InputType()
class GiveInput {
    @Field()
    giveName: string;
    @Field({ nullable: true })
    details: string;
    @Field({ nullable: true })
    price: number;
    @Field({ nullable: true })
    inventory: number;
    @Field({ nullable: true })
    category: categoryGive;
}

@InputType()
class giveOrderInput {
    @Field()
    giveId: number;
    @Field()
    amount: number;
    @Field({ nullable: true })
    customerId: number;
    @Field({ nullable: true })
    customerDetail: string;
}

@ObjectType()
class FieldErrorGive {
    @Field({ nullable: true })
    field?: string;
    @Field()
    message: string;
}

@ObjectType()
class GiveOrderResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => GiveOrder, { nullable: true })
    giveOrder?: GiveOrder;
}

@Resolver()
export class GiveOrderResolver {
    //------Give------
    @Query(() => [Give], { nullable: true })
    gives(): Promise<Give[] | undefined> {
        return Give.find();
    }

    @Query(() => [GiveOrder], { nullable: true })
    giveOrders(): Promise<GiveOrder[] | undefined> {
        return GiveOrder.find();
    }

    @Mutation(() => Give)
    async createGive(@Arg("input") input: GiveInput): Promise<Give> {
        return Give.create({ ...input }).save();
    }

    //------Orders------
    @Mutation(() => GiveOrderResponse)
    async createGiveOrder(
        @Arg("input") input: giveOrderInput,
        @Ctx() { req }: MyContext
    ): Promise<GiveOrderResponse> {
        if (!req.session.userId) {
            return {
                errors: [{ message: "Please Login." }]
            }
        }

        const give = await Give.findOne(input.giveId);
        if (!give) {
            return {
                errors: [
                    {
                        field: "giveId",
                        message: "ไม่พบของแจงที่คุณเลือก"
                    }
                ]
            }
        }

        give.inventory = give.inventory - input.amount;
        if (give.inventory < 0) {
            return {
                errors: [
                    {
                        field: "amount",
                        message: "จำนวนที่คุณขอมามากว่าจำนวนที่เรามี"
                    }
                ]
            }
        }
        await give.save();

        const giveOrder = await GiveOrder.create({
            creatorId: req.session.userId,
            giveId: input.giveId,
            amount: input.amount,
            customerId: input.customerId,
            customerDetail: input.customerDetail,
            price: give.price * input.amount,
        }).save();

        return { giveOrder }
    }

    @Mutation(() => Boolean)
    async deleteGive(@Arg("giveId", () => Int) giveId: number) {
        await GiveOrder.delete({ giveId })
        await Give.delete({ id: giveId })
        return true
    }
}
