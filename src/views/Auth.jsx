import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store'
import { CAT, CONDS, MOB } from '../data'
import { Choice, Arch, Ic } from '../ui'

const Wordmark = () => <div className="wordmark"><Arch tone="peach" icon="sun" size={26} />Vitania</div>

export function Welcome() {
  const { loginWithRedirect } = useAuth0()
  return <main id="main" className="welcome">
    <Wordmark />
    <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 16 }}>
      Moverte, comer rico y verte con gente.
    </motion.h1>
    <p className="lede">Clases a tu ritmo, citas que no se olvidan y comida pensada para ti.</p>
    <div className="arches" aria-hidden="true">
      {[['blue', 'run'], ['peach', 'food'], ['sage', 'cal']].map(([t, ic], i) =>
        <motion.span key={ic} className={`arch tone-${t}`} style={{ transformOrigin: 'bottom' }}
          initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: .3 + i * .12, type: 'spring', stiffness: 70, damping: 14 }}>
          <Ic n={ic} size={40} w="duotone" />
        </motion.span>)}
    </div>
    <div className="stack">
      <button className="btn" onClick={() => loginWithRedirect()}>Entrar</button>
      <button className="btn ghost" onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}>
        Crear mi cuenta
      </button>
    </div>
  </main>
}

const TITLES = ['Hola. ¿Cómo te llamamos?', '¿Vives con alguna condición?', '¿Cómo te mueves?', '¿Qué te gusta hacer?', 'Hazla cómoda para ti']
const SIZES = [[1, 'Normal'], [1.15, 'Grande'], [1.3, 'Muy grande']]

export function Onboarding() {
  const { S, set, au, api, say } = useApp()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [busy, setBusy] = useState(false)
  const h1 = useRef()
  useEffect(() => { if (step) h1.current?.focus() }, [step])
  const [d, setD] = useState({
    name: au?.given_name || au?.name?.split(' ')[0] || '',
    conds: [], mob: 'ninguna', ints: [],
  })
  const toggle = (k, v) => setD(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(i => i !== v) : [...x[k], v] }))
  const go = n => { setDir(n > step ? 1 : -1); setStep(n) }

  const next = async e => {
    e.preventDefault()
    if (step < 4) return go(step + 1)
    const user = {
      name: d.name.trim(), email: au?.email ?? '', conds: d.conds, mob: d.mob, ints: d.ints, emergency: { name: '', phone: '' },
    }
    setBusy(true)
    try {
      const { custom, counts, ...rest } = S
      await api('/me', { method: 'PUT', body: { ...rest, user } })
      set({ user })
    } catch { say('No pudimos guardar tus datos. Inténtalo de nuevo.'); setBusy(false) }
  }

  return <main id="main" className="welcome">
    <Wordmark />
    <form className="onb" onSubmit={next}>
      <div className="steps" role="img" aria-label={`Paso ${step + 1} de 5`}>
        {TITLES.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
      </div>
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div key={step} custom={dir}
          variants={{ in: dr => ({ opacity: 0, x: 40 * dr }), on: { opacity: 1, x: 0 }, out: dr => ({ opacity: 0, x: -40 * dr }) }}
          initial="in" animate="on" exit="out" transition={{ duration: .22 }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 6px' }} tabIndex={-1} ref={h1}>{TITLES[step]}</h1>

          {step === 0 && <>
            <label className="f" htmlFor="n">Tu nombre</label>
            <input id="n" type="text" required autoComplete="given-name" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} />
          </>}

          {step === 1 && <>
            <p className="hint">Solo lo usamos para adaptar actividades y comidas. Puedes saltarlo.</p>
            <fieldset><legend className="sr">Condiciones</legend>
              {Object.entries(CONDS).map(([k, l]) =>
                <Choice key={k} label={l} checked={d.conds.includes(k)} onChange={() => toggle('conds', k)} />)}
            </fieldset>
          </>}

          {step === 2 && <fieldset><legend className="sr">Movilidad</legend>
            {Object.entries(MOB).map(([k, l]) =>
              <Choice key={k} type="radio" name="mob" label={l} checked={d.mob === k} onChange={() => setD({ ...d, mob: k })} />)}
          </fieldset>}

          {step === 3 && <fieldset><legend className="sr">Intereses</legend>
            {Object.entries(CAT).map(([k, c]) =>
              <Choice key={k} label={<span className="row" style={{ gap: 10 }}><Ic n={c.ic} />{c.n}</span>}
                checked={d.ints.includes(k)} onChange={() => toggle('ints', k)} />)}
          </fieldset>}

          {step === 4 && <>
            <p className="big">Este texto cambia de tamaño cuando eliges.</p>
            <fieldset><legend>Tamaño de letra</legend>
              {SIZES.map(([v, l]) => <Choice key={v} type="radio" name="size" label={l} checked={S.prefs.size === v}
                onChange={() => set(s => ({ prefs: { ...s.prefs, size: v } }))} />)}
            </fieldset>
            <fieldset>
              <Choice label="Alto contraste" checked={S.prefs.contrast}
                onChange={e => set(s => ({ prefs: { ...s.prefs, contrast: e.target.checked } }))} />
              <Choice label="Leer los pasos en voz alta" checked={S.prefs.voice}
                onChange={e => set(s => ({ prefs: { ...s.prefs, voice: e.target.checked } }))} />
            </fieldset>
          </>}
        </motion.div>
      </AnimatePresence>

      <div className="stack" style={{ marginTop: 24 }}>
        <button className="btn" disabled={busy}>{step < 4 ? 'Continuar' : busy ? 'Guardando…' : 'Empezar'}</button>
        {step > 0 && <button type="button" className="btn ghost" onClick={() => go(step - 1)}>Atrás</button>}
      </div>
    </form>
  </main>
}
