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
import { GraphQLUpload } from 'graphql-upload'
import { getConnection } from "typeorm"

import { User, Give, GiveOrder, GiveCdc, GiveOrderCdc, GiveCategory } from "../entities";
import { Upload, StatusGive } from "../types";
import { createWriteStream } from "fs";
import { join, parse } from "path";
import { URL } from '../config'

type categoryGive = "USB" | "สมุด" | "ปากกา" | "พวงกุญแจ" | "เหล้า" | "ขนม";

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
class GiveCdcResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => [GiveCdc], { nullable: true })
    give?: GiveCdc[];
}

@ObjectType()
class UpdateGiveResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => Give, { nullable: true })
    give?: Give;
}
@ObjectType()
class UpdateGiveCdcResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => GiveCdc, { nullable: true })
    give?: GiveCdc;
}

@ObjectType()
class GiveOrderResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => [GiveOrder], { nullable: true })
    giveOrder?: GiveOrder[];
}
@ObjectType()
class GiveOrderCdcResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => [GiveOrderCdc], { nullable: true })
    giveOrder?: GiveOrderCdc[];
}

@ObjectType()
class UpdateGiveOrderResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => GiveOrder, { nullable: true })
    giveOrder?: GiveOrder;
}

@ObjectType()
class UpdateGiveOrderCdcResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => GiveOrderCdc, { nullable: true })
    giveOrder?: GiveOrderCdc;
}

@ObjectType()
class GiveCatResponse {
    @Field(() => [FieldErrorGive], { nullable: true })
    errors?: FieldErrorGive[];

    @Field(() => [GiveCategory], { nullable: true })
    giveCat?: GiveCategory[];
}

@Resolver()
export class GiveOrderResolver {
    //-------------------------------------------Give-------------------------------------------
    @Query(() => [Give], { nullable: true })
    async gives(@Ctx() { req }: MyContext): Promise<Give[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        // return Give.find();
        const give = getConnection()
            .getRepository(Give)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return await give.getMany()
    }

    @Query(() => [GiveCdc], { nullable: true })
    async givesCdc(@Ctx() { req }: MyContext): Promise<GiveCdc[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        // return Give.find();
        const give = getConnection()
            .getRepository(GiveCdc)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return await give.getMany()
    }

