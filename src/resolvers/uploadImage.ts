import { Arg, Mutation, Resolver } from "type-graphql";
import { GraphQLUpload } from 'graphql-upload'
import { Upload } from '../types/Upload'
import { createWriteStream } from "fs";
import { join, parse } from "path";
import {
    ApolloError
} from 'apollo-server-express';

import { URL } from '../config'

@Resolver()
export class UploadImage {
    @Mutation(() => Boolean)
    async addProfilePicture(@Arg("picture", () => GraphQLUpload)
    {
        createReadStream,
        filename
    }: Upload): Promise<boolean> {
        return new Promise(async (resolve, reject) =>
            createReadStream()
                .pipe(createWriteStream(__dirname, `/../../images/${filename}`))
                .on("finish", () => resolve(true))
                .on("error", () => reject(false))
        )
    }

    @Mutation(() => String, { nullable: true })
    async imageUploader(@Arg("imageMe", () => GraphQLUpload)
    {
        filename,
        createReadStream
    }: Upload): Promise<String | undefined> {
        try {
            let stream = createReadStream()

            let {
                ext,
                name
            } = parse(filename)

            name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');

            let serverFile = join(
                __dirname, `../../dist/images/${name}-${Date.now()}${ext}`
            );

            serverFile = serverFile.replace(' ', '_');

            let writeStream = await createWriteStream(serverFile);

            await stream.pipe(writeStream);

            serverFile = `${URL}${serverFile.split('images')[1]}`;

            console.log("URL รูปภาพ", serverFile)
            return serverFile;

        } catch (err) {
            throw new ApolloError(err.message);
        }
    }
}


