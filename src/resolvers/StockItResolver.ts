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
import { Upload, StatusItem, StatusOrder } from "../types";
import { StockIt, User } from "../entities";

@InputType()
class StockItInput {
    @Field()
    itemName: string
    @Field()
    details: string
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
    @Field({ nullable: true })
    useById?: number
    @Field({ nullable: true })
    holdStatus?: StatusItem
    @Field({ nullable: true })
    status?: string
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
            details: input.details,
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

        if (input.holdStatus === "เบิก") {
            stockIt.holdStatus = StatusItem.WITHDRAW
        } else if (input.holdStatus === "ยืม") {
            stockIt.holdStatus = StatusItem.BORROW
        } else {
            stockIt.holdStatus = StatusItem.UNOCCUPIED
        }

        if (input.status === "Success") {
            stockIt.status = StatusOrder.SUCCESS
        } else if (input.status === "Preparing") {
            stockIt.status = StatusOrder.PREPARING
        } else {
            stockIt.status = StatusOrder.NEW
        }

        // try {
        stockIt.itemName = input.itemName
        stockIt.details = input.details,
            stockIt.location = input.location,
            stockIt.serialNum = input.serialNum,
            stockIt.warranty = input.warranty,
            stockIt.price = input.price,
            stockIt.branch = input.branch,
            stockIt.brand = input.brand,
            stockIt.category = input.category,
            stockIt.useById = input.useById

        await stockIt.save();
        // } catch (err) {
        //     if (err.code === '23505') {
        //         return {
        //             errors: [
        //                 {
        //                     field: "serialNum",
        //                     message: "Serial Number already taken!"
        //                 }
        //             ]
        //         }
        //     }
        // }

        return { stockIt }

    }

    @Mutation(() => Boolean)
    async deleteStockIt(
        @Arg("id") id: number
    ): Promise<boolean> {
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
}