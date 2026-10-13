import { useApp } from '../store'
import { fmtDate, iso } from '../data'
import { Page, Arch, Ic, Fold } from '../ui'
import Notify from './Notify'

export const KIND = {
  Médica: { ic: 'steth' }, Familiar: { ic: 'family' }, Social: { ic: 'coffee' }, Otra: { ic: 'push' },
}
const REMIND = [[0, 'Sin recordatorio'], [10, '10 minutos antes'], [60, '1 hora antes'], [1440, '1 día antes']]
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

function Form() {
  const { set, say, modal } = useApp()
  const submit = e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const remind = +f.remind
    set(s => ({ appts: [...s.appts, { id: Date.now(), title: f.title.trim(), kind: f.kind, date: f.date, time: f.time, remind, notes: f.notes.trim() }] }))
    modal(null); say(remind ? 'Cita guardada. Te avisaremos a tiempo.' : 'Cita guardada.')
  }
  return <form onSubmit={submit}>
    <h2 style={{ marginTop: 0 }}>Nueva cita</h2>
    <label className="f" htmlFor="t">¿Qué cita es?</label>
    <input id="t" name="title" type="text" required placeholder="Ej: Control con el cardiólogo" />
    <label className="f" htmlFor="k">Tipo</label>
    <select id="k" name="kind">{Object.keys(KIND).map(k => <option key={k}>{k}</option>)}</select>
    <div className="row">
      <div style={{ flex: 1 }}><label className="f" htmlFor="d">Fecha</label><input id="d" name="date" type="date" required min={iso(new Date())} /></div>
      <div style={{ flex: 1 }}><label className="f" htmlFor="h">Hora</label><input id="h" name="time" type="time" required defaultValue="09:00" /></div>
    </div>
    <label className="f" htmlFor="r">Recordatorio</label>
    <select id="r" name="remind" defaultValue="60">{REMIND.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    <label className="f" htmlFor="n">Notas (opcional)</label>
    <textarea id="n" name="notes" />
    <div className="stack" style={{ marginTop: 18 }}>
      <button className="btn">Guardar cita</button>
      <button type="button" className="btn ghost" onClick={() => modal(null)}>Cancelar</button>
    </div>
  </form>
}

export default function Citas() {
  const { S, set, say, modal } = useApp()
  const now = new Date()
  const sorted = [...S.appts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const isPast = a => new Date(`${a.date}T${a.time}`) < now
  const up = sorted.filter(a => !isPast(a)), past = sorted.filter(isPast).reverse()

  const del = a => { set(s => ({ appts: s.appts.filter(x => x.id !== a.id) })); say('Cita eliminada.') }
  const Item = ({ a, old }) => <li className="item" style={{ opacity: old ? .65 : 1 }}>
    <Arch tone="peach" icon={KIND[a.kind].ic} size={48} />
    <span>
      <h3>{a.title}</h3>
      <span className="sub"><span>{cap(fmtDate(a.date))}, {a.time}</span>
        {a.remind > 0 && <span><Ic n="bell" size={18} /> {REMIND.find(r => r[0] === a.remind)?.[1]}</span>}</span>
      {a.notes && <p className="hint">{a.notes}</p>}
    </span>
    <button className="btn ghost sm" style={{ minWidth: 48, padding: 0 }} aria-label={`Eliminar cita ${a.title}`} onClick={() => del(a)}>
      <Ic n="x" w="bold" />
    </button>
  </li>

  return <Page title="Mis citas" back="#/inicio">
    <Fold title="Avisos" icon="bell"><Notify /></Fold>
    {up.length ? <ul className="plain">{up.map(a => <Item key={a.id} a={a} />)}</ul>
      : <div className="empty"><Arch tone="peach" icon="cal" size={64} />
        <p className="big">No tienes citas próximas.</p><p>Agenda una y te recordaremos a tiempo.</p></div>}
    <button className="btn" style={{ marginTop: 24 }} onClick={() => modal(<Form />)}><Ic n="plus" w="bold" /> Nueva cita</button>
    {past.length > 0 && <>
      <h2>Anteriores</h2>
      <ul className="plain">{past.map(a => <Item key={a.id} a={a} old />)}</ul>
    </>}
  </Page>
}
