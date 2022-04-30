import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { createFactoriesLoader } from '../utils/factoriesLoader';
import { createProductsLoader } from '../utils/productsLoader';
import { createCustomersLoader } from '../utils/customersLoader';
import { createResellsLoader } from '../utils/resellsLoader';
import { createVisitsLoader } from '../utils/visitsLoader';
import { createIssuesLoader } from '../utils/issuesLoader';
import { Stream } from "stream"


export interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}

export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } }
    res: Response
    factoriesLoader: ReturnType<typeof createFactoriesLoader>;
    productsLoader: ReturnType<typeof createProductsLoader>;
    customersLoader: ReturnType<typeof createCustomersLoader>;
    resellsLoader: ReturnType<typeof createResellsLoader>;
    visitsLoader: ReturnType<typeof createVisitsLoader>;
    issuesLoader: ReturnType<typeof createIssuesLoader>;
}

export type CatProduct = "อะไหล่รถยนต์" | "อาหาร" | "อิเล็กทรอนิกส์"

export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export type Factory = {
    __typename?: 'Factory';
    id: Scalars['Float'];
    industrialEstate: Scalars['String'];
    businessType: Scalars['String'];
    companyName: Scalars['String'];
    description: Scalars['String'];
    address: Scalars['String'];
    phoneNumber: Scalars['String'];
    FAX: Scalars['String'];
    Email: Scalars['String'];
};

export enum UserRole {
    CLIENT_LKB = "client-LKB",
    CLIENT_CDC = "client-CDC",
    JOB_EDITOR = "jobEditor",
    ADMIN = "admin",
    SUPER_ADMIN = "superAdmin"
}

export enum Departments {
    CLIENT = "client",
    AC = "account",
    AD = "adminSale",
    DL = "delivery",
    EN = "engineer",
    IV = "inventory",
    MK = "Marketing",
    PU = "Purchasing",
    QMR = "Quality",
    SC = "SaleCo",
    SA = "Sales"
}

export enum StatusOrder {
    NEW = "New",
    PREPARING = "Preparing",
    SUCCESS = "Success"
}

export enum StatusJob {
    NEW = "New",
    WAIT = "Wait Approve",
    SUCCESS = "Success",
    IMPOSSIBLE = "Impossible"
}

export enum StatusItem {
    WITHDRAW = "เบิก",
    BORROW = "ยืม",
    RETURN = "คืน",
}

export enum CurrentStatus {
    UNOCCUPIED = "ว่าง",
    ACTIVE = "ใช้งาน",
    DEPRECATED = "เลิกใช้แล้ว"
}

export enum Position {
    GUEST = "แขก",
    GENERAL = "พนักงานทั่วไป",
    OFFICER = "พนังงานทั่วไป",
    MANAGER = "หัวหน้างาน",
    GM = "GM",
}

export enum Approve {
    PENDING = "รออนุมัติ",
    APPROVED = "อนุมัติแล้ว",
    DISAPPROVED = "ไม่อนุมัติ"
}

export enum Branch {
    LATKRABANG = "ลาดกระบัง",
    CHONBURI = "ชลบุรี"
}

export enum IssueCat {
    ONE_SHOT = "One shot",
    STANDARD = "Repeat Standard",
    SPECIAL = "Repeat Special",
}

export enum Prob {
    LESS_THIRTY = "น้อยกว่า 30",
    MORE_THIRTY = "มากกว่า 30",
    MORE_FIFTY = "มากกว่า 50",
    MORE_NINETY = "มากกว่า 90",
}

export enum JobPurpose {
    NEW_ISSUE = "สร้างหัวเรื่องใหม่",
    Follow_ISSUE = "ติดตามหัวเรื่องเดิม",
    Follow_QT = "ติดตามใบเสนอราคา",
}

export enum CustomerType {
    NEW_ONE = "New customer 1",
    NEW_TWO = "New customer 2",
    EXISTING = "Existing customer",
}

// export enum StatusIssue {
//     PROPOSED = "Proposed",
//     ISSUED = "Issued",
//     DEMO = "Demo",
//     TEST = "Test",
//     QUOTED = "Quoted",
//     PURCHASED = "Purchased",
// }

export enum ClosedStatus {
    SUCCESS_ONE = "Success 1",
    SUCCESS_TWO = "Success 2",
    FAIL_0NE = "Fail 1",
    FAIL_TWO  = "Fail 2"
}

export enum FailReason {
    PRICE = "ด้านราคา",
    QUALITY = "ด้านคุณภาพ",
    STOCK = "ด้าน stock",
    SERVICE  = "ด้านการบริการ"
}
