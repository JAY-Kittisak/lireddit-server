import {
    BaseEntity, Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType, Ctx } from "type-graphql"
import { User } from './User';
import { Customer } from './Customer';
import { ResellJoinCustomer } from './ResellJoinCustomer';
import { MyContext } from '../types';

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

    @OneToMany(() => ResellJoinCustomer, rc => rc.resell)
    customerConnection: Promise<ResellJoinCustomer[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => [Customer], { nullable: true })
    async customers(@Ctx() { customersLoader }: MyContext): Promise<Customer[]> {
        return customersLoader.load(this.id)
    }
}