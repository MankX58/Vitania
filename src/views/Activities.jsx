import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store'
import { CAT, addDays, iso, fmtDate, hasEnded } from '../data'
import { Page, Choice, Arch, Ic, Video, SelectButton, OptionGrid } from '../ui'

const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
const dayLabel = d => d === iso(new Date()) ? 'Hoy' : d === iso(addDays(1)) ? 'Mañana' : cap(fmtDate(d))

/** Una actividad = una tarjeta: icono, título, cuándo. Solo una etiqueta si hace falta. */
const shortDay = d => d === iso(new Date()) || d === iso(addDays(1)) ? dayLabel(d)
  : cap(new Date(d + 'T00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric' }).replace('.', ''))

export function ActItem({ a }) {
  const { S, taken } = useApp()
  const full = taken(a) >= a.cupos && !S.joined[a.id]
  const c = CAT[a.cat]
  return <a className="item" href={`#/actividad/${a.id}`}>
    <Arch tone={c.t} icon={c.ic} size={52} />
    <span>
      <h3>{a.title}</h3>
      <span className="when">{shortDay(a.date)}, {a.time}</span>
      {(S.joined[a.id] || full) && <span className="sub" style={{ marginTop: 6 }}>
        {S.joined[a.id] ? <span className="flag">{hasEnded(a) ? 'Completada' : 'Estás inscrito/a'}</span> : <span className="flag full">Completo</span>}
      </span>}
    </span>
    <Ic n="go" size={26} w="bold" className="go" />
  </a>
}

export function List() {
  const { S, acts, modal } = useApp()
  const [cat, setCat] = useState('')
  const shown = acts.filter(a => (!hasEnded(a) || (S.joined[a.id] && a.date === iso(new Date()))) && (!cat || a.cat === cat))
  const groups = shown.reduce((m, a) => ((m[a.date] ??= []).push(a), m), {})
  const options = [['', 'Todas', 'grid'], ...Object.entries(CAT).map(([k, c]) => [k, c.n, c.ic])]
  const current = options.find(o => o[0] === cat)

  const open = () => modal(<OptionGrid title="¿Qué tipo de actividad?" options={options} value={cat}
    onPick={k => { setCat(k); modal(null) }} />)

  return <Page title="Actividades" back="#/inicio">
    <SelectButton label="Tipo de actividad" value={current[1]} icon={current[2]} onClick={open} />
    <div aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {Object.entries(groups).map(([d, list]) =>
          <motion.section key={d} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="day-h">{dayLabel(d)}</h2>
            {list.map(a => <ActItem key={a.id} a={a} />)}
          </motion.section>)}
      </AnimatePresence>
      {!shown.length && <div className="empty"><Arch tone="blue" icon="move" size={64} />
        <p>No hay actividades de este tipo todavía.</p>
        <button className="btn ghost sm" style={{ margin: '12px auto 0' }} onClick={() => setCat('')}>Ver todas</button></div>}
    </div>
    <a className="btn ghost" style={{ marginTop: 28 }} href="#/proponer"><Ic n="plus" w="bold" /> Dar una clase</a>
  </Page>
}

function ReportForm({ a }) {
  const { set, say, modal } = useApp()
  const submit = e => {
    e.preventDefault()
    const f = new FormData(e.target)
    const who = f.get('who') === 'host' ? a.host : f.get('other').trim()
    set(s => ({
      reports: [...s.reports, { act: a.id, who, why: f.get('why'), note: f.get('note'), at: new Date().toISOString() }],
      blocked: f.get('block') && who && !s.blocked.includes(who) ? [...s.blocked, who] : s.blocked,
    }))
    modal(null); say('Gracias. Tu reporte es privado y será revisado.')
    if (f.get('block') && who === a.host) location.hash = '#/actividades'
  }
  return <form onSubmit={submit}>
    <h2 style={{ marginTop: 0 }}>Reportar o bloquear</h2>
    <p className="muted">Es privado. Puedes hacerlo durante o después de la actividad.</p>
    <fieldset><legend>¿A quién?</legend>
      <Choice type="radio" name="who" value="host" defaultChecked label={`Al anfitrión: ${a.host}`} />
      <Choice type="radio" name="who" value="other" label="A otro participante" />
      <input name="other" type="text" aria-label="Nombre del participante" placeholder="Nombre, si lo sabes" />
    </fieldset>
    <fieldset><legend>¿Qué pasó?</legend>
      {['Conducta inapropiada', 'Lenguaje ofensivo', 'Acoso o incomodidad', 'Otra razón'].map((r, i) =>
        <Choice key={r} type="radio" name="why" value={r} defaultChecked={!i} label={r} />)}
    </fieldset>
    <label className="f" htmlFor="note">Cuéntanos más (opcional)</label>
    <textarea id="note" name="note" />
    <div style={{ marginTop: 14 }}><Choice name="block" defaultChecked label="Bloquear a esta persona" hint="No verás sus actividades." /></div>
    <div className="stack" style={{ marginTop: 18 }}>
      <button className="btn warn">Enviar reporte</button>
      <button type="button" className="btn ghost" onClick={() => modal(null)}>Cancelar</button>
    </div>
  </form>
}

