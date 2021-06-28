import { Ctx, Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuthorBook } from './AuthorBook';
import { Author } from './Author'
import { MyContext } from 'src/types';

@ObjectType()
@Entity()
export class Book extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @OneToMany(() => AuthorBook, ab => ab.author)
    authorConnection: Promise<AuthorBook[]>;

    @Field(() => [Author])
    async authors(@Ctx() { authorsLoader }: MyContext): Promise<Author[]> {
        return authorsLoader.load(this.id)
    }
}