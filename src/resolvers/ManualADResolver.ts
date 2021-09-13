import { MyContext } from "../types";
import {
    Field,
    InputType,
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    Int,
    ObjectType,
} from "type-graphql";
import { GraphQLUpload } from "graphql-upload";

import { ManualAD, ManualADUrl } from "../entities";
import { Upload } from "../types";
import { createWriteStream } from "fs";
import { join, parse } from "path";
import { URL } from "../config";

@InputType()
class ManualADInput {
    @Field()
    factoryName: string;
    @Field()
    email: string;
    @Field()
    telephoneNumber: string;
}

@ObjectType()
class FieldErrorManualAD {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class ManualADResponse {
    @Field(() => [FieldErrorManualAD], { nullable: true })
    errors?: FieldErrorManualAD[];

    @Field(() => [ManualAD], { nullable: true })
    manualAD?: ManualAD[];
}

@Resolver()
export class ManualADResolver {
    @Query(() => [ManualAD])
    async manualADs(@Ctx() { req }: MyContext): Promise<ManualAD[]> {
        if (!req.session.userId) throw new Error("Please Login.");
        return ManualAD.find();
    }

    @Query(() => ManualAD)
    manualADById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<ManualAD | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        return ManualAD.findOne(id);
    }

    @Mutation(() => ManualADResponse)
    async createManualAD(
        @Arg("input") input: ManualADInput,
        @Ctx() { req }: MyContext
    ): Promise<ManualADResponse> {
        if (!req.session.userId) throw new Error("Please Login.");

        //------------------------ ManualInput ------------------
        if (input.factoryName.length <= 5) {
            return {
                errors: [
                    {
                        field: "factoryName",
                        message: "ความยาวต้องมากกว่า 5",
                    },
                ],
            };
        }
        if (input.email.length <= 5) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "ความยาวต้องมากกว่า 5",
                    },
                ],
            };
        }
        if (input.telephoneNumber.length <= 5) {
            return {
                errors: [
                    {
                        field: "telephoneNumber",
                        message: "ความยาวต้องมากกว่า 5",
                    },
                ],
            };
        }

        //ก่อนมีการ Upload รูปภาพ await Give.create({ ...input }).save();
        await ManualAD.create({ ...input }).save();

        const manualAD = await ManualAD.find();

        return { manualAD };
    }

    @Mutation(() => ManualADUrl)
    async uploadPDFAd(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Arg("options", () => GraphQLUpload)
        { filename, createReadStream }: Upload,
        @Ctx() { req }: MyContext
    ): Promise<ManualADUrl> {
        //------------------------ GraphQLUpload ------------------
        if (!req.session.userId) throw new Error("Please Login.");

        let stream = createReadStream();

        let { ext, name } = parse(filename);

        name = name.replace(/([^a-z0-9 ]+)/gi, "-").replace(" ", "_");

        let serverFile = join(
            __dirname,
            `../../dist/images/manualAD/${name}-${Date.now()}${ext}`
        );

        serverFile = serverFile.replace(" ", "_");

        let writeStream = await createWriteStream(serverFile);

        await stream.pipe(writeStream);

        serverFile = `${URL}${serverFile.split("images")[1]}`;

        const manualUrl = await ManualADUrl.create({
            manualId: id,
            title,
            url: serverFile
        }).save();

        return manualUrl
    }

    @Mutation(() => ManualADResponse)
    async deleteManualAD(@Arg(
        "id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<ManualADResponse> {
        if (!req.session.userId) {
            return {
                errors: [
                    {
                        field: "userId",
                        message: "โปรด Login"
                    }
                ]
            }
        }

        await ManualADUrl.delete({ manualId: id })
        await ManualAD.delete({ id })

        const manualAD = await ManualAD.find()

        return { manualAD }
    }
}
