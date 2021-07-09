import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { createConnection } from "typeorm";

import { COOKIE_NAME, __prod__ } from "./constants";
import { UserResolver } from "./resolvers/user";
import { User } from "./entities/User";
import { Factory } from "./entities/tier/Factory";
import { ProductByTier } from "./entities/tier/ProductByTier";
import { FactoryResolver } from "./resolvers/Tier";
import path from "path";
import { createFactoriesLoader } from "./utils/factoriesLoader";
import { createProductsLoader } from "./utils/productsLoader";
import { FactoryProduct } from "./entities/tier/FactoryProduct";
import { FactoryProductResolver } from "./resolvers/factory-product/FactoryProductResolver";

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
        ],
    });
    await conn.runMigrations();
    // await User.delete({}) //เปลี่ยน synchronize: false,

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    app.use(
        cors({
            origin: "http://200.1.1.99:3000",
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
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                UserResolver,
                FactoryResolver,
                FactoryProductResolver
            ],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            factoriesLoader: createFactoriesLoader(),
            productsLoader: createProductsLoader()
        }),
    });


    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(4000, () => {
        console.log("server started on http://localhost:4000/graphql");
    });
};

main().catch((err) => {
    console.error(err);
});
