import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { UserRole, Departments, Position } from '../types'
import { GiveOrder } from './giveaways/GiveOrder';
import { GiveOrderCdc } from './giveaways/GiveOrderCdc';
import { JobIT } from './JobIT';
import { StockItOrder } from './StockItOrder';
import { Leave } from './Leave';

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column()
    email!: string;

    @Field(() => String)
    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.CLIENT_LKB
    })
    roles!: UserRole

    @Field(() => String)
    @Column({
        type: "enum",
        enum: Position,
        default: Position.GENERAL
    })
    position!: Position

    @Field()
    @Column({
        default: 0
    })
    branch: number

    @Field({ nullable: true })
    @Column({ nullable: true })
    fullNameTH?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    fullNameEN?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    nickName?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field(() => String)
    @Column({
        nullable: true,
        type: "enum",
        enum: Departments,
        default: Departments.CLIENT
    })
    departments?: Departments

    @Field(() => [GiveOrder])
    @OneToMany(() => GiveOrder, (giveOrder) => giveOrder.creator)
    giveOrders: Promise<GiveOrder[]>;

    @Field(() => [GiveOrderCdc])
    @OneToMany(() => GiveOrderCdc, (giveOrder) => giveOrder.creator)
    giveOrdersCdc: Promise<GiveOrderCdc[]>;

    @Field(() => [JobIT])
    @OneToMany(() => JobIT, (job) => job.creator)
    jobITs: Promise<JobIT[]>;

    @Field(() => [StockItOrder])
    @OneToMany(() => StockItOrder, (stockIt) => stockIt.creator)
    stockItOrders: Promise<StockItOrder[]>;

    @Field(() => [Leave])
    @OneToMany(() => Leave, (leave) => leave.creator)
    leaves: Promise<Leave[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}