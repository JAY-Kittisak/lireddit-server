import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { User } from './User'
import { StatusItem, StatusOrder } from '../types';


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
    details: string;

    @Field()
    @Column()
    location: string;

    //FIXME: @Column({ unique: true })
    @Field()
    @Column()
    serialNum: string;

    @Field()
    @Column()
    warranty: string;

    @Field()
    @Column()
    price: number;

    @Field()
    @Column()
    inventory: number;

    @Field()
    @Column()
    branch: string

    @Field()
    @Column()
    category: string

    @Field()
    @Column({
        type: "enum",
        enum: StatusItem,
        default: StatusItem.UNOCCUPIED
    })
    holdStatus: StatusItem

    @Field()
    @Column({
        type: "enum",
        enum: StatusOrder,
        default: StatusOrder.NEW
    })
    status: StatusOrder

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    useById?: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.stockIts, { primary: true })
    @JoinColumn({ name: "useById" })
    useBy: Promise<User>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}