import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { StatusJob } from '../types'
import { User } from './User';

@ObjectType()
@Entity()
export class JobIT extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    titled: string

    @Field()
    @Column()
    desiredDate: string

    @Field()
    @Column()
    category: string

    @Field()
    @Column({
        type: "enum",
        enum: StatusJob,
        default: StatusJob.NEW
    })
    status: StatusJob

    @Field({ nullable: true })
    @Column({ nullable: true })
    itComment?: string

    @Field({ nullable: true })
    @Column({ nullable: true })
    itActionName?: string

    @Field()
    @Column()
    creatorId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.jobITs, { primary: true })
    @JoinColumn({ name: "creatorId" })
    creator: Promise<User>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}