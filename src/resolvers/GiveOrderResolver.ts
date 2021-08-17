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

type categoryGive = "USB" | "สมุด" | "ปากกา";

@InputType()
class GiveInput {
    @Field()
    giveName: string;
    @Field()
    details: string;
    @Field()
    price: number;
    @Field()
    inventory: number;
    @Field()
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
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class GiveResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => [Give], { nullable: true })
    give?: Give[];
}

@ObjectType()
class UpdateGiveResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => Give, { nullable: true })
    give?: Give;
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
    //-------------------------------------------Give-------------------------------------------
    @Query(() => [Give], { nullable: true })
    gives(): Promise<Give[] | undefined> {
        return Give.find();
    }

    @Query(() => Give)
    giveById(@Arg("id", () => Int) id: number): Promise<Give | undefined> {
        return Give.findOne(id);
    }

    @Mutation(() => GiveResponse)
    async createGive(@Arg("input") input: GiveInput): Promise<GiveResponse> {
        if (input.giveName.length <= 2) {
            return {
                errors: [
                    {
                        field: "giveName",
                        message: "ความยาวต้องมากกว่า 2"
                    }
                ]
            }
        }
        if (input.details.length <= 5) {
            return {
                errors: [
                    {
                        field: "details",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }
        if (input.price < 0) {
            return {
                errors: [
                    {
                        field: "price",
                        message: "ราคาน้อยกว่า 0 ไม่ได้"
                    }
                ]
            }
        }

        if (input.inventory < 0) {
            return {
                errors: [
                    {
                        field: "inventory",
                        message: "จำนวนที่มีใน Stock น้อยกว่า 0 ไม่ได้"
                    }
                ]
            }
        }

        await Give.create({ ...input }).save();

        const give = await Give.find()

        return { give }
    }

    @Mutation(() => UpdateGiveResponse)
    async updateGive(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: GiveInput,
        @Ctx() { req }: MyContext
    ): Promise<UpdateGiveResponse | null> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const give = await Give.findOne(id)
        if (!give) throw new Error("Give not found.")

        if (input.giveName.length <= 2) {
            return {
                errors: [
                    {
                        field: "giveName",
                        message: "ความยาวต้องมากกว่า 2"
                    }
                ]
            }
        }
        if (input.details.length <= 5) {
            return {
                errors: [
                    {
                        field: "details",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }
        if (input.price < 0) {
            return {
                errors: [
                    {
                        field: "price",
                        message: "ราคาน้อยกว่า 0 ไม่ได้"
                    }
                ]
            }
        }

        if (input.inventory < 0) {
            return {
                errors: [
                    {
                        field: "inventory",
                        message: "จำนวนที่มีใน Stock น้อยกว่า 0 ไม่ได้"
                    }
                ]
            }
        }

        give.giveName = input.giveName
        give.details = input.details
        give.price = input.price
        give.inventory = input.inventory
        give.category = input.category

        await give.save()

        // const give = await Give.find()

        return { give }
    }

    //-------------------------------------------Orders-------------------------------------------
    @Query(() => [GiveOrder], { nullable: true })
    giveOrders(): Promise<GiveOrder[] | undefined> {
        return GiveOrder.find();
    }

    @Query(() => GiveOrder)
    giveOrderById(@Arg("id", () => Int) id: number): Promise<GiveOrder | undefined> {
        return GiveOrder.findOne(id);
    }

    @Mutation(() => GiveOrderResponse)
    async createGiveOrder(
        @Arg("input") input: giveOrderInput,
        @Ctx() { req }: MyContext
    ): Promise<GiveOrderResponse> {
        if (!req.session.userId) throw new Error("Please Login.")

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
    async deleteGive(@Arg("id", () => Int) id: number) {
        await GiveOrder.delete({ giveId: id })
        await Give.delete({ id })
        return true
    }

    @Mutation(() => Boolean)
    async deleteGiveOrder(@Arg("id", () => Int) id: number) {
        await GiveOrder.delete({ id })
        return true
    }
}
