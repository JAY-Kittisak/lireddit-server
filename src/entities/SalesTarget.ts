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
export class SalesTarget extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    year: number

    @Field()
    @Column()
    commission: number

    @Field()
    @Column()
    strategy: number

    @Field()
    @Column({
        type: "enum",
        enum: Branch,
        default: Branch.LATKRABANG
    })
    branch: Branch

    @Field()
    @Column()
    salesRoleId: number;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.targets, { primary: true })
    @JoinColumn({ name: "salesRoleId" })
    sale: Promise<SalesRole>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}