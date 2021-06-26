import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";

import { isAuth } from "../middleware/isAuth";
import { Manufacturer } from "../entities/tier/Manufacturer";
import { MyContext } from "../types";

@InputType()

class ManufacturerInput {
    @Field()
    creatorFactory: string
    @Field()
    productName: string
    @Field()
    creatorId: number
}

@Resolver()
export class ManufacturerResolver {
    @Mutation(() => Manufacturer)
    @UseMiddleware(isAuth)
    async createManufacturer(
        @Arg("input") input: ManufacturerInput,
        @Ctx() { req }: MyContext
    ): Promise<Manufacturer> {
        return Manufacturer.create({
            ...input,
            userCreateId: req.session.userId,
        }).save()
    }

    @Query(() => [Manufacturer])
    Manufacturers(
    ): Promise<Manufacturer[]> {
        return Manufacturer.find()
    }
}