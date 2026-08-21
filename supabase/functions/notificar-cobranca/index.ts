// Meu IPTV — Edge Function "notificar-cobranca"
//
// O que faz: procura clientes (perfil Padrão/Atacado) já vencidos ou que
// vencem nos próximos 2 dias, agrupa por dono (user_id) e manda um push
// pra cada aparelho inscrito daquele dono.
//
// Quem chama esta função: o agendamento diário (pg_cron), ou você mesmo
// manualmente pra testar — nos dois casos precisa do header
// "x-cron-secret" batendo com o segredo CRON_SECRET configurado no painel.
// Não usamos o login do app aqui (verify_jwt fica desligado) porque quem
// chama é o próprio banco de dados, não uma pessoa logada no navegador.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const DIAS_PARA_AVISAR = 2

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response('não autorizado', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const limite = new Date()
  limite.setDate(limite.getDate() + DIAS_PARA_AVISAR)
  const limiteISO = limite.toISOString().slice(0, 10)

  const { data: clientes, error: erroClientes } = await supabase
    .from('clientes')
    .select('nome, user_id, vencimento')
    .in('perfil', ['padrao', 'atacado'])
    .lte('vencimento', limiteISO)

  if (erroClientes) {
    return new Response(JSON.stringify({ erro: erroClientes.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const porUsuario = new Map()
  for (const c of clientes ?? []) {
    if (!porUsuario.has(c.user_id)) porUsuario.set(c.user_id, [])
    porUsuario.get(c.user_id).push(c)
  }

  const resultado = []

  for (const [userId, lista] of porUsuario) {
    const { data: inscricoes } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)

    if (!inscricoes || inscricoes.length === 0) continue

    const title = lista.length === 1 ? '1 cliente para cobrar hoje' : `${lista.length} clientes para cobrar hoje`
    const nomes = lista.slice(0, 3).map((c) => c.nome).join(', ')
    const body = lista.length > 3 ? `${nomes} e mais ${lista.length - 3}` : nomes
    const payload = JSON.stringify({ title, body, url: '/' })

    for (const inscricao of inscricoes) {
      try {
        await webpush.sendNotification(
          { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
          payload,
        )
        resultado.push({ userId, endpoint: inscricao.endpoint, ok: true })
      } catch (e) {
        // 404/410 = inscrição morta (usuário desinstalou, trocou de navegador etc.) — apaga.
        if (e.statusCode === 404 || e.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', inscricao.id)
        }
        resultado.push({ userId, endpoint: inscricao.endpoint, ok: false, erro: String(e) })
      }
    }
  }

  return new Response(JSON.stringify({ usuariosNotificados: porUsuario.size, resultado }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
