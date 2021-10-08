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

import { Upload } from "../types";
import { StockIt, User } from "../entities";

@InputType()
class StockIt_Input {
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
    inventory: number
    @Field()
    branch: string
    @Field()
    brand: string
    @Field()
    category: string
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
        @Arg("input") input: StockIt_Input,
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



        try {
            await StockIt.create({
            ...input,
                imageUrl: serverFile
        }).save();
        } catch (err) {
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: "serialNum",
                            message: "Serial Number already taken!"
                        }
                    ]
                }
            }
        }

        const stockIt = await StockIt.find()

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