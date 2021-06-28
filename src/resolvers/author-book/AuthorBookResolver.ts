import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql'
import { Author } from '../../entities/Author'
import { AuthorBook } from '../../entities/AuthorBook'
import { Book } from '../../entities/Book'

@Resolver()
export class AuthorBookResolver {
    @Mutation(() => Book)
    async createBook(@Arg("name") name: string) {
        return Book.create({ name }).save()
    }

    @Mutation(() => Author)
    async createAuthor(@Arg("name") name: string) {
        return Author.create({ name }).save()
    }

    @Mutation(() => Boolean)
    async addAuthorBook(
        @Arg("authorId", () => Int) authorId: number,
        @Arg("bookId", () => Int) bookId: number
    ) {
        await AuthorBook.create({ authorId, bookId }).save()
        return true
    }

    @Mutation(() => Boolean)
    async deleteBook(@Arg("bookId", () => Int) bookId: number) {
        await AuthorBook.delete({ bookId })
        await Book.delete({ id: bookId })
        return true
    }

    @Query(() => [Book])
    async books() {
        return Book.find()
    }
}