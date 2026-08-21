/* ============================================================
   Etapa 1: permissão de notificação do navegador.
   Etapa 2: inscrever o aparelho no push e salvar no Supabase.

   A chave abaixo é a metade PÚBLICA do par VAPID — pode ficar no
   código do navegador sem problema (é como um endereço de entrega,
   não uma senha). A metade privada nunca vem pro front-end; ela mora
   só no servidor (Supabase Edge Function), configurada na etapa 3.
   ============================================================ */

import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const VAPID_PUBLIC_KEY =
  'BAkZX9xTyyP3pAtrtcBqaPpGfod1AAP6ROiUYp8U0ZL5Yd_XUT11-MQ9yD8SheAqxuMEhHdvnR-aTqvubUms57Y'

function chaveParaUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalizada = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const bruto = atob(normalizada)
  return Uint8Array.from([...bruto].map((c) => c.charCodeAt(0)))
}

// Garante que este aparelho tem uma inscrição de push ativa e que ela
// está salva no banco, associada ao usuário logado. Pode ser chamada
// várias vezes sem problema — se já existe inscrição, só reaproveita.
export async function inscreverPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const registro = await navigator.serviceWorker.ready
  let inscricao = await registro.pushManager.getSubscription()
  if (!inscricao) {
    inscricao = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chaveParaUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const { endpoint, keys } = inscricao.toJSON()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' },
    )
  if (error) throw error

  return inscricao
}

export function usePermissaoNotificacao() {
  const [permissao, setPermissao] = useState(
    'Notification' in window ? Notification.permission : 'indisponivel',
  )

  useEffect(() => {
    if (!navigator.permissions?.query) return
    let ativo = true
    navigator.permissions
      .query({ name: 'notifications' })
      .then((status) => {
        status.onchange = () => ativo && setPermissao(Notification.permission)
      })
      .catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  async function pedirPermissao() {
    if (!('Notification' in window)) return 'indisponivel'
    const resultado = await Notification.requestPermission()
    setPermissao(resultado)
    return resultado
  }

  return { permissao, pedirPermissao }
}
