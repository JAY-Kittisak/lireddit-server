// All factories in the country 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, ManyToOne } from 'typeorm'
import { Ctx, Field, ObjectType } from 'type-graphql';
import { FactoryProduct } from './FactoryProduct';
import { Factory } from './Factory'
import { MyContext } from 'src/types';

@ObjectType()
@Entity()
export class ProductByTier extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    productName!: string;

    @Field()
    @Column()
    description: string;

    @Field()
    @Column()
    category: string;

    @Field()
    @Column()
    creatorName: string;

    @Field()
    @Column()
    creatorId: number;

    @OneToMany(() => FactoryProduct, ab => ab.product)
    factoryConnection: Promise<FactoryProduct[]>;

    @Field(() => Factory)
    @ManyToOne(() => Factory, (factory) => factory.products)
    creator: Factory;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => [Factory])
    async factorys(@Ctx() { factoriesLoader }: MyContext): Promise<Factory[]> {
        return factoriesLoader.load(this.id)
    }
}