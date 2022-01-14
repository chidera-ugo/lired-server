import { User } from "src/entities/User"
import { sign } from "jsonwebtoken"
import { Response } from "express"
import { __prod__ } from "./constants"

export const getAccessToken = (user: User) => {
	const accessToken = sign(
		{
			userId: user.id,
		},
		process.env.ACCESS_TOKEN_SECRET!,
		{
			expiresIn: "15m",
		}
	)
	return accessToken
}

export const getRefreshToken = (user: User) => {
	const refreshToken = sign(
		{
			userId: user.id,
			tokenVersion: 0,
		},
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: "7d",
		}
	)
	return refreshToken
}

export const sendRefreshToken = (res: Response, refreshToken: string) => {
	res.cookie("kid", refreshToken, {
		httpOnly: true,
		path: "/",
		sameSite: "none",
		secure: !__prod__,
	})
}
