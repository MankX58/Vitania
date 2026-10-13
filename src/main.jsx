import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import { Provider } from './store'
import App from './App'
import './styles.css'

const { VITE_AUTH0_DOMAIN: domain, VITE_AUTH0_CLIENT_ID: clientId, VITE_AUTH0_AUDIENCE: audience } = import.meta.env

createRoot(document.getElementById('root')).render(
  !domain || !clientId || !audience
    ? <main id="main" className="welcome"><div className="panel">
        <h1 style={{ fontSize: '1.5rem' }}>Falta la configuración</h1>
        <p>Copia <code>.env.example</code> a <code>.env</code> y completa los datos de Auth0 y Neon. Luego reinicia <code>npm run dev</code>.</p>
      </div></main>
    : <Auth0Provider domain={domain} clientId={clientId} cacheLocation="localstorage" useRefreshTokens
        authorizationParams={{ redirect_uri: location.origin, audience }}>
        <MotionConfig reducedMotion="user">
          <Provider><App /></Provider>
        </MotionConfig>
      </Auth0Provider>
)
