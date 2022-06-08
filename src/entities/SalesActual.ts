import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from "typeorm"
import { Field, ObjectType } from "type-graphql"
import { SalesRole, User } from './index';

@ObjectType()
@Entity()
export class SalesActual extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    actual: number

    @Field()
    @Column()
    userId: number

    @Field()
    @Column()
    salesRoleId: number

    @Field(() => User)
    @ManyToOne(() => User, user => user.salesActual, { primary: true })
    @JoinColumn({ name: "userId" })
    user: Promise<User>;

    @Field(() => SalesRole)
    @ManyToOne(() => SalesRole, role => role.salesActual, { primary: true })
    @JoinColumn({ name: "salesRoleId" })
    salesRole: Promise<SalesRole>;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}