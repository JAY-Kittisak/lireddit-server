import {
    BaseEntity, Column, Entity, UpdateDateColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne,OneToMany
} from "typeorm"
import { Field, ObjectType, Ctx } from "type-graphql"
import { IssueCat, Prob, ClosedStatus, FailReason} from '../types'
import { SalesRole, SalesEditIssue ,VisitIssue , SalesVisit} from './index';
import { MyContext } from '../types'

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
    @Column({default: "null"})
    customer: string

    @Field()
    @Column()
    detail: string

    @Field()
    @Column()
    issueValue: number

    @Field()
    @Column()
    forecastDate: string

    @Field()
    @Column()
    brand: string

    @Field()
    @Column({
        type: "enum",
        enum: IssueCat,
        default: IssueCat.ONE_SHOT
    })
    category: IssueCat

    @Field()
    @Column()
    units: number

    @Field()
    @Column()
    model: string

    @Field()
    @Column()
    size: string

    @Field()
    @Column()
    status: string

    @Field()
    @Column({
        type: "enum",
        enum: Prob,
        default: Prob.LESS_THIRTY
    })
    rate: Prob

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

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.issues, { primary: true })
    @JoinColumn({ name: "saleRoleId" })
    saleRole: Promise<SalesRole>;

    @Field(() => [SalesEditIssue])
    @OneToMany(() => SalesEditIssue, (edit) => edit.issue)
    editIssues: Promise<SalesEditIssue[]>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => VisitIssue, vi => vi.issue)
    visitConnection: Promise<VisitIssue[]>;

    @Field(() => [SalesVisit], { nullable: true })
    async visitLoaders(@Ctx() { visitsLoader }: MyContext): Promise<SalesVisit[]> {
        return visitsLoader.load(this.id)
    }
}