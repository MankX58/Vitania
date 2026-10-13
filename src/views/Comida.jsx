import { useState } from 'react'
import { useApp } from '../store'
import { ADAPT, CONDS, MENU, addDays, iso, fmtDate } from '../data'
import { Page, Switch, Ic, Arch, WeekPicker } from '../ui'

export default function Comida() {
  const { S, set, say } = useApp()
  const today = (new Date().getDay() + 6) % 7
  const [day, setDay] = useState(today)
  const week = Array.from({ length: 7 }, (_, i) => iso(addDays(i - today)))
  const dayName = fmtDate(week[day]).replace(/^./, c => c.toUpperCase())
  const { on, deliver } = S.meals
  const notes = [
    ...S.user.conds.map(c => [CONDS[c], ADAPT[c]]),
    ...(S.user.mob !== 'ninguna' ? [['Movilidad', 'Te lo llevamos hasta la puerta: no necesitas salir ni cocinar.']] : []),
  ]
  const slots = [['08:30', 'Desayuno'], [deliver, 'Almuerzo'], ['19:30', 'Cena']]
  const toggle = v => { set({ meals: { ...S.meals, on: v } }); say(v ? 'Plan de comidas activado.' : 'Plan de comidas desactivado.') }

  return <Page title="Comidas" back="#/inicio">
    <p className="big">Te llevamos la comida a casa, preparada y adaptada a ti. Es opcional.</p>
    <Switch on={on} onChange={toggle} label="Plan de comidas" hint={on ? 'Activado' : 'Desactivado'} />

    {on ? <>
      <section className="card" aria-labelledby="menu">
        <h2 id="menu">Menú</h2>
        <WeekPicker week={week} value={day} today={today} onChange={setDay} />
        <h3 className="day-title" aria-live="polite">{day === today ? 'Hoy, ' : ''}{dayName.toLowerCase()}</h3>
        <ul className="plain" aria-live="polite">
          {slots.map(([t, l], i) => <li key={l} className="meal-row">
            <span className="time">{t}</span>
            <span><span className="hint">{l}</span><strong>{MENU[day][i]}</strong></span>
          </li>)}
        </ul>
      </section>

      <details className="fold">
        <summary><Ic n="check" w="bold" size={26} /><span>Cómo se adapta a ti</span><Ic n="go" w="bold" className="caret" /></summary>
        <div className="fold-body">
          {notes.length
            ? <ul className="info">{notes.map(([t, d]) => <li key={t}><Ic n="check" w="bold" size={22} /><span><strong>{t}</strong>{d}</span></li>)}</ul>
            : <p>Agrega tus condiciones en el perfil y el menú se adapta.</p>}
          <p className="hint" style={{ marginTop: 14 }}>Menú orientativo. Confírmalo con tu médico o nutricionista.</p>
        </div>
      </details>

      <section className="card" aria-labelledby="ent">
        <h2 id="ent">Hora del almuerzo</h2>
        <label className="sr" htmlFor="del">Hora preferida de entrega</label>
        <input id="del" type="time" value={deliver} onChange={e => set({ meals: { ...S.meals, deliver: e.target.value } })} />
      </section>
    </> : <div className="empty"><Arch tone="sage" icon="food" size={64} /><p>Actívalo cuando lo necesites. Puedes cambiarlo cuando quieras.</p></div>}
  </Page>
}
