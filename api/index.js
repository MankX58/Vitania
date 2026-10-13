// Punto de entrada de la API en Vercel (funcion serverless). En local/Render se usa server/index.js.
import express from 'express'
import { createApi } from '../server/api.js'

const app = express()
app.use('/api', createApi(process.env))
export default app
