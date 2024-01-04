import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	InputType,
	Field,
} from 'type-graphql';
import { YogaInitialContext } from 'graphql-yoga';
import { User } from '../entities/user';
import jwt from 'jsonwebtoken';
import 'class-validator';
import bcrypt from 'bcrypt';
import { UserResponse } from '../types/user_types';
import { validateCredentials } from '../utils/validate_credentials';

@InputType()
class RegisterCredentials {
	@Field()
	username: string;
	@Field()
	email: string;
	@Field()
	password: string;
}

@Resolver(User)
export class UserResolver {
	@Query(() => UserResponse)
	async me(@Ctx() ctx: YogaInitialContext): Promise<UserResponse> {
		const cookie = await ctx.request.cookieStore?.get('cid');

		if (!cookie) {
			return {
				errors: [{ field: 'cookie', message: 'You are not logged in' }],
			};
		}

		const validToken = jwt.verify(cookie.value, process.env.JWT_SECRET!) as {
			id: number;
		};

		if (!validToken) {
			return { errors: [{ field: 'token', message: 'Your token is invalid' }] };
		}

		const user = await User.findOneBy({ id: validToken.id.toString() });

		if (!user) {
			return { errors: [{ field: 'user', message: 'User not found' }] };
		}
		return { user };
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('credentials') credentials: RegisterCredentials,
		@Ctx() ctx: YogaInitialContext
	): Promise<UserResponse> {
		try {
			const { username, email, password } = credentials;

			let errors = validateCredentials(credentials);

			if (errors.length > 0) {
				return { errors };
			}

			const hashedPwd = await bcrypt.hash(password, 13);

			const user = await User.save({
				username,
				email,
				password: hashedPwd,
			});

			const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
				expiresIn: process.env.JWT_EXPIRATION,
			});

			await ctx.request.cookieStore?.set({
				name: 'cid',
				value: token,
				expires: Date.now() + 24 * 60 * 60 * 1000,
				httpOnly: true,
				domain: 'localhost',
				secure: true,
				sameSite: 'none',
			});

			return { user };
		} catch (error) {
			console.log(error);
			return {
				errors: [{ field: '500', message: 'Internal server error' }],
			};
		}
	}
}