const SafetyButton = ({ a }) => {
  const { modal } = useApp()
  return <button className="sos" onClick={() => modal(<ReportForm a={a} />)}><Ic n="shield" w="bold" /> Reportar o bloquear</button>
}

const NotFound = () => <Page title="No encontrada" back="#/actividades"><p className="empty">Esta actividad ya no está disponible.</p></Page>

export function Detail({ id }) {
  const { S, set, say, acts, taken: takenOf, api, load, modal } = useApp()
  const a = acts.find(x => x.id === id)
  const [mode, setMode] = useState(S.joined[id] || (a?.modes.length === 1 ? a.modes[0] : ''))
  if (!a) return <NotFound />

  const joined = S.joined[id]
  const waiting = S.wait.includes(id)
  const left = a.cupos - takenOf(a)
  const full = left <= 0 && !joined
  const c = CAT[a.cat]
  const online = !a.modes.includes('presencial')
  const ended = hasEnded(a)

  const join = async () => {
    if (hasEnded(a)) return say('Esta actividad ya terminó.')
    if (!mode) return say('Elige si irás en persona o en línea.')
    set(s => ({
      joined: { ...s.joined, [id]: mode }, wait: s.wait.filter(w => w !== id),
      counts: { ...s.counts, [id]: (s.counts[id] || 0) + (s.joined[id] ? 0 : 1) },
    }))
    try { await api(`/attendance/${id}`, { method: 'PUT', body: { mode } }); say('Listo, te esperamos.') }
    catch { say('No se pudo confirmar. Inténtalo otra vez.'); load() }
  }
  const leave = async () => {
    set(s => {
      const { [id]: _, ...r } = s.joined
      return { joined: r, counts: { ...s.counts, [id]: Math.max(0, (s.counts[id] || 1) - 1) } }
    })
    try { await api(`/attendance/${id}`, { method: 'DELETE' }); say('Cancelaste tu asistencia.') }
    catch { say('No se pudo cancelar. Inténtalo otra vez.'); load() }
  }

  return <Page title={a.title} back="#/actividades">
    <p className="big">{a.desc}</p>

    <section className="card" aria-labelledby="d1">
      <h2 id="d1">Cuándo y dónde</h2>
      <ul className="info">
        <li><Ic n="clock" size={26} /><span><strong>{dayLabel(a.date)}, {a.time}</strong>Dura {a.min} minutos</span></li>
        <li><Ic n={online ? 'video' : 'pin'} size={26} /><span><strong>{online ? 'En línea, por Zoom' : a.place}</strong>
          {a.modes.length > 1 ? 'También puedes ir en línea' : online ? 'Solo virtual' : 'Solo en persona'}</span></li>
        <li><Ic n="user" size={26} /><span><strong>{a.host}</strong>Nivel {a.level.toLowerCase()}</span></li>
      </ul>
    </section>

    <section className="card" aria-labelledby="d2">
      <h2 id="d2">Tu lugar</h2>
      {ended ? (joined
        ? <p className="big"><strong>Completaste esta actividad.</strong> Ya cuenta en tu semana.</p>
        : <p className="big">Esta actividad ya terminó. Puedes buscar otra.</p>
      ) : joined ? <>
        <p className="big"><strong>Estás inscrito/a, {joined === 'virtual' ? 'en línea' : 'en persona'}.</strong></p>
        {joined === 'virtual' && (a.zoom
          ? <a className="btn" style={{ marginTop: 12 }} href={a.zoom} target="_blank" rel="noopener noreferrer"><Ic n="video" /> Abrir Zoom</a>
          : <p className="hint">El anfitrión te compartirá el enlace de Zoom.</p>)}
        <button className="btn ghost" style={{ marginTop: 12 }} onClick={leave}>Cancelar mi lugar</button>
      </> : full ? <>
        <p className="big">Esta semana ya no quedan lugares.</p>
        <button className="btn ghost" style={{ marginTop: 12 }} disabled={waiting}
          onClick={() => { set(s => ({ wait: [...s.wait, id] })); say('Te avisaremos si se libera un lugar.') }}>
          {waiting ? 'Estás en lista de espera' : 'Avisarme si se libera'}
        </button>
      </> : <>
        <p>{left <= 3 ? `Quedan solo ${left} lugares.` : `Hay ${left} lugares.`}</p>
        {a.modes.length > 1 && <fieldset><legend>¿Cómo vas a ir?</legend>
          {a.modes.map(m => <Choice key={m} type="radio" name="mode" label={m === 'virtual' ? 'En línea' : 'En persona'}
            checked={mode === m} onChange={() => setMode(m)} />)}
        </fieldset>}
        <button className="btn" style={{ marginTop: 16 }} onClick={join}>Reservar mi lugar</button>
      </>}
    </section>

    {(a.video || a.steps) && <section className="card" aria-labelledby="d3">
      <h2 id="d3">Míralo antes</h2>
      {a.video && <Video {...a.video} />}
      {a.steps && <a className="btn ghost" style={{ marginTop: 14 }} href={`#/sesion/${a.id}`}><Ic n="play" w="fill" /> Practicar paso a paso</a>}
    </section>}

    <button className="btn ghost sm" style={{ marginTop: 24, color: 'var(--danger)', borderColor: 'var(--danger)' }}
      onClick={() => modal(<ReportForm a={a} />)}><Ic n="shield" w="bold" /> Reportar o bloquear</button>
  </Page>
}

