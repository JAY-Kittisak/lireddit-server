// All factories in the country 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Manufacturer } from './Manufacturer';

@ObjectType()
@Entity()
export class ProductByTier extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    productName!: string;

    @Field()
    @Column()
    description: string;

    @Field()
    @Column()
    category: string;

    @OneToMany(() => Manufacturer, (manufacturer) => manufacturer.product)
    factoryCreate: Manufacturer[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}