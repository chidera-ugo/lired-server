import { Post } from "../entities/Post"
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql"
import { Context } from "src/utils/types"

@Resolver()
export class PostResolver {
	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string,
		@Ctx() { em }: Context
	): Promise<Post> {
		const post = em.create(Post, { title })
		await em.persistAndFlush(post)
		return post
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title") title: string,
		@Ctx() { em }: Context
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id })
		if (!post) {
			return null
		}
		if (typeof title !== "undefined") {
			post.title = title
			await em.persistAndFlush(post)
		}
		return post
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: number, @Ctx() { em }: Context) {
		await em.nativeDelete(Post, { id })
		return true
	}

	@Query(() => [Post])
	async posts(@Ctx() { em }: Context): Promise<Post[]> {
		return em.find(Post, {})
	}

	@Query(() => Post, { nullable: true })
	async post(
		@Arg("id", () => Int) id: number,
		@Ctx() { em }: Context
	): Promise<Post | null> {
		return em.findOne(Post, { id })
	}
}
