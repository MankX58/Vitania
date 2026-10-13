import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from './store'
import { Ic } from './ui'
import Home from './views/Home'
import { List, Detail, Session, Propose } from './views/Activities'
import Citas from './views/Citas'
import Comida from './views/Comida'
import Perfil from './views/Perfil'
import { Welcome, Onboarding } from './views/Auth'

const NAV = [
  ['inicio', 'Inicio', 'home'], ['actividades', 'Actividades', 'move'],
  ['citas', 'Citas', 'cal'], ['comida', 'Comida', 'food'], ['perfil', 'Perfil', 'me'],
]

const useHash = () => {
  const [h, setH] = useState(location.hash)
  useEffect(() => { const f = () => setH(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h.replace(/^#\/?/, '').split('/')
}

function Dialog() {
  const { modalNode, modal } = useApp()
  const r = useRef()
  useEffect(() => {
    const d = r.current
    if (modalNode && !d.open) d.showModal()
    if (!modalNode && d.open) d.close()
  }, [modalNode])
  // Se cierra con: botón Cerrar, tecla Esc o tocando fuera de la ventana.
  return <dialog ref={r} onClose={() => modal(null)} onClick={e => { if (e.target === e.currentTarget) modal(null) }}
    aria-label="Ventana">
    <div className="dlg-in">
      <button className="dlg-x" onClick={() => modal(null)} aria-label="Cerrar"><Ic n="x" w="bold" /></button>
      {modalNode}
    </div>
  </dialog>
}

const Splash = ({ children }) => <main id="main" className="welcome center" style={{ justifyContent: 'center' }}>
  <div className="wordmark" style={{ justifyContent: 'center' }}>Vitania</div>
  {children ?? <div className="spinner" role="status" aria-label="Cargando" />}
</main>

function Shell() {
  const { S } = useApp()
  const [name = 'inicio', id] = useHash()
  const section = ['actividad', 'sesion', 'proponer'].includes(name) ? 'actividades' : name
  const view = {
    inicio: <Home />, actividades: <List />, actividad: <Detail id={id} />, sesion: <Session id={id} />,
    proponer: <Propose />, citas: <Citas />, comida: <Comida />, perfil: <Perfil />,
  }[name] ?? <Home />

  return <>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={name + (id ?? '')}
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        transition={{ duration: .22, ease: 'easeOut' }}>
        {view}
      </motion.div>
    </AnimatePresence>
    <nav aria-label="Principal">
      {NAV.map(([k, l, i]) =>
        <a key={k} href={`#/${k}`} aria-current={section === k ? 'page' : undefined}>
          <span className="ic-wrap">
            {section === k && <motion.span layoutId="pill" className="pill" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <Ic n={i} size={26} w={section === k ? 'fill' : 'regular'} />
          </span>{l}
        </a>)}
    </nav>
  </>
}

export default function App() {
  const { isLoading, isAuthenticated, error } = useAuth0()
  const { S, status, toast, load } = useApp()

  let body
  if (isLoading || (isAuthenticated && ['idle', 'loading'].includes(status))) body = <Splash />
  else if (error) body = <Splash><p className="err" role="alert">Error de acceso: {error.message}</p><a className="btn" href="/">Reintentar</a></Splash>
  else if (!isAuthenticated) body = <Welcome />
  else if (status === 'error') body = <Splash>
    <p className="err" role="alert">No pudimos cargar tus datos.</p>
    <button className="btn" onClick={load}>Reintentar</button></Splash>
  else if (!S.user) body = <Onboarding />
  else body = <Shell />

  return <>
    <div id="app">{body}</div>
    <Dialog />
    <AnimatePresence>
      {toast && <motion.div id="toast" role="status"
        initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 10, x: '-50%' }}>
        {toast}
      </motion.div>}
    </AnimatePresence>
  </>
}
