import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { graphqlUploadExpress } from "graphql-upload";
import path, { join } from "path";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { FRONTEND, PORT } from './config';
import { COOKIE_NAME, __prod__ } from "./constants";
import { Factory, FactoryProduct, ProductByTier, User, Give, GiveOrder, ManualAD, ManualADUrl } from "./entities";
import { FactoryProductResolver, FactoryResolver, UserResolver, GiveOrderResolver, ManualADResolver } from "./resolvers";
import { createFactoriesLoader } from "./utils/factoriesLoader";
import { createProductsLoader } from "./utils/productsLoader";

const main = async () => {
    const conn = await createConnection({
        type: "postgres",
        database: "lireddit8",
        username: "postgres",
        password: "423651",
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [
            User,
            Factory,
            ProductByTier,
            FactoryProduct,
            Give,
            GiveOrder,
            ManualAD,
            ManualADUrl
        ],
    });
    await conn.runMigrations();
    // await User.delete({}) //เปลี่ยน synchronize: false,

    const app = express();

    app.use(graphqlUploadExpress({ maxFileSize: 100000, maxFiles: 10 }));
    app.use(express.static(join(__dirname, 'images')))

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        cors({
            origin: FRONTEND,
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24, // 24 ชม.
                httpOnly: true,
                sameSite: "lax", // csrf
                secure: __prod__, // cookie only works in https
            },
            saveUninitialized: false,
            secret: "sdfhytbgsdafasdfsdfpopo",
            resave: false,
        }),
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                UserResolver,
                FactoryResolver,
                FactoryProductResolver,
                GiveOrderResolver,
                ManualADResolver
            ],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            factoriesLoader: createFactoriesLoader(),
            productsLoader: createProductsLoader()
        }),
        uploads: false
    });

    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(PORT, () => {
        console.log(`🚀 server started on http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
};

main().catch((err) => {
    console.error(err);
});
