import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth.routes'

const app = express()

app.use(cors({ origin: 'http://localhost:5050', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})