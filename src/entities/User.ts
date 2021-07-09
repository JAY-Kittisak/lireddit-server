import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { UserRole, Departments } from '../types'

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field()
    @Column()
    email!: string;

    @Field(() => String)
    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.CLIENT_LKB
    })
    roles!: UserRole

    @Field({ nullable: true })
    @Column({ nullable: true })
    fullNameTH?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    fullNameEN?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    nickName?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field(() => String)
    @Column({
        nullable: true,
        type: "enum",
        enum: Departments,
        default: Departments.CLIENT
    })
    departments?: Departments

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}