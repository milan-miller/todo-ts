import 'reflect-metadata';
import 'dotenv/config';
import { createServer } from 'node:http';
import { YogaInitialContext, createYoga } from 'graphql-yoga';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { AppDataSource } from '../data-source';
import { useCookies } from '@whatwg-node/server-plugin-cookies';

export interface MyContext extends YogaInitialContext {
	tokenPayload?: string;
}

async function main() {
	try {
		await AppDataSource.initialize();

		const schema = await buildSchema({
			resolvers: [UserResolver],
			validate: { forbidUnknownValues: false },
		});

		const yoga = createYoga({
			schema,
			plugins: [useCookies()],
		});

		const server = createServer(yoga);

		server.listen(4000, () => {
			console.info('Server is running on http://localhost:4000/graphql');
		});
	} catch (error) {
		console.log(error);
	}
}

main();
