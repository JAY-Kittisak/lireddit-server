import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { FactoryCopy1 } from './FactoryCopy1';
import { User } from '../User';

@ObjectType()
@Entity()
export class ManufacturerCopy1 extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    creatorFactory: string

    @Field()
    @Column()
    creatorId: number

    @Field()
    @ManyToOne(() => FactoryCopy1, (factoryCopy1: FactoryCopy1) => factoryCopy1.manufacturerCreate)
    @JoinColumn({ name: 'factoryCopy1_id' })
    creator: FactoryCopy1;

    @Field()
    @Column()
    category!: string

    @Field()
    @Column()
    productName!: string

    @Field()
    @Column()
    productDetail!: string

    @Field()
    @Column()
    customerName!: string

    @Field()
    @Column()
    customerId!: number

    @Field(() => [FactoryCopy1])
    @ManyToMany(() => FactoryCopy1, (factoryCopy1) => factoryCopy1.customer, {
        cascade: true
    })
    @JoinTable({ name: 'manufacturer_copy1_customer_factory_copy1' })
    customer: FactoryCopy1[];

    @Field()
    @Column()
    userCreateId: number

    @ManyToOne(() => User, (user) => user.id)
    userCreate: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}