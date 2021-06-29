import DataLoader from "dataloader";
import { In } from "typeorm";
import { Factory } from "../entities/tier/Factory";
import { FactoryProduct } from "../entities/tier/FactoryProduct";

const batchFactories = async (productIds: number[]) => {
    const factoryProducts = await FactoryProduct.find({
        join: {
            alias: "factoryProduct",
            innerJoinAndSelect: {
                factory: "factoryProduct.factory"
            }
        },
        where: {
            productId: In(productIds)
        }
    });

    const productIdToFactories: { [key: number]: Factory[] } = {};

    factoryProducts.forEach(fb => {
        if (fb.productId in productIdToFactories) {
            productIdToFactories[fb.productId].push((fb as any).__factory__);
        } else {
            productIdToFactories[fb.productId] = [(fb as any).__factory__];
        }
    });

    return productIds.map(productId => productIdToFactories[productId]);
};

export const createFactoriesLoader = () => new DataLoader(batchFactories);