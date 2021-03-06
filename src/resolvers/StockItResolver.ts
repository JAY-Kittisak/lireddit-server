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
    CurrentStatus,
    StatusItem,
    StatusOrder
} from "../types";
import { StockIt, StockItOrder, User } from "../entities";
const { lineNotifyToDevGroup } = require('../notify')

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
    @Field()
    currentStatus: CurrentStatus
}

@InputType()
class StockItOrderInput {
    @Field({ nullable: true })
    detail?: string
    @Field()
    stockItId: number
    @Field()
    holdStatus: StatusItem
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
@ObjectType()
class UpdateStockItOrResponse {
    @Field(() => [FieldErrorStockIt], { nullable: true })
    errors?: FieldErrorStockIt[];

    @Field(() => StockItOrder, { nullable: true })
    stockItOrder?: StockItOrder;
}

@Resolver()
export class StockItResolver {
    @Query(() => [StockIt], { nullable: true })
    async stockIts(@Ctx() { req }: MyContext): Promise<StockIt[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const item = getConnection()
            .getRepository(StockIt)
            .createQueryBuilder("stock")
            .orderBy('stock.createdAt', "DESC")

        return await item.getMany()
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
            throw new Error("???????????????????????? Admin ????????? SuperAdmin ????????????????????????????????????????????????????????? Function ??????????????????")
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
                        message: "?????????????????????????????????????????????????????? 3"
                    }
                ]
            }
        }
        if (input.detail.length <= 5) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "?????????????????????????????????????????????????????? 5"
                    }
                ]
            }
        }
        if (input.serialNum.length <= 3) {
            return {
                errors: [
                    {
                        field: "serialNum",
                        message: "?????????????????????????????????????????????????????? 3"
                    }
                ]
            }
        }
        if (input.price < 0) {
            return {
                errors: [
                    {
                        field: "price",
                        message: "???????????????????????????????????? 0 ??????????????????"
                    }
                ]
            }
        }

        await StockIt.create({
            ...input,
            imageUrl: serverFile
        }).save();

        const item = getConnection()
            .getRepository(StockIt)
            .createQueryBuilder("stock")
            .orderBy('stock.createdAt', "DESC")

        const stockIt = await item.getMany()

        return { stockIt }
    }

    @Mutation(() => UpdateStockItResponse)
    async updateStockIt(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: StockItInput,
        @Ctx() { req }: MyContext
    ): Promise<UpdateStockItResponse | null> {
        if (!req.session.userId) throw new Error("??????????????? Login.")

        const stockIt = await StockIt.findOne(id)
        if (!stockIt) throw new Error("Error! stockIt not found.")

        if (input.itemName.length <= 3) {
            return {
                errors: [
                    {
                        field: "itemName",
                        message: "?????????????????????????????????????????????????????? 3"
                    }
                ]
            }
        }
        if (input.detail.length <= 5) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "?????????????????????????????????????????????????????? 5"
                    }
                ]
            }
        }
        if (input.serialNum.length <= 3) {
            return {
                errors: [
                    {
                        field: "serialNum",
                        message: "?????????????????????????????????????????????????????? 3"
                    }
                ]
            }
        }
        if (input.price < 0) {
            return {
                errors: [
                    {
                        field: "price",
                        message: "???????????????????????????????????? 0 ??????????????????"
                    }
                ]
            }
        }

        stockIt.itemName = input.itemName
        stockIt.detail = input.detail,
            stockIt.location = input.location,
            stockIt.serialNum = input.serialNum,
            stockIt.warranty = input.warranty,
            stockIt.price = input.price,
            stockIt.branch = input.branch,
            stockIt.brand = input.brand,
            stockIt.category = input.category,
            stockIt.currentStatus = input.currentStatus,
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

    // ---------------------------------------------------------------------------- Order ---------------------------------------------------------------------
    @Query(() => [StockItOrder], { nullable: true })
    async stockItOrders(
        @Arg("createBy", () => Boolean) createBy: boolean,
        @Ctx() { req }: MyContext
    ): Promise<StockItOrder[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const item = getConnection()
            .getRepository(StockItOrder)
            .createQueryBuilder("g")
            .orderBy('g.createdAt', "DESC")

        if (createBy) {
            item.where("g.creatorId = :id", { id: req.session.userId })
        }

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

        let branch = ""
        if (user?.roles === "client-LKB") {
            branch = "???????????????????????????"
        } else {
            branch = "??????????????????"
        }

        const item = await StockIt.findOne({ id: input.stockItId })
        if (!item) throw new Error("item not found.")

        if (item.currentStatus === "??????????????????") {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "Error! ??????????????????????????????????????????????????????????????????????????????"
                    }
                ]
            }
        }

        item.currentStatus = CurrentStatus.ACTIVE
        await item.save()

        const data = await StockItOrder.create({
            detail: input.detail,
            branch,
            creatorId: req.session.userId,
            stockItId: input.stockItId,
            holdStatus: input.holdStatus
        }).save();

        const route = "/admin/stock-it-orders/"

        lineNotifyToDevGroup(
            `${(await input.holdStatus)} ????????????????????? IT\nUser: ${await user?.fullNameTH} ????????????: ${await user?.roles}\n?????????????????????????????????: ${await item.itemName}\n?????????????????????????????????????????? ${(await item.location)}  ????????????: ${(await item.branch)}  \n`, route, data.id, item.imageUrl
        )

        const stockItOrder = await StockItOrder.find()

        return { stockItOrder }
    }

    @Mutation(() => UpdateStockItOrResponse)
    async updateStockItOr(
        @Arg("id", () => Int) id: number,
        @Arg("holdStatus") holdStatus: StatusItem,
        @Arg("newStatus") newStatus: string,
        @Ctx() { req }: MyContext
    ): Promise<UpdateStockItOrResponse | null> {
        if (!req.session.userId) throw new Error("??????????????? Login.")

        const stockItOrder = await StockItOrder.findOne(id)
        if (!stockItOrder) throw new Error("Error! stockIt not found.")

        const item = await StockIt.findOne({ id: stockItOrder.stockItId })
        if (!item) throw new Error("item not found.")

        if (item.currentStatus === "??????????????????" && holdStatus !== "?????????" && stockItOrder.status === newStatus) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "Error! ??????????????????????????????????????????????????????????????????????????????"
                    }
                ]
            }
        }

        let current = CurrentStatus.UNOCCUPIED || CurrentStatus.ACTIVE
        if (holdStatus === "?????????") {
            current = CurrentStatus.UNOCCUPIED
        } else {
            current = CurrentStatus.ACTIVE
        }

        item.currentStatus = current
        await item.save()

        stockItOrder.holdStatus = holdStatus

        if (newStatus === "Success") {
            stockItOrder.status = StatusOrder.SUCCESS
        } else if (newStatus === "Preparing") {
            stockItOrder.status = StatusOrder.PREPARING
        } else {
            stockItOrder.status = StatusOrder.NEW
        }

        await stockItOrder.save();

        return { stockItOrder }
    }

    @Mutation(() => Boolean)
    async deleteStockItOrder(@Arg("id", () => Int) id: number) {
        await StockItOrder.delete(id)
        return true
    }
}