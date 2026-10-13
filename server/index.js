// Producción: sirve la app compilada (dist/) y la API en un solo proceso.
import express from 'express'
import { fileURLToPath } from 'node:url'
import { createApi } from './api.js'

const app = express()
app.use('/api', createApi(process.env))
const dist = fileURLToPath(new URL('../dist', import.meta.url))
app.use(express.static(dist))
app.get('*', (_, res) => res.sendFile(dist + '/index.html'))
app.listen(process.env.PORT || 3000, () => console.log('Vitania lista'))
