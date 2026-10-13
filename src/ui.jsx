import { useEffect, useRef, useState } from 'react'
import { useApp } from './store'
import {
  House, PersonSimpleTaiChi, CalendarBlank, BowlFood, UserCircle, ArrowLeft, Clock, ShieldWarning, Plus,
  MapPin, VideoCamera, Bell, Check, CheckCircle, Play, Pause, SkipBack, SkipForward, PersonSimpleRun,
  CookingPot, Scissors, FlowerLotus, MusicNotes, ChatsCircle, Stethoscope, UsersThree, Coffee, PushPin,
  X, CaretRight, SignOut, Sun, Moon, Warning, User, SquaresFour, CaretDown,
} from '@phosphor-icons/react'

const ICONS = {
  home: House, move: PersonSimpleTaiChi, cal: CalendarBlank, food: BowlFood, me: UserCircle, back: ArrowLeft,
  clock: Clock, shield: ShieldWarning, plus: Plus, pin: MapPin, video: VideoCamera, bell: Bell, check: Check,
  ok: CheckCircle, play: Play, pause: Pause, prev: SkipBack, next: SkipForward, run: PersonSimpleRun,
  pot: CookingPot, craft: Scissors, lotus: FlowerLotus, music: MusicNotes, chat: ChatsCircle,
  steth: Stethoscope, family: UsersThree, coffee: Coffee, push: PushPin, x: X, go: CaretRight, out: SignOut,
  sun: Sun, moon: Moon, warn: Warning, user: User, grid: SquaresFour, down: CaretDown,
}

/** Un solo set de iconos (Phosphor) con un solo grosor. */
export const Ic = ({ n, size = 24, w = 'regular', ...p }) => {
  const C = ICONS[n]
  return <C size={size} weight={w} aria-hidden="true" {...p} />
}

/** Forma de arco: la firma visual de Vitania. */
export const Arch = ({ tone = 'blue', icon, size = 56 }) =>
  <span className={`arch tone-${tone}`} style={{ '--s': size + 'px' }} aria-hidden="true">
    <Ic n={icon} size={size * .5} w="duotone" />
  </span>

/** Cabecera + contenido. El h1 recibe el foco al navegar (lectores de pantalla). */
export function Page({ title, back, head, children }) {
  const h = useRef()
  const { isDark, toggleTheme } = useApp()
  const dark = isDark()
  useEffect(() => { h.current?.focus(); window.scrollTo(0, 0); document.title = `${title} · Vitania` }, [title])
  return <div className="page">
    <header className="head">
      {back && <a className="back" href={back}><Ic n="back" size={22} w="bold" /> Volver</a>}
      <button className="theme-btn" onClick={toggleTheme} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
        <Ic n={dark ? 'sun' : 'moon'} w="bold" />
      </button>
      <h1 ref={h} tabIndex={-1}>{title}</h1>
      {head}
    </header>
    <main id="main" className="in">{children}</main>
  </div>
}

export const Choice = ({ type = 'checkbox', label, hint, ...p }) =>
  <label className="choice"><input type={type} {...p} /><span>{label}{hint && <small>{hint}</small>}</span></label>

export const Switch = ({ on, onChange, label, hint }) =>
  <button type="button" role="switch" aria-checked={on} className="switch" onClick={() => onChange(!on)}>
    <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
    <i aria-hidden="true" />
  </button>

/** Cupos como sillas: una por cada lugar. */
export function Seats({ total, taken }) {
  const n = Math.min(total, 20)
  const filled = Math.round(taken / total * n)
  return <span className="seats" role="img" aria-label={`${taken} de ${total} cupos ocupados`}>
    {Array.from({ length: n }, (_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}
  </span>
}

export const Modes = ({ modes }) => <span className="modes">
  {modes.includes('presencial') && <span><Ic n="pin" size={18} /> Presencial</span>}
  {modes.includes('virtual') && <span><Ic n="video" size={18} /> Virtual</span>}
</span>

/** YouTube "liviano": primero una imagen, el video real se carga al tocar (más rápido y más privado). */
export function Video({ id, title, by }) {
  const [on, setOn] = useState(false)
  return <figure className="video-box">
    <div className="video">
      {on
        ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin" />
        : <button onClick={() => setOn(true)} aria-label={`Reproducir video: ${title}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="play"><Ic n="play" size={36} w="fill" /></span>
          </button>}
    </div>
    <figcaption>
      <strong>{title}</strong>
      {by && <span className="hint" style={{ display: 'block' }}>{by}</span>}
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">Ver en YouTube</a>
    </figcaption>
  </figure>
}

/** Sección plegable (nativa: teclado y lectores de pantalla funcionan solos). */
export const Fold = ({ title, icon, children, open }) =>
  <details className="fold" open={open}>
    <summary><Ic n={icon} w="duotone" size={28} /><span>{title}</span><Ic n="go" w="bold" className="caret" /></summary>
    <div className="fold-body">{children}</div>
  </details>

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const LONG = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

/** Los 7 días de la semana siempre visibles (sin deslizar). `week` = 7 fechas ISO, lunes a domingo. */
export function WeekPicker({ week, value, onChange, today }) {
  return <div className="weekpick" role="group" aria-label="Elige un día">
    {week.map((d, i) => {
      const n = +d.slice(8)
      return <button key={d} aria-pressed={value === i} data-today={i === today || undefined} onClick={() => onChange(i)}
        aria-label={`${LONG[i]} ${n}${i === today ? ', hoy' : ''}`}>
        <span aria-hidden="true">{DOW[i]}</span><strong aria-hidden="true">{n}</strong>
      </button>
    })}
  </div>
}

/** Botón grande que muestra la opción actual y abre una lista con todas las opciones a la vista. */
export const SelectButton = ({ label, value, icon, onClick }) =>
  <button className="select-btn" onClick={onClick} aria-haspopup="dialog">
    <Ic n={icon} size={28} w="duotone" />
    <span><small>{label}</small><strong>{value}</strong></span>
    <Ic n="down" w="bold" />
  </button>

/** Cuadrícula de opciones grandes (radios nativos: teclado y lectores de pantalla funcionan solos). */
export function OptionGrid({ title, options, value, onPick }) {
  return <fieldset className="opt-grid">
    <legend>{title}</legend>
    {options.map(([k, label, icon]) =>
      <label key={k} className="opt">
        <input type="radio" name="opt" checked={value === k} onChange={() => onPick(k)} />
        <span><Ic n={icon} size={32} w="duotone" />{label}</span>
      </label>)}
  </fieldset>
}
