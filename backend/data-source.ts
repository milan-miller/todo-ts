import { DataSource } from 'typeorm';
import { User } from './src/entities/user';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'password',
	database: 'todo-ts',
	synchronize: true,
	logging: true,
	entities: [User],
	subscribers: [],
	migrations: [],
});
