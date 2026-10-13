import { useApp } from '../store'
import { CAT, CONDS, MOB } from '../data'
import { Page, Choice, Ic, Fold } from '../ui'
import Notify from './Notify'

const SIZES = [[1, 'Normal'], [1.15, 'Grande'], [1.3, 'Muy grande']]
const THEMES = [['auto', 'Como mi dispositivo'], ['light', 'Claro'], ['dark', 'Oscuro']]

export default function Perfil() {
  const { S, set, say, api, signOut } = useApp()
  const { user, prefs } = S
  const setUser = p => set({ user: { ...user, ...p } })
  const setPref = p => set({ prefs: { ...prefs, ...p } })
  const toggle = (k, v) => setUser({ [k]: user[k].includes(v) ? user[k].filter(i => i !== v) : [...user[k], v] })

  const reset = async () => {
    if (!confirm('¿Borrar todos tus datos de Vitania? Esto no se puede deshacer.')) return
    try { await api('/me', { method: 'DELETE' }); signOut() } catch { say('No se pudo borrar. Inténtalo otra vez.') }
  }

  return <Page title={user.name} back="#/inicio">
    <p className="muted" style={{ marginTop: -4 }}>{user.email}</p>

    <Fold title="Letra y colores" icon="sun">
      <fieldset><legend>Tamaño de letra</legend>
        {SIZES.map(([v, l]) => <Choice key={v} type="radio" name="size" label={l} checked={prefs.size === v} onChange={() => setPref({ size: v })} />)}
      </fieldset>
      <fieldset><legend>Apariencia</legend>
        {THEMES.map(([v, l]) => <Choice key={v} type="radio" name="theme" label={l}
          checked={(prefs.theme ?? 'auto') === v} onChange={() => setPref({ theme: v })} />)}
      </fieldset>
      <fieldset><legend>Más ayudas</legend>
        <Choice label="Alto contraste" checked={prefs.contrast} onChange={e => setPref({ contrast: e.target.checked })} />
        <Choice label="Leer pasos en voz alta" checked={prefs.voice} onChange={e => setPref({ voice: e.target.checked })} />
      </fieldset>
    </Fold>

    <Fold title="Avisos" icon="bell"><Notify /></Fold>

    <Fold title="Mi salud" icon="steth">
      <fieldset><legend>Condiciones</legend>
        {Object.entries(CONDS).map(([k, l]) => <Choice key={k} label={l} checked={user.conds.includes(k)} onChange={() => toggle('conds', k)} />)}
      </fieldset>
      <fieldset><legend>Movilidad</legend>
        {Object.entries(MOB).map(([k, l]) => <Choice key={k} type="radio" name="mob" label={l} checked={user.mob === k} onChange={() => setUser({ mob: k })} />)}
      </fieldset>
      <fieldset><legend>Contacto de emergencia</legend>
        <input type="text" aria-label="Nombre del contacto" placeholder="Nombre" value={user.emergency?.name ?? ''}
          onChange={e => setUser({ emergency: { ...user.emergency, name: e.target.value } })} />
        <input type="tel" aria-label="Teléfono del contacto" placeholder="Teléfono" value={user.emergency?.phone ?? ''}
          onChange={e => setUser({ emergency: { ...user.emergency, phone: e.target.value } })} />
      </fieldset>
    </Fold>

    <Fold title="Mis intereses" icon="lotus">
      <fieldset>
        {Object.entries(CAT).map(([k, c]) => <Choice key={k} label={<span className="row" style={{ gap: 10 }}><Ic n={c.ic} />{c.n}</span>}
          checked={user.ints.includes(k)} onChange={() => toggle('ints', k)} />)}
      </fieldset>
    </Fold>

    <Fold title="Seguridad" icon="shield">
      <p style={{ marginTop: 8 }}>{S.reports.length === 1 ? 'Has enviado 1 reporte.' : `Has enviado ${S.reports.length} reportes.`}</p>
      {S.blocked.length ? <ul className="plain">
        {S.blocked.map(b => <li key={b} className="row" style={{ justifyContent: 'space-between', padding: '10px 0' }}>
          <span>{b}</span>
          <button className="btn ghost sm" onClick={() => { set({ blocked: S.blocked.filter(x => x !== b) }); say(`Desbloqueaste a ${b}.`) }}>Desbloquear</button>
        </li>)}
      </ul> : <p className="muted">No has bloqueado a nadie.</p>}
    </Fold>

    <div className="stack" style={{ marginTop: 32 }}>
      <button className="btn ghost" onClick={signOut}><Ic n="out" /> Cerrar sesión</button>
      <button className="btn ghost sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={reset}>Borrar mis datos</button>
    </div>
  </Page>
}
