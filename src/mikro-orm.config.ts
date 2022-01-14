import { __prod__ } from "./utils/constants"
import { Post } from "./entities/Post"
import { MikroORM } from "@mikro-orm/core"
import path from "path"

export default {
	entities: [Post],
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	dbName: "test_reddit",
	type: "postgresql",
	user: "postgres",
	password: process.env.DB_PASSWORD,
	debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
