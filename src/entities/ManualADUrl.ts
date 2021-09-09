import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { ManualAD } from './ManualAD'

@ObjectType()
@Entity()
export class ManualADUrl extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    manualId: number;

    @Field()
    @Column()
    title: string;

    @Field()
    @Column()
    url: string;

    @Field(() => ManualAD)
    @ManyToOne(() => ManualAD, manual => manual.manualADUrl, { primary: true })
    @JoinColumn({ name: "manualId" })
    manualAD: Promise<number>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}