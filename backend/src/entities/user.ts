import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: string;

	@Field(() => String)
	@Column()
	username: string;

	@Field(() => String)
	@Column()
	email: string;

	@Column()
	password: string;
}
