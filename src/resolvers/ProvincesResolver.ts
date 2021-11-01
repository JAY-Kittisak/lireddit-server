import {
    Resolver,
    Query,
    Arg,
    Int,
} from "type-graphql";

import { Provinces, Amphures } from "../entities"

@Resolver()
export class ProvincesResolver {
    @Query(() => [Provinces])
    async queryProvinces(): Promise<Provinces[]> {
        return await Provinces.find();
    }

    @Query(() => [Amphures])
    async amphuresPvId(
        @Arg("id", () => Int) id: number,
    ): Promise<Amphures[] | undefined> {
        return await Amphures.find({ where: { province_id: id } });
    }
}
