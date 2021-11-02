import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { createFactoriesLoader } from '../utils/factoriesLoader';
import { createProductsLoader } from '../utils/productsLoader';
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
    OFFICER = "พนังงานทั่วไป",
    MANAGER = "หัวหน้างาน",
}