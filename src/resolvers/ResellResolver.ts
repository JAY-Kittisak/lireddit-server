import { MyContext } from "../types";
import {
    Field,
    InputType,
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    Int,
    ObjectType,
} from "type-graphql";
import { getConnection } from "typeorm"

import { Resell, Customer } from "../entities"

@InputType()
class Resell_Input {
    @Field()
    orderId: number
    @Field()
    maker: string
    @Field()
    title: string
    @Field()
    detail: string
    @Field()
    category: string
}

@InputType()
class Customer_Input {
    @Field()
    customerCode: string
    @Field()
    customerName: string
    @Field()
    address: string
    @Field()
    phone: string
    @Field()
    email: string
    @Field()
    province: string
    @Field()
    amphure: string
    @Field()
    district: string
    @Field()
    zipCode: number
}

@ObjectType()
class FieldErrorResell {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class Resell_Response {
    @Field(() => [FieldErrorResell], { nullable: true })
    errors?: FieldErrorResell[];

    @Field(() => Resell, { nullable: true })
    resell?: Resell;
}

@ObjectType()
class Customer_Response {
    @Field(() => [FieldErrorResell], { nullable: true })
    errors?: FieldErrorResell[];

    @Field(() => [Customer], { nullable: true })
    customers?: Customer[];
}

@Resolver()
export class ResellResolver {
    @Query(() => [Resell], { nullable: true })
    async resells(
        @Arg("createBy", () => Boolean) createBy: boolean,
        @Ctx() { req }: MyContext
    ): Promise<Resell[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const resell = getConnection()
            .getRepository(Resell)
            .createQueryBuilder("r")
            .orderBy('r.createdAt', "DESC")

        if (createBy) {
            resell.where("r.creatorId = :id", { id: req.session.userId })
        }

        return await resell.getMany()
    }

    @Query(() => Resell)
    async resellById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Resell | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return await Resell.findOne(id);
    }

    @Mutation(() => Resell_Response)
    async createResell(
        @Arg("input") input: Resell_Input,
        @Ctx() { req }: MyContext
    ): Promise<Resell_Response> {
        if (!req.session.userId) throw new Error("Please Login.")
        const customer = await Customer.findOne({ where: { id: input.orderId } })

        if (!customer) {
            return {
                errors: [
                    {
                        field: "orderId",
                        message: "Error! ไม่พบ Customer ID"
                    }
                ]
            }
        }
        if (input.title.length < 1) {
            return {
                errors: [
                    {
                        field: "title",
                        message: "โปรดระบุ"
                    }
                ]
            }
        }
        if (input.detail.length <= 5) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }

        const resell = await Resell.create({
            orderId: input.orderId,
            maker: input.maker,
            title: input.title,
            detail: input.detail,
            category: input.category,
            creatorId: req.session.userId,
        }).save()

        return { resell }
    }
    // ---------------------------------------- Customer ----------------------------------------
    @Query(() => [Customer], { nullable: true })
    async customers
        (@Ctx() { req }: MyContext
        ): Promise<Customer[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const customer = getConnection()
            .getRepository(Customer)
            .createQueryBuilder("c")
            .orderBy('c.createdAt', "DESC")

        return await customer.getMany()
    }

    @Query(() => Customer)
    async customerById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Customer | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")
        return await Customer.findOne(id);
    }

    @Mutation(() => Customer_Response)
    async createCustomer(
        @Arg("input") input: Customer_Input,
        @Ctx() { req }: MyContext
    ): Promise<Customer_Response> {
        if (!req.session.userId) throw new Error("Please Login.")

        if (input.customerCode.length <= 5) {
            return {
                errors: [
                    {
                        field: "customerCode",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }

        if (input.customerName.length <= 5) {
            return {
                errors: [
                    {
                        field: "customerName",
                        message: "ความยาวต้องมากกว่า 5"
                    }
                ]
            }
        }

        if (input.address.length < 1) {
            return {
                errors: [
                    {
                        field: "address",
                        message: "โปรดระบุ"
                    }
                ]
            }
        }

        if (input.amphure.length < 1) {
            return {
                errors: [
                    {
                        field: "amphure",
                        message: "โปรดระบุ"
                    }
                ]
            }
        }

        if (input.district.length < 1) {
            return {
                errors: [
                    {
                        field: "district",
                        message: "โปรดระบุ"
                    }
                ]
            }
        }

        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Customer)
                .values(
                    {
                        customerCode: input.customerCode,
                        customerName: input.customerName,
                        address: input.address,
                        phone: input.phone,
                        email: input.email,
                        province: input.province,
                        amphure: input.amphure,
                        district: input.district,
                        zipCode: input.zipCode,
                        creatorId: req.session.userId,
                    }
                )
                .returning('*')
                .execute()
        } catch (err) {
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: "customerCode",
                            message: "Customer Code นี้มีอยู่แล้ว"
                        }
                    ]
                }
            }
        }

        const customer = getConnection()
            .getRepository(Customer)
            .createQueryBuilder("c")
            .orderBy('c.createdAt', "DESC")

        const customers = await customer.getMany()

        return { customers }
    }
}