export function Session({ id }) {
  const { S, set, speak, acts } = useApp()
  const a = acts.find(x => x.id === id)
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(a?.steps?.[0][2] ?? 0)
  const [run, setRun] = useState(false)
  const [done, setDone] = useState(false)
  const n = a?.steps?.length ?? 0

  useEffect(() => {
    if (!run) return
    const t = setInterval(() => setLeft(l => l - 1), 1000)
    return () => clearInterval(t)
  }, [run])

  useEffect(() => { if (run && left <= 0) go(1) }, [left])
  useEffect(() => { if (run && a) speak(`${a.steps[i][0]}. ${a.steps[i][1]}`) }, [i, run])
  useEffect(() => () => 'speechSynthesis' in window && speechSynthesis.cancel(), [])

  if (!a?.steps) return <NotFound />

  const go = d => {
    const j = i + d
    if (j < 0) return
    if (j >= n) { setRun(false); setDone(true); set(s => ({ done: [...s.done, iso(new Date())] })); return }
    setI(j); setLeft(a.steps[j][2])
  }

  if (done) return <Page title="Sesión completada" back={`#/actividad/${id}`}>
    <motion.div className="center" initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 12 }} style={{ marginTop: 24 }}>
      <Arch tone="sage" icon="ok" size={120} />
      <h2>Lo lograste</h2>
      <p className="big">Terminaste {a.title.toLowerCase()}. Anotamos la sesión en tu semana.</p>
      <a className="btn" style={{ marginTop: 20 }} href="#/inicio">Volver al inicio</a>
    </motion.div>
  </Page>

  const [t, txt, secs] = a.steps[i]
  return <Page title={a.title} back={`#/actividad/${id}`}>
    <div className={'ring-wrap' + (run ? ' running' : '')}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle className="bg" cx="100" cy="100" r="90" />
        <circle className="fg" cx="100" cy="100" r="90" style={{ strokeDashoffset: 565.5 * (left / secs) }} />
      </svg>
      <div className="ring-in">
        <span className="k">Paso {i + 1} de {n}</span>
        <span className="s" role="timer" aria-label={`${Math.max(left, 0)} segundos`}>{Math.max(left, 0)}</span>
      </div>
    </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={i} className="center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .18 }}>
        <h2 style={{ marginTop: 6 }}>{t}</h2>
        <p className="big" aria-live="polite">{txt}</p>
      </motion.div>
    </AnimatePresence>
    <div className="dots" aria-hidden="true">
      {a.steps.map((_, k) => <i key={k} className={k < i ? 'on' : k === i ? 'now' : ''} />)}
    </div>
    <div className="controls">
      <button className="btn ghost" onClick={() => go(-1)} disabled={i === 0} aria-label="Paso anterior"><Ic n="prev" size={28} w="fill" /></button>
      <button className="btn" onClick={() => setRun(!run)}><Ic n={run ? 'pause' : 'play'} size={26} w="fill" />{run ? 'Pausar' : 'Empezar'}</button>
      <button className="btn ghost" onClick={() => go(1)} aria-label="Paso siguiente"><Ic n="next" size={28} w="fill" /></button>
    </div>
    <div style={{ marginTop: 18 }}>
      <Choice label="Leer los pasos en voz alta" checked={S.prefs.voice}
        onChange={e => set(s => ({ prefs: { ...s.prefs, voice: e.target.checked } }))} />
    </div>
    <SafetyButton a={a} />
  </Page>
}

