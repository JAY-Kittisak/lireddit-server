import {
    BaseEntity, Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { Approve } from '../types'
import { User } from './User';

@ObjectType()
@Entity()
export class Leave extends BaseEntity {
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
    @Column({
        default: "0"
    })
    sumDate: string

    @Field()
    @Column({
        default: "0"
    })
    sumHour: string

    @Field(() => String)
    @Column()
    dateBegin: Date;

    @Field(() => String)
    @Column()
    dateEnd: Date;

    @Field()
    @Column({
        type: "enum",
        enum: Approve,
        default: Approve.PENDING
    })
    status: Approve

    @Field({ nullable: true })
    @Column({ nullable: true })
    BossActionName?: string

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @Column({
        default: 0
    })
    branch: number

    @Field({ nullable: true })
    @Column({ nullable: true })
    pdfFile?: string

    @Field(() => User)
    @ManyToOne(() => User, user => user.leaves, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}