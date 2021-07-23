import { Arg, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";

import { isAuth } from "../../middleware/isAuth";
import { Factory } from "../../entities/tier/Factory";
import { getConnection } from "typeorm";
// import { Manufacturer } from "../entities/tier/Manufacturer"

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

@InputType()
class FactoryInput {
    @Field()
    industrialEstate: string
    @Field()
    businessType: string
    @Field()
    companyName: string
    @Field()
    description: string
    @Field()
    address: string
    @Field()
    phoneNumber: string
    @Field()
    FAX: string
    @Field()
    Email: string
}

@Resolver()
export class FactoryResolver {
    @Query(() => [Factory])
    async factories(): Promise<Factory[]> {
        await sleep(3000)
        return Factory.find()
    }

    @Query(() => Factory, { nullable: true })
    @UseMiddleware(isAuth)
    factoryById(
        @Arg("id", () => Int) id: number): Promise<Factory | undefined> {
        return Factory.findOne(id)
    }

    @Query(() => [Factory], { nullable: true })
    async industrialEstate(
        @Arg("industrialEstate") industrialEstate: string): Promise<Factory[] | undefined> {
        return Factory.find({ industrialEstate })
    }

    @Query(() => [Factory], { nullable: true })
    businessType(
        @Arg("businessType") businessType: string): Promise<Factory[] | undefined> {
        return Factory.find({ businessType })
    }

    @Query(() => Factory, { nullable: true })
    async companyName(
        @Arg("companyName") companyName: string): Promise<Factory | undefined> {
        const factory = await getConnection()
            .getRepository(Factory)
            .createQueryBuilder("factory")
            // .leftJoinAndSelect("factory.manufacturerCreate", "manufacturer")
            // .leftJoinAndSelect(Manufacturer, 'mf', 'mf.manufacturerCreate = manufacturerCreate.companyName')
            // .leftJoinAndSelect("factory.manufacturerCreate", "creatorFactory")
            .leftJoinAndSelect("factory.products", 'factoryConnection')
        if (companyName) {
            factory.where("factory.companyName = :companyName", { companyName: companyName })
        }
        return factory.getOne();
        // return Factory.findOne({ companyName })
    }

    @Mutation(() => Factory)
    @UseMiddleware(isAuth)
    async createFactory(
        @Arg("input") input: FactoryInput): Promise<Factory> {
        return Factory.create({
            ...input,
        }).save()
    }
}