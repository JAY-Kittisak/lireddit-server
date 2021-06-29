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
    category: CatProduct
    @Field()
    description: string
    @Field()
    creatorName: string
    @Field()
    creatorId: number
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
    async addFactoryProduct(
        @Arg("factoryId", () => Int) factoryId: number,
        @Arg("productId", () => Int) productId: number
    ) {
        await FactoryProduct.create({ factoryId, productId }).save()
        return true
    }

    @Mutation(() => Boolean)
    async deleteProduct(@Arg("productId", () => Int) productId: number) {
        await FactoryProduct.delete({ productId })
        await ProductByTier.delete({ id: productId })
        return true
    }

    @Query(() => [ProductByTier])
    async ProductByTiers() {
        return ProductByTier.find()
    }
}