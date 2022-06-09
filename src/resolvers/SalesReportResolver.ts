import { IssueCat, MyContext, Prob, JobPurpose, CustomerType } from "../types";
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
    CustomerJsr,
    CustomerCdc,
    SalesRole,
    SalesActual,
    SalesTarget,
    SalesIssue,
    SalesBrand,
    SalesEditIssue,
    SalesVisit,
    VisitIssue,
    SalesQuotation
} from "../entities";
import { CurrentStatus, Branch, ClosedStatus, FailReason } from "../types";

const { lineNotifyToDevGroup } = require("../notify");

@InputType()
class SalesRole_Input {
    @Field()
    salesRole: string;
    @Field()
    channel: string;
    @Field()
    areaCode: string;
    @Field()
    branch: Branch;
    @Field()
    status: CurrentStatus;
    @Field()
    userId: number;
    @Field()
    startDate: string;
}

@InputType()
class SalesTarget_Input {
    @Field()
    year: number;
    @Field()
    commission: number;
    @Field()
    strategy: number;
    @Field()
    countVisit: number;
    @Field()
    countIssue: number;
    @Field()
    valueIssue: number;
    @Field()
    valueQt: number;
    @Field()
    salesRoleId: number;
}

@InputType()
class SalesIssue_Input {
    @Field()
    detail: string;
    @Field()
    issueValue: number;
    @Field()
    forecastDate: string;
    @Field()
    brand: string;
    @Field()
    category: IssueCat;
    @Field()
    units: number;
    @Field()
    model: string;
    @Field()
    size: string;
    @Field()
    status: string;
    @Field()
    rate: Prob;
    @Field()
    closedDate: string;
    @Field()
    closedStatus: ClosedStatus;
    @Field()
    failReason: FailReason;
}

@InputType()
class SalesQuotation_Input {
    @Field()
    visitId: number;
    @Field()
    quotationCode: string;
    @Field()
    value: number;
}

@InputType()
class SalesVisit_Input {
    @Field()
    customer: string;
    @Field()
    visitDate: string;
    @Field()
    contactName: string;
    @Field()
    position: string;
    @Field()
    department: string;
    @Field()
    jobPurpose: JobPurpose;
    @Field()
    customerType: CustomerType;
}

@InputType()
class UpdateIssue_Input {
    @Field()
    id: number;
    @Field()
    rate: Prob;
    @Field()
    status: string
    @Field()
    issueValue: number;
    @Field()
    closedDate: string
    @Field()
    closedStatus: ClosedStatus
    @Field()
    failReason: FailReason
}

@InputType()
class SalesActual_Input {
    @Field()
    actual: number;
    @Field()
    salesRoleId: number;
}

@InputType()
class JoinVisitInput {
    @Field()
    visitId: number
    @Field()
    issueId: number
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
class SalesVisit_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => SalesVisit, { nullable: true })
    salesVisit?: SalesVisit;
}

@ObjectType()
class SalesQuotation_Response {
    @Field(() => [FieldErrorSalesRole], { nullable: true })
    errors?: FieldErrorSalesRole[];

    @Field(() => SalesVisit, { nullable: true })
    salesVisit?: SalesVisit;
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
        @Arg("year", () => Int) year: number,
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

