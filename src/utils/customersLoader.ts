import DataLoader from "dataloader";
import { In } from "typeorm";
import { Customer, ResellJoinCustomer } from "../entities"

const batchCustomers = async (resellIds: number[]) => {
    const customerResells = await ResellJoinCustomer.find({
        join: {
            alias: "resellJoinCustomer",
            innerJoinAndSelect: {
                customer: "resellJoinCustomer.customer"
            }
        },
        where: {
            resellId: In(resellIds)
        }

    });

    const resellIdToCustomers: { [key: number]: Customer[] } = {};

    customerResells.forEach(cr => {
        if (cr.resellId in resellIdToCustomers) {
            resellIdToCustomers[cr.resellId].push((cr as any).__customer__)
        } else {
            resellIdToCustomers[cr.resellId] = [(cr as any).__customer__]
        }
    })

    return resellIds.map(resellId => resellIdToCustomers[resellId])
}


export const createCustomersLoader = () => new DataLoader(batchCustomers)