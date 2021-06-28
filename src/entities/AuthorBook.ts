import { ObjectType } from 'type-graphql';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Book } from './Book';
import { Author } from './Author'

@ObjectType()
@Entity()
export class AuthorBook extends BaseEntity {
    @PrimaryColumn()
    authorId: number;

    @PrimaryColumn()
    bookId: number;

    @ManyToOne(() => Author, author => author.bookConnection, { primary: true })
    @JoinColumn({ name: "authorId" })
    author: Promise<Author>;

    @ManyToOne(() => Book, book => book.authorConnection, { primary: true })
    @JoinColumn({ name: "bookId" })
    book: Promise<Book>

    @OneToMany(() => AuthorBook, ab => ab.author)
    bookConnection: Promise<AuthorBook[]>;
}