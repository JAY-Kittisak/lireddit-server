// All factories in the country 
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm'
import { Ctx, Field, ObjectType } from 'type-graphql';
import { ProductByTier } from './ProductByTier';
import { FactoryProduct } from './FactoryProduct'
import { MyContext } from 'src/types';

@ObjectType()
@Entity()
export class Factory extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    industrialEstate!: string;

    @Field()
    @Column()
    businessType!: string;

    @Field()
    @Column()
    companyName!: string;

    @Field()
    @Column()
    description: string;

    @Field()
    @Column()
    address: string;

    @Field()
    @Column()
    phoneNumber: string;

    @Field()
    @Column()
    FAX: string;

    @Field()
    @Column()
    Email: string;

    @Field(() => [ProductByTier])
    @OneToMany(() => ProductByTier, (productByTier) => productByTier.creator)
    products: Promise<ProductByTier[]>;

    @OneToMany(() => FactoryProduct, fp => fp.factory)
    productConnection: Promise<FactoryProduct[]>;

    @Field(() => [ProductByTier], { nullable: true }) // เป็น null ได้
    async productReceives(@Ctx() { productsLoader }: MyContext): Promise<ProductByTier[]> {
        return productsLoader.load(this.id)
    }
}