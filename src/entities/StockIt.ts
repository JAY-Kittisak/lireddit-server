import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { StockItOrder } from './StockItOrder'
import { CurrentStatus } from '../types';

@ObjectType()
@Entity()
export class StockIt extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    itemName: string;

    @Field()
    @Column()
    detail: string;

    @Field()
    @Column()
    location: string;

    @Field()
    @Column({ unique: true })
    serialNum: string;

    @Field()
    @Column()
    warranty: string;

    @Field()
    @Column()
    price: number;

    @Field(() => String)
    @Column({
        type: "enum",
        enum: CurrentStatus,
        default: CurrentStatus.UNOCCUPIED
    })
    currentStatus: string;

    @Field()
    @Column()
    branch: string

    @Field()
    @Column()
    brand: string

    @Field()
    @Column()
    category: string

    @Field(() => [StockItOrder])
    @OneToMany(() => StockItOrder, (giveOrder) => giveOrder.stockIt)
    orders: Promise<StockItOrder[]>;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}