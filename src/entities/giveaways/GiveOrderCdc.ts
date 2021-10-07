import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { GiveCdc } from './GiveCdc'
import { User } from '../User';
import { StatusOrder } from '../../types';

@ObjectType()
@Entity()
export class GiveOrderCdc extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @Column()
    giveId: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    amount: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    price: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    customerId: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    customerDetail: string;

    @Field(() => String)
    @Column({
        type: "enum",
        enum: StatusOrder,
        default: StatusOrder.NEW
    })
    status: StatusOrder

    @Field(() => User)
    @ManyToOne(() => User, user => user.giveOrdersCdc, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => GiveCdc)
    @ManyToOne(() => GiveCdc, give => give.orders, { primary: true })
    @JoinColumn({ name: "giveId" })
    give: Promise<GiveCdc>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}