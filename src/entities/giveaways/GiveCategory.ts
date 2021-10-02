import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';


@ObjectType()
@Entity()
export class GiveCategory extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    catName: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;
}