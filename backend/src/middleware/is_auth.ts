import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { MyContext } from '..';

interface TokenPayload {
	id: string;
}

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
	const cookie = await context.request.cookieStore?.get('cid');

	if (!cookie) {
		throw new Error('not authenticated');
	}

	let decodedToken: TokenPayload | null = null;

	try {
		decodedToken = jwt.verify(
			cookie.value,
			process.env.JWT_SECRET!
		) as TokenPayload;
	} catch (err) {
		throw new Error(`token couldn't be verified`);
	}

	context.tokenPayload = decodedToken.id;

	return next();
};
