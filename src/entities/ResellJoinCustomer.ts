import { ObjectType } from 'type-graphql';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Resell } from './Resell';
import { Customer } from './Customer'

@ObjectType()
@Entity()
export class ResellJoinCustomer extends BaseEntity {
    @PrimaryColumn()
    resellId: number;

    @PrimaryColumn()
    customerId: number;

    @ManyToOne(() => Resell, resell => resell.customerConnection, { primary: true })
    @JoinColumn({ name: "resellId" })
    resell: Promise<Resell>;

    @ManyToOne(() => Customer, customer => customer.resellConnection, { primary: true })
    @JoinColumn({ name: "customerId" })
    customer: Promise<Customer>
}