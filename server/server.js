// server/server.js
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development'

dotenv.config({ path: path.resolve(__dirname, '..', envFile) })

const app = express()

app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}))
app.use(cookieParser())

app.get('/auth/check', (req, res) => {
    const token = req.cookies.token
    const refreshTokenId = req.cookies.refreshTokenId

    if (token && refreshTokenId) {
        res.status(200).json({ authenticated: true })
    } else {
        res.status(401).json({ authenticated: false })
    }
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Origin allowed: ${process.env.CLIENT_ORIGIN}`)
})