import { useEffect, useState } from 'react'
import { useApp } from '../store'
import { Switch } from '../ui'
import { pushState, enablePush, disablePush } from '../push'

/** Avisos: (1) permitir notificaciones en este dispositivo, (2) avisar de las actividades del día. */
export default function Notify() {
  const { S, set, say, api } = useApp()
  const [st, setSt] = useState('...')
  const [busy, setBusy] = useState(false)
  useEffect(() => { pushState().then(setSt) }, [])

  const toggle = async on => {
    setBusy(true)
    try { setSt(on ? await enablePush(api) : await disablePush(api)) }
    catch { say('No pudimos activar los avisos. Revisa tu conexión.'); setSt(await pushState()) }
    setBusy(false)
  }
  const test = async () => {
    try { const { sent } = await api('/push/test', { method: 'POST' }); say(sent ? 'Te enviamos un aviso de prueba.' : 'Este dispositivo aún no está registrado.') }
    catch { say('No se pudo enviar la prueba.') }
  }
  const isIos = /iphone|ipad/i.test(navigator.userAgent) && !matchMedia('(display-mode: standalone)').matches

  return <div className="stack">
    {st === 'unsupported' || (isIos && st !== 'on')
      ? <p className="note">{isIos
          ? 'En iPhone o iPad, primero toca Compartir y elige "Añadir a pantalla de inicio". Luego abre Vitania desde ahí para activar los avisos.'
          : 'Este navegador no permite avisos. Prueba con Chrome, Edge o Firefox.'}</p>
      : <Switch on={st === 'on'} onChange={toggle} label="Avisos en este dispositivo"
          hint={busy ? 'Un momento…' : st === 'denied' ? 'Bloqueados: actívalos en los ajustes del navegador' : st === 'on' ? 'Te avisamos de tus citas, aunque cierres la app' : 'Desactivados'} />}
    <Switch on={!!S.prefs.notifyDay} onChange={v => set(s => ({ prefs: { ...s.prefs, notifyDay: v } }))}
      label="Avisar de mis actividades" hint="30 minutos antes de cada actividad en la que estés inscrito/a" />
    {st === 'on' && <button className="btn ghost sm" onClick={test}>Enviar aviso de prueba</button>}
  </div>
}
