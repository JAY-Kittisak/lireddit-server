import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { ManualADUrl } from './ManualADUrl'


@ObjectType()
@Entity()
export class ManualAD extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    factoryName: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    email: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    telephoneNumber: string;

    @Field(() => [ManualADUrl])
    @OneToMany(() => ManualADUrl, (manualADUrl) => manualADUrl.manualAD)
    manualADUrl: Promise<ManualADUrl[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}