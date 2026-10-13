import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { seedActs, hasEnded } from './data'

const DEF = {
  user: null,                      // se llena en el onboarding
  prefs: { size: 1, contrast: false, voice: false, theme: 'auto' },
  appts: [], joined: {}, wait: [], reports: [], blocked: [], done: [],
  meals: { on: false, deliver: '12:30' },
}

// Lo que se guarda por persona en Neon (custom/counts son compartidos y vienen aparte)
const personal = S => { const { custom, counts, ...p } = S; return p }

const Ctx = createContext()
export const useApp = () => useContext(Ctx)

export function Provider({ children }) {
  const { isAuthenticated, getAccessTokenSilently, user: au, logout } = useAuth0()
  const [S, setS] = useState({ ...DEF, custom: [], counts: {} })
  const [status, setStatus] = useState('idle')   // idle | loading | ready | error
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null)
  const timer = useRef()
  const [dayKey, setDayKey] = useState(() => new Date().toDateString())
  const saved = useRef('')

  const api = useCallback(async (path, { method = 'GET', body } = {}) => {
    const token = await getAccessTokenSilently()
    const r = await fetch('/api' + path, {
      method, body: body && JSON.stringify(body),
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(r.status)
    return r.status === 204 ? null : r.json()
  }, [getAccessTokenSilently])

  const load = useCallback(() => {
    setStatus('loading')
    return api('/me').then(({ doc, classes, counts }) => {
      const next = { ...DEF, ...doc }
      saved.current = JSON.stringify(personal(next))
      setS({ ...next, custom: classes, counts })
      setStatus('ready')
    }).catch(() => setStatus('error'))
  }, [api])

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, load])

  // Guardado automático en Neon (con pequeña espera para agrupar cambios)
  const snapshot = JSON.stringify(personal(S))
  useEffect(() => {
    if (status !== 'ready' || snapshot === saved.current || !S.user) return
    const t = setTimeout(() => {
      api('/me', { method: 'PUT', body: JSON.parse(snapshot) })
        .then(() => { saved.current = snapshot })
        .catch(() => say('No se pudo guardar. Revisa tu conexión.'))
    }, 600)
    return () => clearTimeout(t)
  }, [snapshot, status])

  // accesibilidad: tamaño de letra y alto contraste sobre <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', S.prefs.size)
    document.documentElement.classList.toggle('hc', S.prefs.contrast)
    const th = S.prefs.theme ?? 'auto'
    if (th === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.dataset.theme = th
  }, [S.prefs])

  const set = patch => setS(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  const say = msg => { setToast(msg); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 3200) }
  const speak = txt => {
    if (!S.prefs.voice || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(txt); u.lang = 'es-ES'; u.rate = .9
    speechSynthesis.speak(u)
  }
  const isDark = () => (S.prefs.theme ?? 'auto') === 'auto'
    ? matchMedia('(prefers-color-scheme: dark)').matches : S.prefs.theme === 'dark'
  const toggleTheme = () => set(s => ({ prefs: { ...s.prefs, theme: isDark() ? 'light' : 'dark' } }))
  const signOut = () => logout({ logoutParams: { returnTo: location.origin } })

  // recordatorios de citas (revisa cada 20 s mientras la app está abierta)
  useEffect(() => {
    const check = () => {
      const now = Date.now()
      const due = S.appts.find(a => a.remind && !a.fired && now >= new Date(`${a.date}T${a.time}`) - a.remind * 6e4
        && now < new Date(`${a.date}T${a.time}`).getTime() + 36e5)
      if (!due) return
      setS(s => ({ ...s, appts: s.appts.map(a => a.id === due.id ? { ...a, fired: true } : a) }))
      setModal(<div role="alertdialog" aria-labelledby="rt" className="center">
                <h2 id="rt">Es la hora</h2>
        <p className="big">{due.title}</p>
        <p className="muted">Hoy a las {due.time}</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => setModal(null)}>Entendido</button>
      </div>)
    }
    check(); const i = setInterval(check, 20000); return () => clearInterval(i)
  }, [S.appts])

  // Si cambia el día (pasó la medianoche o volviste a la app), se recalcula todo: "mañana" pasa a ser "hoy".
  useEffect(() => {
    const tick = () => setDayKey(k => { const n = new Date().toDateString(); return n === k ? k : n })
    const i = setInterval(tick, 60000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(i); document.removeEventListener('visibilitychange', tick) }
  }, [])

  const acts = useMemo(() =>
    [...seedActs(), ...S.custom]
      .filter(a => !S.blocked.includes(a.host))
      .sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)),
  [S.custom, S.blocked, dayKey])

  // Si estabas inscrito/a y la actividad ya terminó, ese día cuenta como completado.
  useEffect(() => {
    const check = () => {
      const add = acts.filter(a => S.joined[a.id] && hasEnded(a)).map(a => a.date).filter(d => !S.done.includes(d))
      if (add.length) setS(s => ({ ...s, done: [...new Set([...s.done, ...add])] }))
    }
    check()
    const i = setInterval(check, 60000)
    return () => clearInterval(i)
  }, [acts, S.joined, S.done])

  // cupos ocupados = base de la actividad + personas inscritas en Neon
  const taken = a => a.taken + (S.counts[a.id] || 0)

  return <Ctx.Provider value={{
    S, set, say, speak, acts, taken, api, load, signOut, status, toast, au, isDark, toggleTheme,
    modal: setModal, modalNode: modal, saved,
  }}>{children}</Ctx.Provider>
}
