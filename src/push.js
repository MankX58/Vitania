// Avisos push en este dispositivo: permiso + service worker + suscripción guardada en el servidor.
const b64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0))

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

const register = () => navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').then(() => navigator.serviceWorker.ready)

export async function pushState() {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration()
  return reg && (await reg.pushManager.getSubscription()) ? 'on' : 'off'
}

export async function enablePush(api) {
  if ((await Notification.requestPermission()) !== 'granted') return 'denied'
  const reg = await register()
  const { key } = await api('/push/key')
  const sub = (await reg.pushManager.getSubscription())
    ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key) })
  await api('/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone } })
  return 'on'
}

export async function disablePush(api) {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) { await api('/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }); await sub.unsubscribe() }
  return 'off'
}
