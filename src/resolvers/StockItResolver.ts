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
import { GraphQLUpload } from 'graphql-upload'
import { join, parse } from "path";
import { createWriteStream } from "fs";

import { URL } from '../config'
import {
    Upload,
    // FIXME: StatusItem, 
    // StatusOrder 
} from "../types";
import { StockIt, StockItOrder, User } from "../entities";

@InputType()
class StockItInput {
    @Field()
    itemName: string
    @Field()
    detail: string
    @Field()
    location: string
    @Field()
    serialNum: string
    @Field()
    warranty: string
    @Field()
    price: number
    @Field()
    branch: string
    @Field()
    brand: string
    @Field()
    category: string
}

@InputType()
class StockItOrderInput {
    @Field({ nullable: true })
    detail?: string
    @Field()
    stockItId: number
    @Field()
    holdStatus: string
}

@ObjectType()
class FieldErrorStockIt {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class StockItResponse {
    @Field(() => [FieldErrorStockIt], { nullable: true })
    errors?: FieldErrorStockIt[];

    @Field(() => [StockIt], { nullable: true })
    stockIt?: StockIt[];
}

@ObjectType()
class StockItOrderResponse {
    @Field(() => [FieldErrorStockIt], { nullable: true })
    errors?: FieldErrorStockIt[];

    @Field(() => [StockItOrder], { nullable: true })
    stockItOrder?: StockItOrder[];
}

@ObjectType()
class UpdateStockItResponse {
    @Field(() => [FieldErrorStockIt], { nullable: true })
    errors?: FieldErrorStockIt[];

    @Field(() => StockIt, { nullable: true })
    stockIt?: StockIt;
}

@Resolver()
export class StockItResolver {
    @Query(() => [StockIt], { nullable: true })
    async stockIts(@Ctx() { req }: MyContext): Promise<StockIt[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const give = getConnection()
            .getRepository(StockIt)
            .createQueryBuilder("stock")
            .orderBy('stock.createdAt', "DESC")

        return await give.getMany()
    }

    @Query(() => StockIt)
    async stockItById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<StockIt | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return StockIt.findOne(id);
    }

    @Mutation(() => StockItResponse)
    async createStockIt(
        @Arg("input") input: StockItInput,
        @Arg('options', () => GraphQLUpload)
        {
            filename,
            createReadStream
        }: Upload,
        @Ctx() { req }: MyContext
    ): Promise<StockItResponse> {
        if (!req.session.userId) throw new Error("Please Login.")

        const user = await User.findOne({ where: { id: req.session.userId } })
        if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
            throw new Error("ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้")
        }
        //------------------------ GraphQLUpload ------------------
        let stream = createReadStream()

        let {
            ext,
            name
        } = parse(filename)

        name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');


        let serverFile = join(
            __dirname, `../../dist/images/stockIt/${name}-${Date.now()}${ext}`
        );

        serverFile = serverFile.replace(' ', '_');

        let writeStream = await createWriteStream(serverFile);

        await stream.pipe(writeStream);

        serverFile = `${URL}${serverFile.split('images')[1]}`;

