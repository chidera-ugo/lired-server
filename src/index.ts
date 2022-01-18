require("dotenv").config()
import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./utils/constants"
import mikroConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { PostResolver } from "./resolvers/PostResolver"
import { UserResolver } from "./resolvers/UserResolver"
import cors from "cors"
import cookieParser from "cookie-parser"

async function main() {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()

	const app = express()
	app.use(
		cors({
			origin: [
				"http://localhost:3000",
				"https://studio.apollographql.com",
				"https://main.db5zxvzefvb6o.amplifyapp.com",
			],
			credentials: true,
		})
	)
	app.use(cookieParser())

	const server = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			em: orm.em,
			req,
			res,
		}),
	})
	await server.start()
	server.applyMiddleware({ app, cors: false })

	app.listen(4000, () => {
		console.log("SERVER:4000")
	})
}

main().catch((err) => {
	console.log(err)
})
