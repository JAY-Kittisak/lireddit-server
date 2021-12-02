import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { Branch } from '../types'
import { Customer, SalesRole, User } from './index';

@ObjectType()
@Entity()
export class SalesActual extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    detail: string

    @Field()
    @Column()
    actual: number

    @Field()
    @Column({
        type: "enum",
        enum: Branch,
        default: Branch.LATKRABANG
    })
    branch: Branch

    @Field()
    @Column()
    customerId: number

    @Field()
    @Column()
    userId: number

    @Field()
    @Column()
    salesRoleId: number

    @Field(() => Customer)
    @ManyToOne(() => Customer, customer => customer.salesActual, { primary: true })
    @JoinColumn({ name: "customerId" })
    customer: Promise<Customer>;

    @Field(() => User)
    @ManyToOne(() => User, user => user.salesActual, { primary: true })
    @JoinColumn({ name: "userId" })
    user: Promise<User>;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.salesActual, { primary: true })
    @JoinColumn({ name: "salesRoleId" })
    salesRole: Promise<SalesRole>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}