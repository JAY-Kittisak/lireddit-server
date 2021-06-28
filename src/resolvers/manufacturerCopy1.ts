import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { ManufacturerCopy1 } from "../entities/tier/ManufacturerCopy1";
import { MyContext, CatProduct } from "../types";
import { getConnection } from "typeorm";

@InputType()
class ManufacturerCopy1Input {
    @Field()
    creatorFactory: string
    @Field()
    creatorId: number
    @Field()
    category: CatProduct
    @Field()
    productName: string
    @Field()
    productDetail: string
    @Field()
    customerName: string
}

@Resolver()
export class ManufacturerCopy1Resolver {
    @Mutation(() => ManufacturerCopy1)
    @UseMiddleware(isAuth)
    async createManufacturerCopy1(
        @Arg("input") input: ManufacturerCopy1Input,
        @Ctx() { req }: MyContext
    ): Promise<ManufacturerCopy1> {
        return ManufacturerCopy1.create({
            ...input,
            userCreateId: req.session.userId,
        }).save()

    }

    @Query(() => [ManufacturerCopy1])
    async ManufacturerCopy1s(
    ): Promise<ManufacturerCopy1[]> {
        const factory = await getConnection()
            .getRepository(ManufacturerCopy1)
            .createQueryBuilder("ManufacturerCopy1")
            .leftJoinAndSelect("ManufacturerCopy1.creator", 'manufacturerCreate')
        return factory.getMany();
    }
}