import {
    BaseEntity,
    Column,
    Entity,
    PrimaryColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Provinces } from './Provinces'
import { Districts } from './Districts'

@ObjectType()
@Entity()
export class Amphures extends BaseEntity {
    @Field()
    @PrimaryColumn()
    id: number;

    @Field()
    @Column()
    code: string;

    @Field()
    @Column()
    name_th: string;

    @Field()
    @Column()
    name_en: string;

    @Field()
    @Column()
    province_id: number;

    @Field(() => Provinces)
    @ManyToOne(() => Provinces, provinces => provinces.amphures, { primary: true })
    @JoinColumn({ name: "province_id" })
    province: Promise<Provinces>;

    @Field(() => [Districts])
    @OneToMany(() => Districts, (districts) => districts.amphure)
    districts: Promise<Districts[]>;
}