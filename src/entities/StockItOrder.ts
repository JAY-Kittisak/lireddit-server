import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { StockIt } from './StockIt'
import { User } from './User';
import { StatusOrder } from '../types';

@ObjectType()
@Entity()
export class StockItOrder extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    detail?: string;

    @Field()
    @Column()
    branch: string

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @Column()
    stockItId: number;

    @Field()
    @Column()
    holdStatus: string

    @Field(() => String)
    @Column({
        type: "enum",
        enum: StatusOrder,
        default: StatusOrder.NEW
    })
    status: StatusOrder

    @Field(() => User)
    @ManyToOne(() => User, user => user.stockItOrders, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => StockIt)
    @ManyToOne(() => StockIt, stockIt => stockIt.orders, { primary: true })
    @JoinColumn({ name: "stockItId" })
    stockIt: Promise<StockIt>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}