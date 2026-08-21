/* ============================================================
   Registra o service worker (público em /sw.js).
   Sem ele, o navegador não tem como receber notificações push
   com o app fechado.
   ============================================================ */

export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  return navigator.serviceWorker.register('/sw.js')
}