        //------------------------ GiveInput ------------------
        if (input.itemName.length <= 3) {
            return {
                errors: [
                    {
                        field: "itemName",
                        message: "ความยาวต้องมากกว่า 3"
                    }
                ]
            }
        }
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
        if (input.serialNum.length <= 3) {
            return {
                errors: [
                    {
                        field: "serialNum",
                        message: "ความยาวต้องมากกว่า 3"
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
        await StockIt.create({
            itemName: input.itemName,
            detail: input.detail,
            location: input.location,
            serialNum: input.serialNum,
            warranty: input.warranty,
            price: input.price,
            branch: input.branch,
            brand: input.brand,
            category: input.category,
            imageUrl: serverFile
        }).save();

        const stockIt = await StockIt.find()

        return { stockIt }
    }

    @Mutation(() => UpdateStockItResponse)
    async updateStockIt(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: StockItInput,
        @Ctx() { req }: MyContext
    ): Promise<UpdateStockItResponse | null> {
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const stockIt = await StockIt.findOne(id)
        if (!stockIt) throw new Error("Error! stockIt not found.")

        if (input.itemName.length <= 3) {
            return {
                errors: [
                    {
                        field: "itemName",
                        message: "ความยาวต้องมากกว่า 3"
                    }
                ]
            }
        }
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
        if (input.serialNum.length <= 3) {
            return {
                errors: [
                    {
                        field: "serialNum",
                        message: "ความยาวต้องมากกว่า 3"
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

        // if (input.status === "Success") {
        //     stockIt.status = StatusOrder.SUCCESS
        // } else if (input.status === "Preparing") {
        //     stockIt.status = StatusOrder.PREPARING
        // } else {
        //     stockIt.status = StatusOrder.NEW
        // }

        stockIt.itemName = input.itemName
        stockIt.detail = input.detail,
            stockIt.location = input.location,
            stockIt.serialNum = input.serialNum,
            stockIt.warranty = input.warranty,
            stockIt.price = input.price,
            stockIt.branch = input.branch,
            stockIt.brand = input.brand,
            stockIt.category = input.category,
            await stockIt.save();

        return { stockIt }

    }

    @Mutation(() => Boolean)
    async deleteStockIt(
        @Arg("id", () => Int) id: number
    ): Promise<boolean> {
        await StockItOrder.delete({ stockItId: id })
        await StockIt.delete(id)
        return true
    }

    // @Mutation(() => StockItResponse)
    // async deleteStockIt(
    //     @Arg("id", () => Int) id: number,
    //     @Ctx() { req }: MyContext
    // ): Promise<StockItResponse> {
    //     if (!req.session.userId) {
    //         return {
    //             errors: [
    //                 {
    //                     field: "userId",
    //                     message: "โปรด Login"
    //                 }
    //             ]
    //         }
    //     } const user = await User.findOne({ where: { id: req.session.userId } })
    //     if (user?.roles === "client-LKB" || user?.roles === "client-CDC" || user?.roles === "jobEditor") {
    //         return {
    //             errors: [
    //                 {
    //                     field: "imageUrl",
    //                     message: "ต้องเป็น Admin และ SuperAdmin เท่านั้นถึงจะใช้งาน Function นี้ได้"
    //                 }
    //             ]
    //         }
    //     }

    //     await StockIt.delete({id})
    //     const stockIt = await StockIt.find()

    //     return { stockIt }
    // }

    // ---------------------------------------------------------------------------- Order ---------------------------------------------------------------------
    @Query(() => [StockItOrder], { nullable: true })
    async stockItOrders(): Promise<StockItOrder[] | undefined> {
        const item = getConnection()
            .getRepository(StockItOrder)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        return item.getMany()
    }

    @Query(() => StockItOrder)
    async stockItOrderById(@Arg("id", () => Int) id: number): Promise<StockItOrder | undefined> {
        return StockItOrder.findOne(id);
    }

    @Mutation(() => StockItOrderResponse)
    async createStockItOrder(
        @Arg("input") input: StockItOrderInput,
        @Ctx() { req }: MyContext
    ): Promise<StockItOrderResponse> {
        if (!req.session.userId) throw new Error("Please Login.")
        const user = await User.findOne({ where: { id: req.session.userId } })
        // const stockIt = await StockIt.findOne({ where: { id: input.stockItId } })

        let branch = ""
        if (user?.roles === "client-LKB") {
            branch = "ลาดกระบัง"
        } else {
            branch = "ชลบุรี"
        }

        let num = 0
        if (input.holdStatus === "คืน") {
            num = 1
        } else {
            num = 0
        }

        console.log(num)

        // stockIt.inventory = num

        await StockItOrder.create({
            detail: input.detail,
            branch,
            creatorId: req.session.userId,
            stockItId: input.stockItId,
            holdStatus: input.holdStatus
        }).save();

        const stockItOrder = await StockItOrder.find()

        return { stockItOrder }
    }

    @Mutation(() => Boolean)
    async deleteStockItOrder(@Arg("id", () => Int) id: number) {
        await StockItOrder.delete(id)
        return true
    }
}