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
    ObjectType,
} from "type-graphql";
import { GraphQLUpload } from 'graphql-upload'

import { User, Give, GiveOrder } from "../entities";
import { Upload, StatusGive } from "../types";
import { createWriteStream } from "fs";
import { join, parse } from "path";
import { URL } from '../config'

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
    async createGive(
        @Arg("input") input: GiveInput,
        @Arg('options', () => GraphQLUpload)
        {
            filename,
            createReadStream
        }: Upload,
        @Ctx() { req }: MyContext
    ): Promise<GiveResponse> {
        if (!req.session.userId) {
            return {
                errors: [
                    {
                        field: "userId",
                        message: "โปรด Login"
                    }
                ]
            }
        }
        const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            return {
                errors: [
                    {
                        field: "imageUrl",
                        message: "ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้"
                    }
                ]
            }
        }
        //------------------------ GraphQLUpload ------------------
        let stream = createReadStream()

        let {
            ext,
            name
        } = parse(filename)

        name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');


        let serverFile = join(
            __dirname, `../../dist/images/gives/${name}-${Date.now()}${ext}`
        );

        serverFile = serverFile.replace(' ', '_');

        let writeStream = await createWriteStream(serverFile);

        await stream.pipe(writeStream);

        serverFile = `${URL}${serverFile.split('images')[1]}`;

        //------------------------ GiveInput ------------------
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

        //ก่อนมีการ Upload รูปภาพ await Give.create({ ...input }).save();
        await Give.create({
            giveName: input.giveName,
            details: input.details,
            price: input.price,
            inventory: input.inventory,
            category: input.category,
            imageUrl: serverFile
        }).save();

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

    @Mutation(() => GiveResponse)
    async deleteGive(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<GiveResponse> {
        if (!req.session.userId) {
            return {
                errors: [
                    {
                        field: "userId",
                        message: "โปรด Login"
                    }
                ]
            }
        } const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            return {
                errors: [
                    {
                        field: "imageUrl",
                        message: "ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้"
                    }
                ]
            }
        }

        await GiveOrder.delete({ giveId: id })
        const response = await Give.delete({ id })

        if (!response) {
            return {
                errors: [
                    {
                        field: "response",
                        message: "response Error."
                    }
                ]
            }
        }

        const give = await Give.find()

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

    @Query(() => [GiveOrder])
    async giveOrderByCreatorId(@Ctx() { req }: MyContext): Promise<GiveOrder[] | undefined> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        return await GiveOrder.find({ creatorId: req.session.userId });
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
    async updateGiveOrder(
        @Arg("id", () => Int) id: number,
        @Arg("newStatus") newStatus: StatusGive,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }

        const order = await GiveOrder.findOne({ id })
        if (!order) throw new Error("Order not found.")

        order.status = newStatus
        await order.save()

        return true
    }

    @Mutation(() => Boolean)
    async deleteGiveOrder(@Arg("id", () => Int) id: number) {
        await GiveOrder.delete({ id })
        return true
    }
}