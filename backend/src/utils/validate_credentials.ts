import { FieldError } from '../types/object_types';
import validator from 'email-validator';

interface props {
	username: string;
	email: string;
	password: string;
}

export const validateCredentials = ({ username, email, password }: props) => {
	const errors: FieldError[] = [];

	if (!username || username.length < 3) {
		errors.push({
			field: 'username',
			message: `Please choose a 3 character minimum username`,
		});
	}

	if (!validator.validate(email)) {
		errors.push({
			field: 'email',
			message: 'Please enter a valid email adress',
		});
	}

	if (!password || password.length < 12) {
		errors.push({
			field: 'password',
			message: 'Please choose a 12 character minimum password',
		});
	}

	console.log(errors);

	return errors;
};
