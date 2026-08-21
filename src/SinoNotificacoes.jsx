import { useEffect, useState } from 'react'
import { IconeSino } from './icones.jsx'
import { usePermissaoNotificacao, inscreverPush } from './notificacoes.js'

/* Sininho do cabeçalho: pede a permissão de notificação uma vez.
   O navegador só mostra o pop-up nativo na primeira vez; depois disso
   ele já lembra a resposta (ativado, bloqueado etc.), então só refletimos
   esse estado aqui — nunca insistimos.

   Assim que a permissão está concedida, inscrevemos o aparelho no push
   e salvamos no Supabase — é isso que o servidor vai usar depois para
   saber pra quem mandar a notificação. */
export default function SinoNotificacoes({ tamanho = 20, userId }) {
  const { permissao, pedirPermissao } = usePermissaoNotificacao()
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (permissao === 'granted' && userId) {
      inscreverPush(userId).catch((e) => console.error('Falha ao inscrever push:', e))
    }
  }, [permissao, userId])

  if (permissao === 'indisponivel') return null

  function mostrarAviso(texto) {
    setAviso(texto)
    setTimeout(() => setAviso(''), 3500)
  }

  async function aoClicar() {
    if (permissao === 'granted') {
      mostrarAviso('Notificações já estão ativadas neste aparelho.')
      return
    }
    if (permissao === 'denied') {
      mostrarAviso('Bloqueadas no navegador. Ative nas configurações do site para receber.')
      return
    }
    const resultado = await pedirPermissao()
    mostrarAviso(
      resultado === 'granted'
        ? 'Notificações ativadas!'
        : 'Tudo bem, você pode ativar depois clicando aqui de novo.',
    )
  }

  const cor =
    permissao === 'granted' ? 'text-eletrico' : permissao === 'denied' ? 'text-coral' : 'text-nevoa'

  return (
    <div className="relative">
      <button
        onClick={aoClicar}
        title="Notificações"
        aria-label="Notificações"
        className={`rounded-full border border-white/[0.08] bg-white/[0.04] p-2 transition hover:bg-white/[0.08] ${cor}`}
      >
        <IconeSino tamanho={tamanho} />
      </button>
      {aviso && (
        <p className="absolute right-0 top-full z-30 mt-2 w-52 rounded-lg border border-white/[0.08] bg-[#0B1020] px-3 py-2 text-[11px] leading-snug text-tinta shadow-lg">
          {aviso}
        </p>
      )}
    </div>
  )
}
