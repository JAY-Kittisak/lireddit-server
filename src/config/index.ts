import { config } from 'dotenv'

const { parsed } = config()

type EnvType = {
    PORT: string
    BASE_URL: string
    FRONTEND: string
    URL: string
    DATABASE: string
    USERNAME: string
    PASSWORD: string
}

export const {
    PORT,
    BASE_URL,
    FRONTEND,
    URL = `${BASE_URL}${PORT}`,
    DATABASE,
    USERNAME,
    PASSWORD
} = parsed as EnvType