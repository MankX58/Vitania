import { motion } from 'framer-motion'
import { useApp } from '../store'
import { CAT, menuFor, addDays, iso, hasEnded } from '../data'
import { Page, Arch, Ic } from '../ui'
import { ActItem } from './Activities'
import { KIND } from './Citas'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MEALS = [['08:30', 'Desayuno'], [null, 'Almuerzo'], ['19:30', 'Cena']]

/** El sol recorre un arco según la hora: la pantalla de inicio siempre dice en qué momento del día estás. */
function Sky({ h }) {
  const night = h < 6 || h >= 19
  const t = Math.min(1, Math.max(0, (h - 6) / 13))
  const x = 50 - Math.cos(Math.PI * t) * 38
  const y = 24 + Math.sin(Math.PI * t) * 52
  const label = h < 6 ? 'De madrugada' : h < 12 ? 'Por la mañana' : h < 15 ? 'A mediodía' : h < 19 ? 'Por la tarde' : 'Por la noche'
  const p = night ? 'night' : h < 17 ? 'day' : 'eve'
  return <div className="sky" style={{ '--sky-a': `var(--sky-${p}-a)`, '--sky-b': `var(--sky-${p}-b)` }} aria-hidden="true">
    {night && [[14, 22], [28, 52], [70, 18], [84, 46], [58, 36]].map(([l, tp], i) =>
      <i key={i} className="star" style={{ left: l + '%', top: tp + 'px', animationDelay: i * .6 + 's' }} />)}
    {night
      ? <span className="moon"><Ic n="moon" size={44} w="fill" /></span>
      : <motion.span className="sun" initial={{ left: '50%', bottom: '10%' }} animate={{ left: x + '%', bottom: y + '%' }}
          transition={{ type: 'spring', stiffness: 40, damping: 14 }} />}
    <span className="ground" />
    <p>{label}</p>
  </div>
}

export default function Home() {
  const { S, acts } = useApp()
  const now = new Date()
  const h = now.getHours()
  const hhmm = `${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const today = iso(now)
  const name = S.user.name.split(' ')[0]
  const greet = h < 6 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const dayIdx = (now.getDay() + 6) % 7

  // Todo lo de hoy en una sola línea de tiempo
  const items = [
    ...S.appts.filter(a => a.date === today).map(a => ({
      t: a.time, title: a.title, sub: `Cita ${a.kind.toLowerCase()}`, href: '#/citas', icon: KIND[a.kind].ic, tone: 'peach',
    })),
    ...acts.filter(a => S.joined[a.id] && a.date === today).map(a => ({
      t: a.time, title: a.title, sub: S.joined[a.id] === 'virtual' ? 'En línea' : 'En persona',
      href: `#/actividad/${a.id}`, icon: CAT[a.cat].ic, tone: CAT[a.cat].t,
    })),
    ...(S.meals.on ? MEALS.map(([t, n], i) => ({
      t: t ?? S.meals.deliver, title: n, sub: menuFor(today)[i], href: '#/comida', icon: 'food', tone: 'sage',
    })) : []),
  ].sort((a, b) => a.t.localeCompare(b.t))
  const nextIdx = items.findIndex(i => i.t >= hhmm)

  const monday = addDays(-dayIdx)
  const week = DAYS.map((_, i) => iso(addDays(i, monday)))
  const doneCount = week.filter(d => S.done.includes(d)).length

  const score = a => (S.user.ints.includes(a.cat) ? 2 : 0) + (S.user.mob !== 'ninguna' ? (a.seated ? 1 : -3) : 0)
  const rec = acts.filter(a => !S.joined[a.id] && !hasEnded(a)).sort((a, b) => score(b) - score(a))[0]

  return <Page title={`${greet}, ${name}`} head={<Sky h={h} />}>
    <section className="card" aria-labelledby="hoy">
      <h2 id="hoy">Tu día</h2>
      {items.length
        ? <ol className="tl">
            {items.slice(0, 5).map((it, i) => <motion.li key={it.t + it.title} className="tl-item"
              data-s={nextIdx === -1 || i < nextIdx ? 'past' : i === nextIdx ? 'next' : 'later'}
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 + i * .08 }}>
              <span className="tl-time">{it.t}</span>
              <span className="tl-dot"><i /></span>
              <a className={`tl-card tone-${it.tone}`} href={it.href}>
                <span style={{ flex: 1 }}><h3>{it.title}</h3><span className="hint">{it.sub}</span></span>
              </a>
            </motion.li>)}
          </ol>
        : <div className="empty" style={{ padding: '8px 0' }}>
            <p className="big">Hoy no tienes nada agendado.</p>
            <a className="btn" style={{ marginTop: 14 }} href="#/actividades">Elegir una actividad</a>
          </div>}
    </section>

    <section className="card" aria-labelledby="sem">
      <h2 id="sem">Esta semana</h2>
      <p>{doneCount >= 1 ? `Cumpliste tu meta: ${doneCount === 1 ? '1 día activo' : `${doneCount} días activos`}.` : 'Tu meta: hacer al menos una actividad esta semana.'}</p>
      <ul className="week plain" aria-label="Días con sesión completada">
        {DAYS.map((d, i) => <li key={d}>
          <span className={'d' + (S.done.includes(week[i]) ? ' done' : '') + (i === dayIdx ? ' today' : '')}>
            {S.done.includes(week[i]) && <Ic n="check" size={20} w="bold" />}
          </span>
          <span aria-hidden="true">{d}</span>
          <span className="sr">{S.done.includes(week[i]) ? 'completado' : ''}</span>
        </li>)}
      </ul>
    </section>

    {rec && <section aria-labelledby="rec">
      <h2 id="rec">Te puede gustar</h2>
      <ActItem a={rec} />
    </section>}
  </Page>
}
