import {
    BaseEntity, Column, CreateDateColumn, Entity,
    // JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
// import { User } from './User';

@ObjectType()
@Entity()
export class Resell extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    detail: string

    @Field()
    @Column({
        default: 0
    })
    branch: number

    @Field()
    @Column()
    maker: string

    @Field()
    @Column()
    orderById: number

    @Field()
    @Column()
    resellId: number

    @Field()
    @Column()
    creatorId: number;

    // @Field(() => User)
    // @ManyToOne(() => User, user => user.leaves, { primary: true })
    // @JoinColumn({ name: "creatorId" })
    // creator: Promise<User>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}