export function Propose() {
  const { S, set, say, api } = useApp()
  const [busy, setBusy] = useState(false)
  const [virtual, setVirtual] = useState(true)
  const submit = async e => {
    e.preventDefault()
    const f = new FormData(e.target)
    const modes = ['presencial', 'virtual'].filter(m => f.get(m))
    if (!modes.length) return say('Elige al menos una modalidad.')
    setBusy(true)
    try {
      const c = await api('/classes', { method: 'POST', body: {
        cat: f.get('cat'), title: f.get('title'), desc: f.get('desc'), date: f.get('date'), time: f.get('time'),
        min: f.get('min'), cupos: f.get('cupos'), place: f.get('place'), zoom: f.get('zoom') ?? '', modes, host: S.user.name,
      } })
      await api(`/attendance/${c.id}`, { method: 'PUT', body: { mode: modes[0] } })
      set(s => ({ custom: [...s.custom, c], joined: { ...s.joined, [c.id]: modes[0] }, counts: { ...s.counts, [c.id]: 1 } }))
      say('Tu clase ya está publicada.'); location.hash = `#/actividad/${c.id}`
    } catch { say('No se pudo publicar la clase. Revisa los datos.'); setBusy(false) }
  }
  return <Page title="Dar una clase" back="#/actividades">
    <p className="big">Comparte algo que sabes hacer. Los demás confirmarán si van en persona o en línea.</p>
    <form onSubmit={submit}>
      <label className="f" htmlFor="title">Tema</label>
      <input id="title" name="title" type="text" required placeholder="Ej: Cómo hacer pan casero" />
      <label className="f" htmlFor="cat">Categoría</label>
      <select id="cat" name="cat">{Object.entries(CAT).map(([k, c]) => <option key={k} value={k}>{c.n}</option>)}</select>
      <label className="f" htmlFor="desc">Descripción</label>
      <textarea id="desc" name="desc" />
      <div className="row">
        <div style={{ flex: 1 }}><label className="f" htmlFor="date">Fecha</label><input id="date" name="date" type="date" required min={iso(new Date())} /></div>
        <div style={{ flex: 1 }}><label className="f" htmlFor="time">Hora</label><input id="time" name="time" type="time" required defaultValue="10:00" /></div>
      </div>
      <div className="row">
        <div style={{ flex: 1 }}><label className="f" htmlFor="min">Minutos</label><input id="min" name="min" type="number" min="10" max="180" defaultValue="45" /></div>
        <div style={{ flex: 1 }}><label className="f" htmlFor="cupos">Cupos</label><input id="cupos" name="cupos" type="number" min="2" max="40" defaultValue="10" /></div>
      </div>
      <fieldset><legend>Modalidad</legend>
        <Choice name="presencial" defaultChecked label="En persona" />
        <Choice name="virtual" checked={virtual} onChange={e => setVirtual(e.target.checked)} label="En línea, por Zoom" />
      </fieldset>
      <label className="f" htmlFor="place">Lugar (si es en persona)</label>
      <input id="place" name="place" type="text" />
      {virtual && <><label className="f" htmlFor="zoom">Enlace de Zoom (opcional)</label>
        <input id="zoom" name="zoom" type="url" pattern="https://.*" placeholder="https://zoom.us/j/..." /></>}
      <button className="btn" style={{ marginTop: 24 }} disabled={busy}>{busy ? 'Publicando…' : 'Publicar clase'}</button>
    </form>
  </Page>
}
