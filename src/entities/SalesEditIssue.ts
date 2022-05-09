import {
    BaseEntity, Column, Entity,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import {Branch, Prob, ClosedStatus, FailReason} from '../types'
import { SalesIssue } from './index';

@ObjectType()
@Entity()
export class SalesEditIssue extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    issueId: number

    @Field()
    @Column()
    userEdit: string

    @Field()
    @Column({
        type: "enum",
        enum: Branch,
        default: Branch.LATKRABANG
    })
    branch: Branch
    
    @Field()
    @Column({
        type: "enum",
        enum: Prob,
        default: Prob.LESS_THIRTY
    })
    rate: Prob

    @Field()
    @Column()
    status: string

    @Field()
    @Column()
    issueValue: number

    @Field()
    @Column({ default: 'Pending'})
    closedDate: string
    
    @Field()
    @Column({
        type: "enum",
        enum: ClosedStatus,
        default: ClosedStatus.PENDING
    })
    closedStatus: ClosedStatus

    @Field()
    @Column({
        type: "enum",
        enum: FailReason,
        default: FailReason.PENDING
    })
    failReason: FailReason

    @Field(() => SalesIssue)
    @ManyToOne(() => SalesIssue, issue => issue.editIssues, { primary: true })
    @JoinColumn({ name: "issueId" })
    issue: Promise<SalesIssue>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;
}