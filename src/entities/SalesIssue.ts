import {
    BaseEntity, Column, Entity, UpdateDateColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { Branch, IssueCat, Prob } from '../types'
import { SalesRole } from './index';

@ObjectType()
@Entity()
export class SalesIssue extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    saleRoleId: number

    @Field()
    @Column()
    saleName: string

    @Field()
    @Column()
    contact: string

    @Field()
    @Column()
    customer: string

    @Field()
    @Column()
    quotationNo: string

    @Field()
    @Column()
    brand: string

    @Field()
    @Column({
        type: "enum",
        enum: IssueCat,
        default: IssueCat.AUTOMATION
    })
    category: IssueCat

    @Field()
    @Column()
    detail: string

    @Field()
    @Column({
        type: "enum",
        enum: Prob,
        default: Prob.LESS_THIRTY
    })
    prob: Prob

    @Field()
    @Column()
    status: string

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

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.issues, { primary: true })
    @JoinColumn({ name: "saleRoleId" })
    saleRole: Promise<SalesRole>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}