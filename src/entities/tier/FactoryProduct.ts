import { ObjectType } from 'type-graphql';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ProductByTier } from './ProductByTier';
import { Factory } from './Factory'

@ObjectType()
@Entity()
export class FactoryProduct extends BaseEntity {
    @PrimaryColumn()
    factoryId: number;

    @PrimaryColumn()
    productId: number;

    @ManyToOne(() => Factory, factory => factory.productConnection, { primary: true })
    @JoinColumn({ name: "factoryId" })
    factory: Promise<Factory>;

    @ManyToOne(() => ProductByTier, product => product.factoryConnection, { primary: true })
    @JoinColumn({ name: "productId" })
    product: Promise<ProductByTier>

    @OneToMany(() => FactoryProduct, fp => fp.factory)
    bookConnection: Promise<FactoryProduct[]>;
}