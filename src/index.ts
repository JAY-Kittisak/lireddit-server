import "reflect-metadata"
import express from "express"
import { ApolloServer, } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import cors from 'cors'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { createConnection } from 'typeorm'

import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user"
import { User } from "./entities/User"
import { Post } from "./entities/Post"
import { Factory } from "./entities/tier/Factory"
import { ProductByTier } from "./entities/tier/ProductByTier"
import { Manufacturer } from "./entities/tier/Manufacturer"
import { FactoryResolver } from "./resolvers/Tier"

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: '423651',
        logging: true,
        synchronize: true,
        entities: [
            Post,
            User,
            Factory,
            ProductByTier,
            Manufacturer
        ]
    })
//
    // await Factory.delete({}) //เปลี่ยน synchronize: false,

    const app = express();

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()
    app.use(
        cors({
            origin: 'http://200.1.1.99:3000',
            credentials: true
        }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 ปี
                httpOnly: true,
                sameSite: 'lax', // csrf 
                secure: __prod__// cookie only works in https
            },
            saveUninitialized: false,
            secret: 'sdfhytbgsdafasdfsdfpopo',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver, FactoryResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res })
    })

    apolloServer.applyMiddleware({
        app,
        cors: false
    })

    app.listen(4000, () => {
        console.log("server started on http://localhost:4000/graphql")
    })
}

main().catch((err) => {
    console.error(err)
})