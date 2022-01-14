require("dotenv").config()
import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./utils/constants"
import mikroConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { PostResolver } from "./resolvers/PostResolver"

async function main() {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()

	const app = express()

	const server = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver],
		}),
		context: () => ({
			em: orm.em,
		}),
	})
	await server.start()
	server.applyMiddleware({ app })

	app.listen(4000, () => {
		console.log("SERVER:4000")
	})
}

main().catch((err) => {
	console.log(err)
})
