import { __prod__ } from "./utils/constants"
import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { Post } from "./entities/Post"
import { User } from "./entities/User"

export default {
	entities: [Post, User],
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	dbName: "reddit",
	type: "postgresql",
	user: "postgres",
	password: process.env.DB_PASSWORD,
	debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
