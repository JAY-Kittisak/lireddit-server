import { config } from 'dotenv'

const { parsed } = config()

type EnvType = {
    PORT: string
    BASE_URL: string
    FRONTEND: string
    URL: string
}

export const {
    PORT,
    BASE_URL,
    FRONTEND,
    URL = `${BASE_URL}${PORT}`
} = parsed as EnvType