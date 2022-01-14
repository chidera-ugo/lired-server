import { User } from "../entities/User"
import { Context } from "src/utils/types"
import argon2 from "argon2"
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql"
import {
	getAccessToken,
	getRefreshToken,
	sendRefreshToken,
} from "../utils/tokens"
import { verify, decode, JwtPayload } from "jsonwebtoken"

@ObjectType()
class FieldError {
	@Field()
	field!: string

	@Field()
	message!: string
}

@ObjectType()
class UserResponse {
	@Field(() => User, { nullable: true })
	user?: User

	@Field(() => FieldError, { nullable: true })
	errors?: FieldError

	@Field(() => String, { nullable: true })
	accessToken?: string
}

@InputType()
class UsernamePassword {
	@Field()
	username!: string

	@Field()
	password!: string
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async register(
		@Arg("options") { username, password }: UsernamePassword,
		@Ctx() { em }: Context
	): Promise<UserResponse> {
		const existingUser = await em.findOne(User, { username })

		if (existingUser?.id) {
			return {
				errors: {
					field: "username",
					message: "Username is already taken",
				},
			}
		}

		if (username.length <= 5) {
			return {
				errors: {
					field: "username",
					message: "Username is too short",
				},
			}
		}

		if (password.length <= 5) {
			return {
				errors: {
					field: "password",
					message: "Password is too short",
				},
			}
		}

		try {
			const hashedPassword = await argon2.hash(password)
			const user = em.create(User, { username, password: hashedPassword })
			await em.persistAndFlush(user)
			return {
				user,
			}
		} catch (err) {
			console.log(err)
			return {
				errors: {
					field: "all",
					message: "Error creating account",
				},
			}
		}
	}

	@Query(() => [User])
	async users(@Ctx() { em }: Context): Promise<User[]> {
		return em.find(User, {})
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") { username, password }: UsernamePassword,
		@Ctx() { em, res }: Context
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username })

		if (!user) {
			return {
				errors: {
					field: "username",
					message: "User does not exist",
				},
			}
		}

		try {
			const validPassword = await argon2.verify(user.password, password)

			if (!validPassword) {
				return {
					errors: {
						field: "all",
						message: "Invalid email or password",
					},
				}
			}

			sendRefreshToken(res, getRefreshToken(user))

			return {
				user,
				accessToken: getAccessToken(user),
			}
		} catch (err) {
			console.log(err)
			return {
				errors: {
					field: "all",
					message: "Failed to login",
				},
			}
		}
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: Context): Promise<User | null> {
		const authorization = req.headers["authorization"]

		const accessToken = authorization?.split(" ")[1]

		if (!accessToken) {
			return null
		}

		try {
			const validToken = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
			if (!validToken) return null
			const tokenPayload = decode(accessToken) as JwtPayload
			return await em.findOne(User, { id: tokenPayload.userId })
		} catch (err) {
			console.log(err)
			return null
		}
	}
}
