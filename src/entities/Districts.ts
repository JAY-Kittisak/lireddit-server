import {
    BaseEntity,
    Column,
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql';
import { Amphures } from './Amphures'

@ObjectType()
@Entity()
export class Districts extends BaseEntity {
    @Field()
    @PrimaryColumn()
    id: number;

    @Field()
    @Column()
    zip_code: number;

    @Field()
    @Column()
    name_th: string;

    @Field()
    @Column()
    name_en: string;

    @Field()
    @Column()
    amphure_id: number;

    @Field(() => Amphures)
    @ManyToOne(() => Amphures, amphures => amphures.districts, { primary: true })
    @JoinColumn({ name: "amphure_id" })
    amphure: Promise<Amphures>;
}