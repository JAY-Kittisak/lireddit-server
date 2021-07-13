import { config } from 'dotenv'

const { parsed } = config()

type EnvType = {
    PORT: string
    BASE_URL: string
    IN_PROD: string
    URL: string
}

export const {
    PORT,
    BASE_URL,
    URL = `${BASE_URL}${PORT}`
} = parsed as EnvType