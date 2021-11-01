import {
    BaseEntity,
    Column,
    Entity,
    PrimaryColumn,
    OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Amphures } from './Amphures'

@ObjectType()
@Entity()
export class Provinces extends BaseEntity {
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
    geography_id: number;

    @Field(() => [Amphures])
    @OneToMany(() => Amphures, (amphures) => amphures.province)
    amphures: Promise<Amphures[]>;
}