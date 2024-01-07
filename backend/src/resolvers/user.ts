import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	UseMiddleware,
} from 'type-graphql';
import { User } from '../entities/user';
import jwt from 'jsonwebtoken';
import 'class-validator';
import bcrypt from 'bcrypt';
import { FieldError, UserResponse } from '../types/object_types';
import { validateCredentials } from '../utils/validate_credentials';
import { isAuth } from '../middleware/is_auth';
import { MyContext } from '..';
import { LoginCredentials, RegisterCredentials } from '../types/input_types';

@Resolver(User)
export class UserResolver {
	@Query(() => UserResponse)
	@UseMiddleware(isAuth)
	async me(@Ctx() ctx: MyContext): Promise<UserResponse> {
		try {
			const user = await User.findOneBy({ id: ctx.tokenPayload });

			if (!user) {
				return { errors: [{ field: 'user', message: 'User not found' }] };
			}

			return { user };
		} catch (error) {
			console.log(error);
			return {
				errors: [{ field: '500', message: 'Internal server error' }],
			};
		}
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('credentials') { email, password }: LoginCredentials,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		try {
			let errors: FieldError[] = [];

			if (!email) {
				errors.push({ field: 'email', message: 'Enter your email' });
			}

			if (!password) {
				errors.push({ field: 'password', message: 'Enter your password' });
			}

			const user = (await User.findOneBy({ email })) as User;

			if (!user || !(await bcrypt.compare(password, user.password))) {
				errors.push({ field: 'user', message: 'Invalid credentials' });
			}

			if (errors.length > 0) {
				return { errors };
			}

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

	@Mutation(() => UserResponse)
	async register(
		@Arg('credentials') credentials: RegisterCredentials,
		@Ctx() ctx: MyContext
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
