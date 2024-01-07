import { Field, InputType } from 'type-graphql';

@InputType()
export class RegisterCredentials {
	@Field()
	username: string;
	@Field()
	email: string;
	@Field()
	password: string;
}

@InputType()
export class LoginCredentials {
	@Field()
	email: string;

	@Field()
	password: string;
}
