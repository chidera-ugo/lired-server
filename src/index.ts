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

async function main() {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()

	const app = express()
	app.use(
		cors({
			origin: ["http://localhost:4000", "https://studio.apollographql.com"],
			credentials: true,
		})
	)

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
