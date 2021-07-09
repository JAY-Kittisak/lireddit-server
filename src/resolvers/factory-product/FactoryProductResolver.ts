import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from 'type-graphql'
// import { Factory } from '../../entities/tier/Factory'
// import { AuthorBook } from '../../entities/tier/FactoryProduct'
// import { Book } from '../../entities/Book'
import { FactoryProduct } from '../../entities/tier/FactoryProduct'
import { ProductByTier } from '../../entities/tier/ProductByTier'
import { CatProduct } from '../../types'

@InputType()
class ProductByTierInput {
    @Field()
    productName: string
    @Field()
    description: string
    @Field()
    category: CatProduct
    @Field()
    creatorName: string
    @Field()
    creatorId: number
}

@InputType()
class JoinTierInput {
    @Field()
    productId: number
    @Field()
    factoryId: number
}

@Resolver()
export class FactoryProductResolver {
    @Mutation(() => ProductByTier)
    async createProductByTier(@Arg("input") input: ProductByTierInput) {
        return ProductByTier.create({ ...input }).save()
    }

    // @Mutation(() => Factory)
    // async createFactory(@Arg("companyName") companyName: string) {
    //     return Factory.create({ companyName }).save()
    // }

    @Mutation(() => Boolean)
    async joinFactory(
        @Arg("input") input: JoinTierInput,
    ) {
        await FactoryProduct.create({ ...input }).save()
        return true
    }
    // @Mutation(() => Boolean)
    // async addFactoryProduct(
    //     @Arg("factoryId", () => Int) factoryId: number,
    //     @Arg("productId", () => Int) productId: number
    // ) {
    //     await FactoryProduct.create({ factoryId, productId }).save()
    //     return true
    // }

    @Mutation(() => Boolean)
    async deleteProduct(@Arg("productId", () => Int) productId: number) {
        await FactoryProduct.delete({ productId })
        await ProductByTier.delete({ id: productId })
        return true
    }

    //      ปกติ              [ProductByTier!]!                    
    // { nullable: "items" } [ProductByTier]!
    // { nullable: true }    เป็น null ได้
    @Query(() => [ProductByTier], { nullable: "items" })
    async ProductByTiers() {
        return ProductByTier.find()
    }
}