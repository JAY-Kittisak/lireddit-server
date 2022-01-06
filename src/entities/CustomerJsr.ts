import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class CustomerJsr extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    customerCode: string;

    @Field()
    @Column()
    customerPrefix: string;

    @Field()
    @Column()
    customerName: string;
}