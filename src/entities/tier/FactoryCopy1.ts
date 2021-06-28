// All factories in the country 
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { ManufacturerCopy1 } from './ManufacturerCopy1';

@ObjectType()
@Entity()
export class FactoryCopy1 extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    industrialEstate!: string;

    @Field()
    @Column()
    businessType!: string;

    @Field()
    @Column()
    companyName!: string;

    @Field()
    @Column()
    description: string;

    @Field()
    @Column()
    address: string;

    @Field()
    @Column()
    phoneNumber: string;

    @Field()
    @Column()
    FAX: string;

    @Field()
    @Column()
    Email: string;

    @Field(() => [ManufacturerCopy1])
    @OneToMany('ManufacturerCopy1', (manufacturerCopy1: ManufacturerCopy1) => manufacturerCopy1.creator, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    manufacturerCreate: Array<ManufacturerCopy1>

    @Field(() => [ManufacturerCopy1])
    @ManyToMany(() => ManufacturerCopy1, (manufacturerCopy1) => manufacturerCopy1.creator)
    @JoinTable({ name: 'manufacturer_copy1_customer_factory_copy1' })
    customer: ManufacturerCopy1[];
}