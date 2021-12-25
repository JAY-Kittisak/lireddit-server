import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn
} from "typeorm"
import { Field, ObjectType, } from "type-graphql"

@ObjectType()
@Entity()
export class CustomerByTarn extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    sourceId: string

    @Field()
    @Column()
    customerCode: string

    @Field()
    @Column()
    factoryNum: string

    @Field()
    @Column()
    tsic: string

    @Field()
    @Column()
    texNo: string

    @Field()
    @Column()
    corporateNum: string

    @Field()
    @Column()
    customerPrefix: string

    @Field()
    @Column()
    customerNameTh: string

    @Field()
    @Column()
    customerNameEn: string

    @Field()
    @Column()
    branch: string

    @Field()
    @Column()
    houseNo: string

    @Field()
    @Column()
    villageNo: string

    @Field()
    @Column()
    lane: string

    @Field()
    @Column()
    industrialEstate: string

    @Field()
    @Column()
    road: string

    @Field()
    @Column()
    district: string

    @Field()
    @Column()
    amphur: string

    @Field()
    @Column()
    province: string

    @Field()
    @Column()
    zipcode: string

    @Field()
    @Column()
    createDate: string

    @Field()
    @Column()
    updateDate: string

    @Field()
    @Column()
    businessInfo: string

    @Field()
    @Column()
    category: string

    @Field()
    @Column()
    categoryRegister: string

    @Field()
    @Column()
    capital: string

    @Field()
    @Column()
    worker: string

    @Field()
    @Column()
    horsepower: string

    @Field()
    @Column()
    status: string

}