    @Query(() => Give)
    async giveById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Give | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return Give.findOne(id);
    }

    @Query(() => GiveCdc)
    async giveByIdCdc(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<GiveCdc | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return GiveCdc.findOne(id);
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

    @Mutation(() => GiveCdcResponse)
    async createGiveCdc(
        @Arg("input") input: GiveInput,
        @Arg('options', () => GraphQLUpload)
        {
            filename,
            createReadStream
        }: Upload,
        @Ctx() { req }: MyContext
    ): Promise<GiveCdcResponse> {
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
            __dirname, `../../dist/images/givesCdc/${name}-${Date.now()}${ext}`
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
        await GiveCdc.create({
            giveName: input.giveName,
            details: input.details,
            price: input.price,
            inventory: input.inventory,
            category: input.category,
            imageUrl: serverFile
        }).save();

        const give = await GiveCdc.find()

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

    @Mutation(() => UpdateGiveCdcResponse)
    async updateGiveCdc(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: GiveInput,
        @Ctx() { req }: MyContext
    ): Promise<UpdateGiveCdcResponse | null> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const give = await GiveCdc.findOne(id)
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

    @Mutation(() => GiveCdcResponse)
    async deleteGiveCdc(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<GiveCdcResponse> {
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

        await GiveOrderCdc.delete({ giveId: id })
        const response = await GiveCdc.delete({ id })

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

        const give = await GiveCdc.find()

        return { give }
    }

    //-------------------------------------------Orders-------------------------------------------
    @Query(() => [GiveOrder], { nullable: true })
    async giveOrders(): Promise<GiveOrder[] | undefined> {
        // return GiveOrder.find();
        const orders = getConnection()
            .getRepository(GiveOrder)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return orders.getMany()
    }
    @Query(() => [GiveOrderCdc], { nullable: true })
    async giveOrdersCdc(): Promise<GiveOrderCdc[] | undefined> {
        // return GiveOrder.find();
        const orders = getConnection()
            .getRepository(GiveOrderCdc)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return await orders.getMany()
    }

    @Query(() => GiveOrder)
    async giveOrderById(@Arg("id", () => Int) id: number): Promise<GiveOrder | undefined> {
        return GiveOrder.findOne(id);
    }

    @Query(() => GiveOrderCdc)
    async giveOrderByIdCdc(@Arg("id", () => Int) id: number): Promise<GiveOrderCdc | undefined> {
        return GiveOrderCdc.findOne(id);
    }

    @Query(() => [GiveOrder])
    async giveOrderByCreatorId(@Ctx() { req }: MyContext): Promise<GiveOrder[] | undefined> {
        if (!req.session.userId) throw new Error("กรุณา Login.")
        // return await GiveOrder.find({ creatorId: req.session.userId });

        const orders = getConnection()
            .getRepository(GiveOrder)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        if (req.session.userId) {
            orders.where("g.creatorId = :id", { id: req.session.userId })
        }


        return orders.getMany()
    }

    @Query(() => [GiveOrderCdc])
    async giveOrderByCreatorIdCdc(@Ctx() { req }: MyContext): Promise<GiveOrderCdc[] | undefined> {
        if (!req.session.userId) throw new Error("กรุณา Login.")
        // return await GiveOrder.find({ creatorId: req.session.userId });

        const orders = getConnection()
            .getRepository(GiveOrderCdc)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        if (req.session.userId) {
            orders.where("g.creatorId = :id", { id: req.session.userId })
        }


        return orders.getMany()
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

        await GiveOrder.create({
            creatorId: req.session.userId,
            giveId: input.giveId,
            amount: input.amount,
            customerId: input.customerId,
            customerDetail: input.customerDetail,
            price: give.price * input.amount,
        }).save();

        const giveOrder = await GiveOrder.find()

        return { giveOrder }
    }

    @Mutation(() => GiveOrderCdcResponse)
    async createGiveOrderCdc(
        @Arg("input") input: giveOrderInput,
        @Ctx() { req }: MyContext
    ): Promise<GiveOrderCdcResponse> {
        if (!req.session.userId) throw new Error("Please Login.")

        const give = await GiveCdc.findOne(input.giveId);
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

        await GiveOrderCdc.create({
            creatorId: req.session.userId,
            giveId: input.giveId,
            amount: input.amount,
            customerId: input.customerId,
            customerDetail: input.customerDetail,
            price: give.price * input.amount,
        }).save();

        const giveOrder = await GiveOrderCdc.find()

        return { giveOrder }
    }

    @Mutation(() => UpdateGiveOrderResponse)
    async updateGiveOrder(
        @Arg("id", () => Int) id: number,
        @Arg("newStatus") newStatus: StatusGive,
        @Ctx() { req }: MyContext
    ): Promise<UpdateGiveOrderResponse> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }

        const order = await GiveOrder.findOne({ id })
        if (!order) throw new Error("Order not found.")

        order.status = newStatus
        const giveOrder = await order.save()

        return { giveOrder }
    }

    @Mutation(() => UpdateGiveOrderCdcResponse)
    async updateGiveOrderCdc(
        @Arg("id", () => Int) id: number,
        @Arg("newStatus") newStatus: StatusGive,
        @Ctx() { req }: MyContext
    ): Promise<UpdateGiveOrderCdcResponse> {
        if (!req.session.userId) throw new Error("โปรด Login")
        const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }

        const order = await GiveOrderCdc.findOne({ id })
        if (!order) throw new Error("Order not found.")

        order.status = newStatus
        const giveOrder = await order.save()

        return { giveOrder }
    }

    @Mutation(() => Boolean)
    async deleteGiveOrder(@Arg("id", () => Int) id: number) {
        await GiveOrder.delete({ id })
        return true
    }

    @Mutation(() => Boolean)
    async deleteGiveOrderCdc(@Arg("id", () => Int) id: number) {
        await GiveOrderCdc.delete({ id })
        return true
    }


    //-------------------------------------------Category-------------------------------------------
    @Query(() => [GiveCategory], { nullable: true })
    async giveCategories(@Ctx() { req }: MyContext): Promise<GiveCategory[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const giveCategories = getConnection()
            .getRepository(GiveCategory)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return await giveCategories.getMany()
    }

    @Mutation(() => GiveCatResponse)
    async createGiveCat(
        @Arg('catName') catName: string,
        @Ctx() { req }: MyContext
    ): Promise<GiveCatResponse | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (catName.length <= 2) {
            return {
                errors: [
                    {
                        field: "catName",
                        message: "ความยาวต้องมากกว่า 2"
                    }
                ]
            }
        }

        let giveCat
        try {
            await GiveCategory.create({ catName }).save()

            const giveCategories = getConnection()
                .getRepository(GiveCategory)
                .createQueryBuilder("g")
                .orderBy('g.createdAt', "DESC")

            giveCat = await giveCategories.getMany()
        } catch (err) {
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: "catName",
                            message: "Error! ไม่สามรถดำเนิกการได้ กลุ่มสินค้านี้มีอยู่แล้ว"
                        }
                    ]
                }
            }
        }
        return { giveCat }


    }

    @Mutation(() => Boolean)
    async deleteGiveCat(@Arg("id", () => Int) id: number) {
        await GiveCategory.delete({ id })
        return true
    }
}
