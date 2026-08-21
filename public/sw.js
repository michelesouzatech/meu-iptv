// Service worker do Meu IPTV.
// Ele roda "por trás" do app, mesmo com o app fechado — é o que
// permite o celular receber e mostrar notificações push.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Etapa 4: o servidor (Edge Function) manda um 'push' criptografado;
// o navegador já descriptografa e entrega o texto aqui dentro.
self.addEventListener('push', (event) => {
  let dados = { title: 'Meu IPTV', body: 'Você tem uma novidade.', url: '/' }
  try {
    dados = { ...dados, ...event.data.json() }
  } catch {
    // se não vier JSON, fica no texto padrão acima
  }

  event.waitUntil(
    self.registration.showNotification(dados.title, {
      body: dados.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: dados.url || '/' },
    }),
  )
})

// Clicou na notificação: abre (ou foca) o app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      const aberta = lista.find((c) => c.url.includes(self.location.origin))
      if (aberta) return aberta.focus()
      return self.clients.openWindow(url)
    }),
  )
})
