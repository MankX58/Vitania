import express from 'express'
import { timingSafeEqual } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { neon } from '@neondatabase/serverless'
import webpush from 'web-push'
import { SEED } from '../src/data.js'

const CATS = ['aerobicos', 'gastronomia', 'manualidades', 'bienestar', 'musica', 'charlas']
const MODES = ['presencial', 'virtual']
const str = (v, n) => String(v ?? '').trim().slice(0, n)
const num = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Math.round(+v) || d))

// Solo se aceptan servicios de push reales (evita que el servidor llame a URLs arbitrarias).
const PUSH_HOST = /^https:\/\/([a-z0-9-]+\.)*(googleapis\.com|mozilla\.com|push\.apple\.com|notify\.windows\.com)\//

/** Fecha y minutos del día en la zona horaria de la persona (las citas se guardan en hora local). */
function localNow(tz) {
  let parts
  const f = z => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date())
  try { parts = f(tz) } catch { parts = f('UTC') }
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, hm: `${p.hour}:${p.minute}` }
}
const naive = (date, hm) => Date.parse(`${date}T${hm}:00Z`)   // hora "de reloj" sin zona, solo para comparar

/** Router /api: valida el JWT de Auth0 y guarda todo en Neon (Postgres). */
export function createApi(env) {
  const domain = env.VITE_AUTH0_DOMAIN
  const jwks = createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`))
  const sql = neon(env.DATABASE_URL)

  let ready
  const init = () => ready ??= (async () => {
    await sql`create table if not exists profiles (
      sub text primary key, doc jsonb not null, updated_at timestamptz not null default now())`
    await sql`create table if not exists classes (
      id text primary key, host_sub text not null, doc jsonb not null, created_at timestamptz not null default now())`
    await sql`create table if not exists attendance (
      activity_id text not null, sub text not null, mode text not null, primary key (activity_id, sub))`
    await sql`create table if not exists push_subs (
      endpoint text primary key, sub text not null, subscription jsonb not null, tz text not null default 'UTC')`
    await sql`create table if not exists sent (
      sub text not null, key text not null, at timestamptz not null default now(), primary key (sub, key))`
  })().catch(e => { ready = undefined; throw e })

  // express() (no Router) para que req/res tengan .status/.json también bajo Vite/connect
  const pushOk = !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
  if (pushOk) webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:admin@vitania.app', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY)
  const api = express()
  api.use(express.json({ limit: '100kb' }))

  // Lo llama un cron externo (o Vercel Cron). Se protege con un secreto compartido, no con Auth0.
  api.all('/cron/tick', async (req, res) => {
    const given = Buffer.from((req.headers.authorization || '').replace(/^Bearer /, ''))
    const want = Buffer.from(env.CRON_SECRET || '')
    if (!want.length || given.length !== want.length || !timingSafeEqual(given, want))
      return res.status(401).json({ error: 'unauthorized' })
    if (!pushOk) return res.status(503).json({ error: 'push off' })
    await init()
    res.json({ ok: true, sent: await tick() })
  })

  api.use(async (req, res, next) => {
    try {
      const token = (req.headers.authorization || '').replace(/^Bearer /, '')
      const { payload } = await jwtVerify(token, jwks, { issuer: `https://${domain}/`, audience: env.VITE_AUTH0_AUDIENCE })
      req.sub = payload.sub
    } catch { return res.status(401).json({ error: 'unauthorized' }) }
    await init()
    next()
  })

  // Todo lo que la app necesita al arrancar
  api.get('/me', async (req, res) => {
    const [me] = await sql`select doc from profiles where sub = ${req.sub}`
    const rows = await sql`select id, host_sub, doc from classes order by created_at`
    const counts = await sql`select activity_id, count(*)::int as n from attendance group by 1`
    res.json({
      doc: me?.doc ?? null,
      classes: rows.map(r => ({ ...r.doc, id: r.id, mine: r.host_sub === req.sub })),
      counts: Object.fromEntries(counts.map(c => [c.activity_id, c.n])),
    })
  })

  api.put('/me', async (req, res) => {
    const doc = req.body
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return res.status(400).json({ error: 'bad doc' })
    await sql`insert into profiles (sub, doc) values (${req.sub}, ${JSON.stringify(doc)}::jsonb)
      on conflict (sub) do update set doc = excluded.doc, updated_at = now()`
    res.status(204).end()
  })

  api.delete('/me', async (req, res) => {
    await sql`delete from attendance where sub = ${req.sub}`
    await sql`delete from classes where host_sub = ${req.sub}`
    await sql`delete from profiles where sub = ${req.sub}`
    res.status(204).end()
  })

  api.post('/classes', async (req, res) => {
    const b = req.body ?? {}
    const modes = MODES.filter(m => (b.modes ?? []).includes(m))
    const zoom = str(b.zoom, 300)
    if (!CATS.includes(b.cat) || !str(b.title, 80) || !modes.length
      || !/^\d{4}-\d\d-\d\d$/.test(b.date) || !/^\d\d:\d\d$/.test(b.time)
      || (zoom && !/^https:\/\//.test(zoom))) return res.status(400).json({ error: 'invalid class' })
    const id = 'c' + crypto.randomUUID().slice(0, 8)
    const doc = {
      cat: b.cat, title: str(b.title, 80), desc: str(b.desc, 500) || 'Clase propuesta por un compañero.',
      date: b.date, time: b.time, min: num(b.min, 10, 180, 45), cupos: num(b.cupos, 2, 40, 10), taken: 0,
      level: 'Suave', host: str(b.host, 60) || 'Compañero', place: str(b.place, 100) || 'Por confirmar',
      modes, zoom: zoom || undefined, seated: true,
    }
    await sql`insert into classes (id, host_sub, doc) values (${id}, ${req.sub}, ${JSON.stringify(doc)}::jsonb)`
    res.status(201).json({ ...doc, id, mine: true })
  })

  api.put('/attendance/:id', async (req, res) => {
    const mode = req.body?.mode
    if (!MODES.includes(mode)) return res.status(400).json({ error: 'bad mode' })
    await sql`insert into attendance (activity_id, sub, mode) values (${str(req.params.id, 40)}, ${req.sub}, ${mode})
      on conflict (activity_id, sub) do update set mode = excluded.mode`
    res.status(204).end()
  })

  api.delete('/attendance/:id', async (req, res) => {
    await sql`delete from attendance where activity_id = ${str(req.params.id, 40)} and sub = ${req.sub}`
    res.status(204).end()
  })

  // ---- Avisos push ----
  api.get('/push/key', (req, res) => pushOk ? res.json({ key: env.VAPID_PUBLIC_KEY }) : res.status(503).json({ error: 'push off' }))

  api.post('/push/subscribe', async (req, res) => {
    const sub = req.body?.subscription
    if (!pushOk || !sub?.endpoint || !sub?.keys || !PUSH_HOST.test(sub.endpoint)) return res.status(400).json({ error: 'bad subscription' })
    await sql`insert into push_subs (endpoint, sub, subscription, tz)
      values (${sub.endpoint}, ${req.sub}, ${JSON.stringify(sub)}::jsonb, ${str(req.body.tz, 60) || 'UTC'})
      on conflict (endpoint) do update set sub = excluded.sub, subscription = excluded.subscription, tz = excluded.tz`
    res.status(204).end()
  })

  api.post('/push/unsubscribe', async (req, res) => {
    await sql`delete from push_subs where endpoint = ${str(req.body?.endpoint, 600)} and sub = ${req.sub}`
    res.status(204).end()
  })

  api.post('/push/test', async (req, res) => {
    const rows = await sql`select endpoint, subscription from push_subs where sub = ${req.sub}`
    await Promise.all(rows.map(r => send(r, { title: 'Vitania', body: 'Los avisos funcionan. Así te recordaremos tus citas.', tag: 'test', url: '#/citas' })))
    res.json({ sent: rows.length })
  })

  async function send(row, payload) {
    try { await webpush.sendNotification(row.subscription, JSON.stringify(payload)) }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await sql`delete from push_subs where endpoint = ${row.endpoint}`; else console.error('push', e.statusCode || e.message) }
  }

  /** Cada minuto: busca citas y actividades que toca avisar y las envía (una sola vez por aviso). */
  async function tick() {
    const rows = await sql`select s.endpoint, s.subscription, s.tz, s.sub, p.doc from push_subs s join profiles p on p.sub = s.sub`
    if (!rows.length) return 0
    let count = 0
    const classes = await sql`select id, doc from classes`
    const byUser = new Map()
    for (const r of rows) (byUser.get(r.sub) ?? byUser.set(r.sub, []).get(r.sub)).push(r)

    for (const [sub, devs] of byUser) {
      const { doc, tz } = devs[0]
      const now = naive(...Object.values(localNow(tz)))
      const today = localNow(tz).date
      const due = []

      for (const a of doc.appts ?? []) {
        if (!(a.remind > 0)) continue
        const at = naive(a.date, a.time)
        if (now >= at - a.remind * 6e4 && now < at)
          due.push({ key: `appt:${a.id}:${a.remind}`, title: a.title,
            body: `${a.date === today ? 'Hoy' : 'Pronto'} a las ${a.time}`, url: '#/citas' })
      }

      if (doc.prefs?.notifyDay) {
        const custom = classes.map(c => ({ ...c.doc, id: c.id }))
        for (const [id, mode] of Object.entries(doc.joined ?? {})) {
          // ids de ejemplo: "aer1-2026-10-14" = actividad + fecha de esa ocurrencia
          let a = custom.find(x => x.id === id)
          const m = /^([a-z0-9]+)-(\d{4}-\d\d-\d\d)$/.exec(id)
          const seed = !a && m && SEED.find(x => x.id === m[1])
          if (seed) a = { ...seed, id, date: m[2] }
          if (!a || a.date !== today) continue
          const at = naive(a.date, a.time)
          if (now >= at - 30 * 6e4 && now < at)
            due.push({ key: `act:${id}:${a.date}`, title: `En 30 minutos: ${a.title}`,
              body: `${a.time}, ${mode === 'virtual' ? 'en línea' : 'en persona'}`, url: `#/actividad/${id}` })
        }
      }

      for (const d of due) {
        const [first] = await sql`insert into sent (sub, key) values (${sub}, ${d.key}) on conflict do nothing returning key`
        if (first) { count++; await Promise.all(devs.map(r => send(r, { title: d.title, body: d.body, tag: d.key, url: d.url }))) }
      }
    }
    await sql`delete from sent where at < now() - interval '3 days'`
    return count
  }

  // En Vercel no hay proceso permanente: ahi lo dispara un cron externo llamando a /api/cron/tick.
  if (pushOk && !process.env.VERCEL && !globalThis.__vitaniaPush) {
    globalThis.__vitaniaPush = setInterval(() => init().then(tick).catch(e => console.error('tick', e.message)), 60_000)
    globalThis.__vitaniaPush.unref?.()
  }

  // eslint-disable-next-line no-unused-vars
  api.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'server' }) })
  return api
}
