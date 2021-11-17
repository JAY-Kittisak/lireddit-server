import { ObjectType } from 'type-graphql';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Resell } from './Resell';
import { Customer } from './Customer'


@ObjectType()
@Entity()
export class ResellJoinCustomer extends BaseEntity {
    @PrimaryColumn()
    resellId: number;

    @PrimaryColumn()
    customerId: number;

    @ManyToOne(() => Customer, customer => customer.resellConnection, { primary: true })
    @JoinColumn({ name: "customerId" })
    customer: Promise<Customer>

    @ManyToOne(() => Resell, resell => resell.customerConnection, { primary: true })
    @JoinColumn({ name: "resellId" })
    resell: Promise<Resell>;

    @OneToMany(() => ResellJoinCustomer, rc => rc.customer)
    bookResellConnection: Promise<ResellJoinCustomer[]>;
}