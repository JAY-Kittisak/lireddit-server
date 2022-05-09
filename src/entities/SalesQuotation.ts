import {
    BaseEntity, Column, Entity, UpdateDateColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    JoinColumn, ManyToOne
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { SalesRole, SalesVisit } from './index';

@ObjectType()
@Entity()
export class SalesQuotation extends BaseEntity {
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
    visitId: number

    @Field()
    @Column()
    quotationCode: string

    @Field()
    @Column()
    value: number

    @Field()
    @Column()
    branch: string

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.quotations, { primary: true })
    @JoinColumn({ name: "saleRoleId" })
    saleRole: Promise<SalesRole>;

    @Field(() => SalesVisit)
    @ManyToOne(() => SalesVisit, visit => visit.quotations, { primary: true })
    @JoinColumn({ name: "visitId" })
    visit: Promise<SalesVisit>;
}