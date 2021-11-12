import {
    BaseEntity, Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { User } from './User';
import { Resell } from './Resell';

@ObjectType()
@Entity()
export class Customer extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column({ unique: true })
    customerCode: string

    @Field()
    @Column()
    customerName: string

    @Field()
    @Column()
    phone: string

    @Field()
    @Column()
    email: string

    @Field()
    @Column()
    province: string

    @Field()
    @Column()
    amphure: string

    @Field()
    @Column()
    district: string

    @Field()
    @Column()
    zipCode: number

    @Field()
    @Column()
    creatorId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.customer, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => [Resell])
    @OneToMany(() => Resell, (Resell) => Resell.orderCustomer)
    orderResell: Promise<Resell[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}