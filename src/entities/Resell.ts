import {
    BaseEntity, Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { User } from './User';
import { Customer } from './Customer';

@ObjectType()
@Entity()
export class Resell extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    orderId: number

    @Field()
    @Column()
    maker: string

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    detail: string

    @Field()
    @Column()
    category: string

    @Field()
    @Column()
    creatorId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.resell, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => Customer)
    @ManyToOne(() => Customer, customer => customer.orderResell)
    @JoinColumn({ name: "orderId" })
    orderCustomer: Promise<Customer>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}