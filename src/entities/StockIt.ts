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

    @Field()
    @Column({ default: 1 })
    inventory: number;

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