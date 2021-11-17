import DataLoader from "dataloader";
import { In } from "typeorm";
import { Resell, ResellJoinCustomer } from "../entities"

const batchResells = async (customerIds: number[]) => {
    const resellCustomers = await ResellJoinCustomer.find({
        join: {
            alias: "resellJoinCustomer",
            innerJoinAndSelect: {
                resell: "resellJoinCustomer.resell"
            }
        },
        where: {
            customerId: In(customerIds)
        }
    });

    const customerIdToResells: { [key: number]: Resell[] } = {};

    resellCustomers.forEach(rc => {
        if (rc.customerId in customerIdToResells) {
            customerIdToResells[rc.customerId].push((rc as any).__resell__);
        } else {
            customerIdToResells[rc.customerId] = [(rc as any).__resell__];
        }
    });

    return customerIds.map(customerId => customerIdToResells[customerId])
};

export const createResellsLoader = () => new DataLoader(batchResells);