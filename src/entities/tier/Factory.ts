// All factories in the country 
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Manufacturer } from './Manufacturer';

@ObjectType()
@Entity()
export class Factory extends BaseEntity {
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

    @Field(() => [Manufacturer])
    @OneToMany(() => Manufacturer, (manufacturer) => manufacturer.creator)
    manufacturerCreate: Manufacturer[];
}