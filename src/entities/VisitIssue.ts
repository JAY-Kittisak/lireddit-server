import { ObjectType } from 'type-graphql';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SalesVisit, SalesIssue } from './index';

@ObjectType()
@Entity()
export class VisitIssue extends BaseEntity {
    @PrimaryColumn()
    visitId: number;

    @PrimaryColumn()
    issueId: number;

    @ManyToOne(() => SalesVisit, visit => visit.issueConnection, { primary: true })
    @JoinColumn({ name: "visitId" })
    visit: Promise<SalesVisit>;

    @ManyToOne(() => SalesIssue, issue => issue.visitConnection, { primary: true })
    @JoinColumn({ name: "issueId" })
    issue: Promise<SalesIssue>
}