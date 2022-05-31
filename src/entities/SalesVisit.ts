import {
    BaseEntity, Column, Entity, UpdateDateColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne, OneToMany
} from "typeorm"
import { Field, ObjectType, Ctx } from "type-graphql"
import { JobPurpose, CustomerType } from '../types'
import { SalesRole, VisitIssue, SalesIssue, SalesQuotation } from './index';
import { MyContext } from '../types';

@ObjectType()
@Entity()
export class SalesVisit extends BaseEntity {
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
    customer: string

    @Field()
    @Column()
    visitDate: string

    @Field()
    @Column()
    contactName: string

    @Field()
    @Column()
    position: string

    @Field()
    @Column()
    department: string

    @Field()
    @Column({
        type: "enum",
        enum: JobPurpose,
        default: JobPurpose.NEW_ISSUE
    })
    jobPurpose: JobPurpose

    @Field()
    @Column({
        type: "enum",
        enum: CustomerType,
        default: CustomerType.NEW_ONE
    })
    customerType: CustomerType

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.visits, { primary: true })
    @JoinColumn({ name: "saleRoleId" })
    saleRole: Promise<SalesRole>;

    @Field(() => [SalesQuotation])
    @OneToMany(() => SalesQuotation, (quotation) => quotation.visit)
    quotations: Promise<SalesQuotation[]>;

    @OneToMany(() => VisitIssue, vi => vi.visit)
    issueConnection: Promise<VisitIssue[]>;

    @Field(() => [SalesIssue], { nullable: true })
    async issueReceives(@Ctx() { issuesLoader }: MyContext): Promise<SalesIssue[]> {
        return issuesLoader.load(this.id)
    }
}