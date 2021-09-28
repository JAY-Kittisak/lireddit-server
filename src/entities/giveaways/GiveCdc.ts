import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { GiveOrder } from './GiveOrder'

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

    @Field(() => [GiveOrder])
    @OneToMany(() => GiveOrder, (giveOrder) => giveOrder.give)
    orders: Promise<GiveOrder[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}