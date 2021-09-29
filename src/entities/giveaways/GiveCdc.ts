import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { GiveOrderCdc } from './GiveOrderCdc'

@ObjectType()
@Entity()
export class GiveCdc extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    giveName: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    details: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    price: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    inventory: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    category: string

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field(() => [GiveOrderCdc])
    @OneToMany(() => GiveOrderCdc, (giveOrder) => giveOrder.give)
    orders: Promise<GiveOrderCdc[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}