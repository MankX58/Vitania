# Vitania

React + Vite · Auth0 (login) · Neon Postgres (datos) · Express (API validando el JWT de Auth0).

## Configuración
1. **Auth0**: crea una *Single Page Application* y una *API* (su Identifier es el `AUDIENCE`).
   En la app SPA agrega `http://localhost:5173` a *Allowed Callback URLs*, *Logout URLs* y *Web Origins*.
2. **Neon**: crea un proyecto y copia el *connection string*. Las tablas se crean solas al primer uso.
3. `cp .env.example .env` y completa los valores.

## Uso
```bash
npm install
npm run dev          # app + API en http://localhost:5173
npm run build && npm start   # producción (un solo proceso)
```

## Estructura
- `src/store.jsx` estado, carga y guardado automático en Neon.
- `src/views/` pantallas · `src/ui.jsx` componentes comunes · `src/data.js` catálogo.
- `server/api.js` API (perfil, clases compartidas, asistencia) · `server/index.js` producción.

## Desplegar en Vercel (con avisos push)
1. Sube el proyecto a GitHub y en vercel.com elige **Add New → Project** con ese repo. Vercel detecta `vercel.json`.
2. En **Settings → Environment Variables** agrega todas las del `.env` (incluye `CRON_SECRET`).
3. En Auth0 agrega `https://TU-APP.vercel.app` en *Allowed Callback URLs*, *Allowed Logout URLs* y *Allowed Web Origins*.
4. Crea un cron en [cron-job.org](https://cron-job.org): URL `https://TU-APP.vercel.app/api/cron/tick`,
   cada 5 minutos, con el encabezado `Authorization: Bearer TU_CRON_SECRET`.

Sin proceso permanente (Vercel) los avisos los dispara ese cron. En local (`npm run dev`) y en Render (`npm start`)
el servidor los revisa solo cada minuto.
