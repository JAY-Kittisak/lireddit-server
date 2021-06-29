import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { createAuthorsLoader } from './utils/authorsLoader';
import { createFactoriesLoader } from './utils/factoriesLoader';
import { createProductsLoader } from './utils/productsLoader';

export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } }
    res: Response
    authorsLoader: ReturnType<typeof createAuthorsLoader>;
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