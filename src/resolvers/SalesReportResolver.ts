import { IssueCat, MyContext, Prob } from "../types";
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
import { getConnection } from "typeorm";

import {
    User,
    Customer,
    SalesRole,
    SalesActual,
    SalesTarget,
    SalesIssue,
} from "../entities";
import { CurrentStatus, Branch } from "../types";

const { lineNotifyToDevGroup } = require("../notify");

@InputType()
class SalesRole_Input {
    @Field()
    salesRole: string;
    @Field()
    channel: string;
    @Field()
    branch: Branch;
    @Field()
    status: CurrentStatus;
    @Field()
    userId: number;
}

@InputType()
class SalesTarget_Input {
    @Field()
    year: number;
    @Field()
    value: number;
    @Field()
    branch: Branch;
    @Field()
    salesRoleId: number;
}

@InputType()
class SalesIssue_Input {
    @Field()
    customer: string;
    @Field()
    quotationNo: string;
    @Field()
    brandId: number;
    @Field()
    category: IssueCat;
    @Field()
    detail: string;
    @Field()
    prob: Prob;
    @Field()
    status: string
    @Field()
    value: number;
    @Field()
    contact: string;
}

@InputType()
class SalesActual_Input {
    @Field()
    title: string;
    @Field()
    detail: string;
    @Field()
    actual: number;
    @Field()
    branch: Branch;
    @Field()
    customerId: number;
    @Field()
    userId: number;
    @Field()
    salesRoleId: number;
}

@ObjectType()
class FieldErrorSalesRole {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class SalesRole_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesRole], { nullable: true })
    salesRoles?: SalesRole[];
}

@ObjectType()
class SalesTarget_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesTarget], { nullable: true })
    salesTargets?: SalesTarget[];
}

@ObjectType()
class SalesIssue_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesIssue], { nullable: true })
    salesIssues?: SalesIssue[];
}

@ObjectType()
class SalesActual_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => [SalesActual], { nullable: true })
    salesActual?: SalesActual[];
}

@Resolver()
export class SalesReportResolver {
    @Query(() => [SalesRole], { nullable: true })
    async salesRoles(
        @Ctx() { req }: MyContext
    ): Promise<SalesRole[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const role = getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy("s.salesRole", "ASC");

        return await role.getMany();
    }

    @Query(() => SalesRole)
    async salesRoleById(
        @Arg("id", () => Int) id: number,
        @Arg("monthIndex", () => Int) monthIndex: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesRole | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const user = await User.findOne({ where: { id: req.session.userId } });
        const role = await SalesRole.findOne(id);

        const reducer = (previousValue: number, currentValue: number) =>
            previousValue + currentValue;
        const formatAmount = (amount: number) =>
            amount.toLocaleString("en", { minimumFractionDigits: 0 });
        const month = [
            "มกราคม",
            "กุมภาพันธ์",
            "มีนาคม",
            "เมษายน",
            "พฤษภาคม",
            "มิถุนายน",
            "กรกฎาคม",
            "สิงหาคม",
            "กันยายน",
            "ตุลาคม",
            "พฤศจิกายน",
            "ธันวาคม",
        ];

        if ((monthIndex > 0) && role?.userId && (await role.salesActual).length > 0) {
            const name = (await role?.user).fullNameTH;

            const actualFilter = (await role?.salesActual)
                .filter((item) => item.createdAt.getMonth() === (monthIndex - 1))
                .map((val) => val.actual)
                .reduce(reducer);
            const targetFilter = (await role?.targets)
                .filter((item) => item.year === 2021)
                .map((val) => val.value)
                .reduce(reducer);
            const targetOneMonth = targetFilter / 12
            const targetToFixed = targetOneMonth.toFixed(0)
            const percent = (actualFilter / targetOneMonth) * 100;

            let monthly = month[monthIndex - 1];
            lineNotifyToDevGroup(
                `แจ้งเตือนยอดขาย\n${role.salesRole
                }: ${name}\nTarget: เดือน ${monthly} คือ ${formatAmount(
                    +targetToFixed
                )}\nยอดขายที่ทำได้ ณ ปัจจุบัน ${formatAmount(
                    actualFilter
                )} คิดเป็น ${percent.toFixed(2)} เปอร์เซ็นต์\nผู้กดแจ้งเตือน: ${user?.fullNameTH
                }\nตำแหน่ง: พนักงาน`
            );
        }

        return role;
    }

