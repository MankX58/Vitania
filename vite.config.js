import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createApi } from './server/api.js'

// En desarrollo la API corre dentro del servidor de Vite (un solo comando).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), {
      name: 'vitania-api',
      configureServer(s) {
        const ok = env.DATABASE_URL && env.VITE_AUTH0_DOMAIN && env.VITE_AUTH0_AUDIENCE
        s.middlewares.use('/api', ok ? createApi(env)
          : (_, res) => { res.statusCode = 503; res.end('{"error":"missing env"}') })
      },
    }],
  }
})
