import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { YogaInitialContext } from 'graphql-yoga';
import { User } from '../entities/user';

@Resolver()
export class UserResolver {
	@Query(() => String, { nullable: true })
	async cookie(@Arg('name') name: string, @Ctx() ctx: YogaInitialContext) {
		const cookie = await ctx.request.cookieStore?.get(name);

		return cookie?.value;
	}
	@Mutation(() => Boolean)
	async setCookie(@Ctx() ctx: YogaInitialContext) {
		try {
			await User.save({
				username: 'bob',
				email: 'bob@gmail.com',
				password: 'bob123',
			});

			await ctx.request.cookieStore?.set({
				name: 'cid',
				value: 'I am a HttpOnly cookie',
				expires: Date.now() + 24 * 60 * 60 * 1000,
				httpOnly: true,
				domain: 'localhost',
				secure: true,
				sameSite: 'none',
			});
		} catch (error) {
			console.log(error);
		}

		return true;
	}
}