        if ((monthIndex > 0) && (year > 0) && role?.userId && (await role.salesActual).length > 0) {
            const name = (await role?.user).fullNameTH;

            const actualFilter = (await role?.salesActual)
                .filter((item) => item.createdAt.getMonth() === (monthIndex - 1))
                .map((val) => val.actual)
                .reduce(reducer, 0);
            const targetFilter = (await role?.targets)
                .filter((item) => item.year === year)
                .map((val) => val.commission)
                .reduce(reducer, 0);
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

        if (!user?.id) {
            return {
                errors: [
                    {
                        field: "userId",
                        message: "Error! ไม่พบ User ID",
                    },
                ],
            };
        }
        if (input.salesRole.length < 0) {
            return {
                errors: [
                    {
                        field: "salesRole",
                        message: "โปรดกรอกข้อมูล",
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
        if (input.areaCode.length !== 6) {
            return {
                errors: [
                    {
                        field: "areaCode",
                        message: "ความยาวต้องเท่ากับ 6 ตัวอักษร",
                    },
                ],
            };
        }
        if (input.startDate.length !== 10) {
            return {
                errors: [
                    {
                        field: "startDate",
                        message: "Error! Pattern.",
                    },
                ],
            };
        }

        await SalesRole.create({
            salesRole: input.salesRole,
            channel: input.channel,
            areaCode: input.areaCode,
            branch: input.branch,
            status: input.status,
            userId: input.userId,
            startDate: input.startDate
        }).save();

        const salesRoles = await getConnection()
            .getRepository(SalesRole)
            .createQueryBuilder("s")
            .orderBy("s.salesRole", "DESC")
            .getMany();

        return { salesRoles };
    }

    @Mutation(() => SalesRole)
    async updateSalesRole(
        @Arg("salesRole") salesRole: string,
        @Arg("id") id: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesRole | undefined>{
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const role = await SalesRole.findOne(id)
        if (!role) throw new Error("Error! issue not found.")

        role.salesRole = salesRole
        
        const result = await role.save();

        return result
    } 

    @Query(() => [SalesActual], { nullable: true })
    async actualByDate(
        @Arg("dateBegin") dateBegin: string,
        @Arg("dateEnd") dateEnd: string,
        @Ctx() { req }: MyContext
    ): Promise<SalesActual[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const actual = getConnection()
            .getRepository(SalesActual)
            .createQueryBuilder("sa")
            .orderBy("sa.createdAt", "DESC")

        if (dateBegin && dateEnd) {
            const dayBegin = new Date(dateBegin)
            const dayEnd = new Date(dateEnd)
            dayEnd.setDate(dayEnd.getDate() + 1)

            const beginning = dayBegin.toISOString()
            const ending = dayEnd.toISOString()

            actual.andWhere(`"sa"."createdAt"BETWEEN :begin AND :end`, { begin: beginning, end: ending });
        }

        return await actual.getMany()
    }

    @Mutation(() => Boolean)
    async createSalesActual(
        @Arg("input") input: SalesActual_Input,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        if (!req.session.userId) throw new Error("Please Login.");
        const salesRole = await SalesRole.findOne({
            where: { id: input.salesRoleId },
        });
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (!salesRole) {
            return false
        }
        if (!user) {
            return false
        }

        const { actual, salesRoleId } = input
        await SalesActual.create({
            actual,
            userId: req.session.userId,
            salesRoleId,
        }).save();

        return true
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
    async targetByRole(
        @Arg("salesRoleId", () => Int, { nullable: true }) salesRoleId: number,
        @Arg("year", () => Int, { nullable: true }) year: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        if (salesRoleId) return await SalesTarget.find({ salesRoleId })
        else return await SalesTarget.find({ year })
    }

    @Query(() => SalesTarget, { nullable: true })
    async targetByRoleId(
        @Arg("salesRoleId", () => Int) salesRoleId: number,
        @Arg("year", () => Int) year: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesTarget | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        return await SalesTarget.findOne({ salesRoleId, year })
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
        if (!input.commission) {
            return {
                errors: [
                    {
                        field: "commission",
                        message: "โปรดใส่ Target commission",
                    },
                ],
            };
        }
        if (!input.strategy) {
            return {
                errors: [
                    {
                        field: "strategy",
                        message: "โปรดใส่ Target strategy",
                    },
                ],
            };
        }
        if (!input.countVisit) {
            return {
                errors: [
                    {
                        field: "countVisit",
                        message: "โปรดใส่ Target Count Visit",
                    },
                ],
            };
        }
        if (!input.countIssue) {
            return {
                errors: [
                    {
                        field: "countIssue",
                        message: "โปรดใส่ Target Count Issue",
                    },
                ],
            };
        }
        if (!input.valueIssue) {
            return {
                errors: [
                    {
                        field: "valueIssue",
                        message: "โปรดใส่ Target Value Issue",
                    },
                ],
            };
        }
        if (!input.valueQt) {
            return {
                errors: [
                    {
                        field: "valueQt",
                        message: "โปรดใส่ Target value Qt",
                    },
                ],
            };
        }

        await SalesTarget.create({
            year: input.year,
            commission: input.commission,
            strategy: input.strategy,
            countVisit: input.countVisit,
            countIssue: input.countIssue,
            valueIssue: input.valueIssue,
            valueQt: input.valueQt,
            salesRoleId: input.salesRoleId
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
            .where("i.saleRoleId = :saleRoleId", { saleRoleId })

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
        if (input.issueValue === undefined) {
            return {
                errors: [
                    {
                        field: "issueValue",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.units === undefined) {
            return {
                errors: [
                    {
                        field: "units",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.model.length < 1) {
            return {
                errors: [
                    {
                        field: "model",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.size.length < 1) {
            return {
                errors: [
                    {
                        field: "size",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.forecastDate.length < 1) {
            return {
                errors: [
                    {
                        field: "forecastDate",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.closedDate.length < 1) {
            return {
                errors: [
                    {
                        field: "closedDate",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        const {
            detail,
            issueValue,
            forecastDate,
            brand,
            category,
            units,
            model,
            size,
            status,
            rate,
            closedDate,
            closedStatus,
            failReason
        } = input;
        await SalesIssue.create({
            saleRoleId,
            saleName,
            detail,
            issueValue,
            forecastDate,
            brand,
            category,
            units,
            model,
            size,
            status,
            rate,
            closedDate,
            closedStatus,
            failReason,
        }).save();

        const salesIssues = await getConnection()
            .getRepository(SalesIssue)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.saleRoleId = :saleRoleId", { saleRoleId })
            .getMany();

        return { salesIssues };
    }

    @Mutation(() => SalesIssue)
    async updateSalesIssue(
        @Arg("input") input: UpdateIssue_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesIssue | undefined>{
        if (!req.session.userId) throw new Error("กรุณา Login.")

        const user = await User.findOne({ where: { id: req.session.userId } });

        const issue = await SalesIssue.findOne(input.id)
        if (!issue) throw new Error("Error! issue not found.")

        await SalesEditIssue.create({
            issueId: input.id,
            userEdit: user?.fullNameTH,
            branch: (await issue.saleRole).branch,
            rate: input.rate,
            status: input.status,
            issueValue: input.issueValue,
            closedDate: input.closedDate,
            closedStatus: input.closedStatus,
            failReason: input.failReason,
        }).save()

        issue.rate = input.rate
        issue.status = input.status
        issue.issueValue = input.issueValue
        issue.closedDate = input.closedDate
        issue.closedStatus = input.closedStatus
        issue.failReason = input.failReason
        
        const result = await issue.save();

        return result
    }

    //------------------------------------------- Brand -------------------------------------------
    @Query(() => [SalesBrand], { nullable: true })
    async salesBrands(@Ctx() { req }: MyContext): Promise<SalesBrand[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const brands = getConnection()
            .getRepository(SalesBrand)
            .createQueryBuilder("b")
            .orderBy('b.id', "ASC")

        return await brands.getMany()
    }

    //------------------------------------------- CustomerJsr -------------------------------------------
    @Query(() => [CustomerJsr], { nullable: true })
    async customerJsr(
        @Arg("customerName") customerName: string,
        @Ctx() { req }: MyContext): Promise<CustomerJsr[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const customer = getConnection()
            .getRepository(CustomerJsr)
            .createQueryBuilder("c")
            .orderBy('c.id', "DESC")

        if (customerName) {
            customer.where("c.customerName like :customerName", {customerName: `%${customerName}%`})
            // customer.where("c.customerCode = :customerCode", {customerCode})
        } else {
            customer.limit(20)
        }

        return await customer.getMany()
    }

    //------------------------------------------- CustomerCdc -------------------------------------------
    @Query(() => [CustomerCdc], { nullable: true })
    async customerCdc(
        @Arg("customerName") customerName: string,
        @Ctx() { req }: MyContext): Promise<CustomerCdc[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.")

        const customer = getConnection()
            .getRepository(CustomerCdc)
            .createQueryBuilder("c")
            .orderBy('c.id', "DESC")

        if (customerName) {
            customer.where("c.customerName like :customerName", {customerName: `%${customerName}%`})
        } else {
            customer.limit(20)
        }

        return await customer.getMany()
    }

    //------------------------------------------- Visit -------------------------------------------
    @Query(() => [SalesVisit], { nullable: true })
    async visits(
        @Arg("dateBegin") dateBegin: string,
        @Arg("dateEnd") dateEnd: string,
        @Ctx() { req }: MyContext
    ): Promise<SalesVisit[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const dayBegin = new Date(dateBegin)
        const dayEnd = new Date(dateEnd)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const beginning = dayBegin.toISOString()
        const ending = dayEnd.toISOString()

        const visit = getConnection()
            .getRepository(SalesVisit)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .andWhere(`"i"."createdAt"BETWEEN :begin AND :end`, { begin: beginning, end: ending });

        return await visit.getMany();
    }

    @Query(() => [SalesVisit], { nullable: true })
    async visitByRoleId(
        @Arg("saleRoleId", () => Int) saleRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesVisit[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const visit = getConnection()
            .getRepository(SalesVisit)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.saleRoleId = :saleRoleId", { saleRoleId });

        return await visit.getMany();
    }

    @Query(() => SalesVisit, { nullable: true })
    async visitById(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesVisit | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const visit = getConnection()
            .getRepository(SalesVisit)
            .createQueryBuilder("i")
            .orderBy("i.createdAt", "DESC")
            .where("i.id = :id", { id });

        return await visit.getOne();
    }

    @Mutation(() => SalesVisit_Response)
    async createSalesVisit(
        @Arg("input") input: SalesVisit_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesVisit_Response> {
        if (!req.session.userId) throw new Error("Please Login.");

        const user = await User.findOne({ where: { id: req.session.userId } });

        let saleName = ""
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

        if (input.visitDate.length < 1) {
            return {
                errors: [
                    {
                        field: "visitDate",
                        message: "โปรดใส่วันที่ไปหาลูกค้า",
                    },
                ],
            };
        }
        if (input.contactName.length < 1) {
            return {
                errors: [
                    {
                        field: "contactName",
                        message: "โปรดใส่ข้อมูล ชื่อผู้ติดต่อ",
                    },
                ],
            };
        }
        if (input.position.length < 1) {
            return {
                errors: [
                    {
                        field: "position",
                        message: "โปรดใส่ข้อมูล ตำแหน่งผู้ติดต่อ",
                    },
                ],
            };
        }
        if (input.department.length < 1) {
            return {
                errors: [
                    {
                        field: "department",
                        message: "โปรดใส่ข้อมูล แผนกผู้ติดต่อ",
                    },
                ],
            };
        }
        const {
            customer,
            visitDate,
            contactName,
            position,
            department,
            jobPurpose,
            customerType,
        } = input

        const salesVisit = await SalesVisit.create({
            saleRoleId,
            saleName,
            customer,
            visitDate,
            contactName,
            position,
            department,
            jobPurpose,
            customerType
        }).save();

        // const salesVisits = await getConnection()
        //     .getRepository(SalesVisit)
        //     .createQueryBuilder("v")
        //     .orderBy("v.createdAt", "DESC")
        //     .where("v.saleRoleId = :saleRoleId", { saleRoleId })
        //     .getMany();

        return { salesVisit } ;
    }

    @Mutation(() => SalesVisit)
    async joinVisit(
        @Arg("input") input: JoinVisitInput
    ): Promise<SalesVisit | undefined> {
        await VisitIssue.create({ ...input }).save()
        return await SalesVisit.findOne({ id: input.visitId })
    }

    // @Mutation(() => Boolean)
    // async deleteVisit(@Arg("resellId", () => Int) resellId: number) {
    //     await ResellJoinCustomer.delete({ resellId })
    //     await Resell.delete({ id: resellId })
    //     return true
    // }

    @Mutation(() => SalesVisit)
    async deleteJoinVisit(@Arg("input") input: JoinVisitInput): Promise<SalesVisit | undefined> {
        await VisitIssue.delete({...input})
        return await SalesVisit.findOne({ id: input.visitId })
    }

    //------------------------------------------- Quotation -------------------------------------------
    @Query(() => [SalesQuotation], { nullable: true })
    async quotationByRoleId(
        @Arg("saleRoleId", () => Int) saleRoleId: number,
        @Ctx() { req }: MyContext
    ): Promise<SalesQuotation[] | undefined> {
        if (!req.session.userId) throw new Error("Please Login.");

        const quotations = getConnection()
            .getRepository(SalesQuotation)
            .createQueryBuilder("q")
            .orderBy("q.createdAt", "DESC")
            .where("q.saleRoleId = :saleRoleId", { saleRoleId });

        return await quotations.getMany();
    }
    
    @Mutation(() => SalesQuotation_Response)
    async createSalesQuotation(
        @Arg("input") input: SalesQuotation_Input,
        @Ctx() { req }: MyContext
    ): Promise<SalesQuotation_Response> {
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

        if (input.quotationCode.length < 1) {
            return {
                errors: [
                    {
                        field: "quotationCode",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        if (input.value === undefined) {
            return {
                errors: [
                    {
                        field: "value",
                        message: "โปรดใส่ข้อมูล",
                    },
                ],
            };
        }
        const {
            visitId,
            quotationCode,
            value
        } = input;

        await SalesQuotation.create({
            saleRoleId,
            saleName,
            visitId,
            quotationCode,
            value,
            branch,
        }).save()

        const salesVisit = await SalesVisit.findOne({ id: input.visitId })
        
        return { salesVisit }
    }
}
