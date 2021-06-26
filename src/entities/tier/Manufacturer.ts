import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Factory } from './Factory';
import { ProductByTier } from './ProductByTier';
import { User } from '../User';

@ObjectType()
@Entity()
export class Manufacturer extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    creatorFactory: string


    @Field()
    @Column()
    productName: string

    @Field()
    @Column()
    userCreateId: number

    @Field()
    @Column()
    creatorId: number

    @ManyToOne(() => Factory, (factory) => factory.manufacturerCreate)
    creator: Factory;

    @ManyToOne(() => ProductByTier, (productByTier) => productByTier.factoryCreate)
    product: ProductByTier;

    @ManyToOne(() => User, (user) => user.id)
    userCreate: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}