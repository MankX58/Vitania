// Recibe los avisos push aunque la página esté cerrada.
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : { title: 'Vitania', body: '' }
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, tag: d.tag, icon: 'icon.svg', badge: 'icon.svg', data: { url: d.url || '' },
  }))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = self.registration.scope + (e.notification.data.url || '')
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list[0]
    return c ? c.focus().then(() => c.navigate(url)) : self.clients.openWindow(url)
  }))
})
