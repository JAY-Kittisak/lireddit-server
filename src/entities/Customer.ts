import {
    BaseEntity, Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType, Ctx } from "type-graphql"
import { User } from './User';
import { Resell } from './Resell';
import { SalesActual } from './SalesActual';
import { ResellJoinCustomer } from './ResellJoinCustomer';
import { MyContext } from '../types'

@ObjectType()
@Entity()
export class Customer extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ unique: true })
    customerCode: string

    @Field()
    @Column()
    customerName: string

    @Field()
    @Column()
    address: string

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

    @OneToMany(() => ResellJoinCustomer, rc => rc.customer)
    resellConnection: Promise<ResellJoinCustomer[]>;

    @Field(() => [Resell])
    async resellLoaders(@Ctx() { resellsLoader }: MyContext): Promise<Resell[]> {
        return resellsLoader.load(this.id)
    }

    @Field(() => [SalesActual])
    @OneToMany(() => SalesActual, (actual) => actual.customer)
    salesActual: Promise<SalesActual[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}