    @Mutation(() => SalesRole_Response)
    async createSalesRole(
        @Arg("input") input: SalesRole_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesRole_Response> {
        if (!req.session.userId) throw new Error("Please Login.");
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID",
                    },
                ],
            };
        }
        if (input.salesRole.length !== 7) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "ความยาวต้องมากกว่า 6",
                    },
                ],
            };
        }
        if (input.channel.length <= 3) {
            return {
                errors: [
                    {
                        field: "channel",
                        message: "ความยาวต้องมากกว่า 3",
                    },
                ],
            };
        }

        await SalesRole.create({
            salesRole: input.salesRole,
            channel: input.channel,
            branch: input.branch,
            status: input.status,
            userId: input.userId,
        }).save();

        const salesRoles = await getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy("s.salesRole", "DESC")
            .getMany();

        return { salesRoles };
    }

    @Query(() => [SalesActual], { nullable: true })
    async salesActuals(
        @Ctx() { req }: MyContext
    ): Promise<SalesActual[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const actual = getConnection()
            .getRepository(SalesActual)
            .createQueryBuilder("sa")
            .orderBy("sa.id", "DESC");

        return await actual.getMany();
    }

    @Mutation(() => SalesActual_Response)
    async createSalesActual(
        @Arg("input") input: SalesActual_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesActual_Response> {
        if (!req.session.userId) throw new Error("Please Login.");
        const customer = await Customer.findOne({
            where: { id: input.customerId },
        });
        const salesRole = await SalesRole.findOne({
            where: { id: input.salesRoleId },
        });
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (!customer) {
            return {
                errors: [
                    {
                        field: "customer",
                        message: "Error! ไม่พบ Customer ID",
                    },
                ],
            };
        }
        if (!salesRole) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "Error! ไม่พบ SalesRole ID",
                    },
                ],
            };
        }
        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID",
                    },
                ],
            };
        }
        if (input.title.length <= 5) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "ความยาวต้องมากกว่า 5",
                    },
                ],
            };
        }
        if (input.detail.length <= 3) {
            return {
                errors: [
                    {
                        field: "channel",
                        message: "ความยาวต้องมากกว่า 3",
                    },
                ],
            };
        }

        const { title, detail, actual, branch, customerId, userId, salesRoleId } =
            input;
        await SalesActual.create({
            title,
            detail,
            actual,
            branch,
            customerId,
            userId,
            salesRoleId,
        }).save();

        const salesActual = await getConnection()
            .getRepository(SalesActual)
            .createQueryBuilder("sa")
            .orderBy("sa.id", "DESC")
            .getMany();

        return { salesActual };
    }

    @Mutation(() => Boolean)
    async deleteSalesActual(@Arg("id", () => Int) id: number): Promise<boolean> {
        await SalesActual.delete(id);
        return true;
    }

    @Mutation(() => Boolean)
    async deleteSalesRole(@Arg("id", () => Int) id: number): Promise<boolean> {
        await SalesRole.delete(id);
        return true;
    }

    // ------------------------------------------- TARGET ------------------------------------------------
    @Query(() => [SalesTarget], { nullable: true })
    async targetByRoleId(
        @Arg("salesRoleId", () => Int) salesRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const target = getConnection()
            .getRepository(SalesTarget)
            .createQueryBuilder("t")
            .orderBy("t.year", "DESC")
            .where("t.salesRoleId = :salesRoleId", { salesRoleId });

        return await target.getMany();
    }

    @Mutation(() => SalesTarget_Response)
    async createSalesTarget(
        @Arg("input") input: SalesTarget_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget_Response> {
        if (!req.session.userId) throw new Error("Please Login.");

        if (!input.year) {
            return {
                errors: [
                    {
                        field: "year",
                        message: "โปรดใส่ปีให้ถูกต้อง",
                    },
                ],
            };
        }
        if (!input.value) {
            return {
                errors: [
                    {
                        field: "value",
                        message: "โปรดใส่ Target",
                    },
                ],
            };
        }

        await SalesTarget.create({
            year: input.year,
            value: input.value,
            branch: input.branch,
            salesRoleId: input.salesRoleId,
        }).save();

        const salesTargets = await getConnection()
            .getRepository(SalesTarget)
            .createQueryBuilder("t")
            .orderBy("t.year", "DESC")
            .where("t.salesRoleId = :salesRoleId", { salesRoleId: input.salesRoleId })
            .getMany();

        return { salesTargets };
    }

    // ------------------------------------------- ISSUE ------------------------------------------------
    @Query(() => [SalesIssue], { nullable: true })
    async issueByRoleId(
        @Arg("saleRoleId", () => Int) saleRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const issue = getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.saleRoleId = :saleRoleId", { saleRoleId });

        return await issue.getMany();
    }

    @Query(() => SalesIssue, { nullable: true })
    async issueById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const issue = getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.id = :id", { id });

        return await issue.getOne();
    }

    @Mutation(() => SalesIssue_Response)
    async createSalesIssue(
        @Arg("input") input: SalesIssue_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue_Response> {
        if (!req.session.userId) throw new Error("Please Login.");

        const user = await User.findOne({ where: { id: req.session.userId } });

        let saleName = ""
        let branch = Branch.LATKRABANG
        let saleRoleId = 0

        if (!user) {

            return {
                errors: [
                    {
                        field: "user",
                        message: "Error! ไม่พบ User ID",
                    },
                ],
            };
        } else {
            saleRoleId = (await user.salesRole).id
        }
        if (!user.fullNameTH) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "ไม่มีข้อมูล fullNameTH",
                    },
                ],
            };
        } else {
            saleName = user.fullNameTH
        }
        if (user.branch === 0) {
            branch = Branch.LATKRABANG
        } else if (user.branch === 1) {
            branch = Branch.CHONBURI
        }

        if (input.detail.length < 1) {
            return {
                errors: [
                    {
                        field: "detail",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.quotationNo.length < 1) {
            return {
                errors: [
                    {
                        field: "quotationNo",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (!input.value) {
            return {
                errors: [
                    {
                        field: "value",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.contact.length < 1) {
            return {
                errors: [
                    {
                        field: "contact",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        const {
            contact,
            customer,
            quotationNo,
            brandId,
            category,
            detail,
            prob,
            status,
            value,
        } = input;
        await SalesIssue.create({
            saleName,
            contact,
            customer,
            quotationNo,
            brandId,
            category,
            detail,
            prob,
            status,
            value,
            branch,
            saleRoleId,
        }).save();

        const salesIssues = await getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.saleRoleId = :saleRoleId", { saleRoleId })
            .getMany();

        return { salesIssues };
    }
}
