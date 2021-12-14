import {
    BaseEntity, Column, Entity, UpdateDateColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { Branch } from '../types'
import { SalesRole } from './index';

@ObjectType()
@Entity()
export class SalesIssue extends BaseEntity {
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
    brand: string

    @Field()
    @Column({
        default: null
    })
    size: string

    @Field()
    @Column({
        default: null
    })
    model: string

    @Field()
    @Column()
    value: number

    @Field()
    @Column({
        type: "enum",
        enum: Branch,
        default: Branch.LATKRABANG
    })
    branch: Branch

    @Field()
    @Column()
    status: string

    @Field()
    @Column()
    contact: string

    @Field()
    @Column()
    salesRoleId: number;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.issues, { primary: true })
    @JoinColumn({ name: "salesRoleId" })
    sale: Promise<SalesRole>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}