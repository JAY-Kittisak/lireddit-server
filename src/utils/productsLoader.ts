import DataLoader from "dataloader";
import { In } from "typeorm";
import { ProductByTier } from "../entities/tier/ProductByTier";
import { FactoryProduct } from "../entities/tier/FactoryProduct";

const batchProductByTiers = async (factoryIds: number[]) => {
    const productFactories = await FactoryProduct.find({
        join: {
            alias: "factoryProduct",
            innerJoinAndSelect: {
                product: "factoryProduct.product"
            }
        },
        where: {
            factoryId: In(factoryIds)
        }
    });

    const factoryIdToProducts: { [key: number]: ProductByTier[] } = {};

    productFactories.forEach(pf => {
        if (pf.factoryId in factoryIdToProducts) {
            factoryIdToProducts[pf.factoryId].push((pf as any).__product__);
        } else {
            factoryIdToProducts[pf.factoryId] = [(pf as any).__product__];
        }
    });

    return factoryIds.map(factoryId => factoryIdToProducts[factoryId]);
};

export const createProductsLoader = () => new DataLoader(batchProductByTiers);