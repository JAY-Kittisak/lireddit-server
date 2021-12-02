import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn,
    OneToOne, JoinColumn, OneToMany
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { Branch, CurrentStatus } from '../types'
import { User, SalesActual } from './index';

@ObjectType()
@Entity()
export class SalesRole extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    salesRole: string

    @Field()
    @Column()
    targetId: number

    @Field()
    @Column()
    channel: string

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
        enum: CurrentStatus,
        default: CurrentStatus.UNOCCUPIED
    })
    status: CurrentStatus

    @Field()
    @Column()
    userId: number;

    @Field(() => User)
    @OneToOne(() => User, user => user.salesRole, { primary: true })
    @JoinColumn({ name: "userId" })
    user: Promise<User>;

    @Field(() => [SalesActual])
    @OneToMany(() => SalesActual, (actual) => actual.salesRole)
    salesActual: Promise<SalesActual[]>;
}