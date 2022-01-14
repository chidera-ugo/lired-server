import { Post } from "../entities/Post"
import { Ctx, Mutation, Query, Resolver } from "type-graphql"
import { Context } from "src/utils/types"

@Resolver()
export class PostResolver {
	@Query(() => String)
	hello() {
		return "bitch"
	}

	@Mutation(() => [Post])
	async posts(@Ctx() { em }: Context): Promise<Post[]> {
		const posts = await em.find(Post, {})
		return posts
	}

  @Mutation(() => Post)
  async post(
    @
    @Ctx() {em}: Context
  ): Promise<Post> {
    const post = em.findOne(Post, {})
  }
}
