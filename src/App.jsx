import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import {
  IconeHoje,
  IconeClientes,
  IconeCreditos,
  IconeRevenda,
  IconeFinanceiro,
  Logo,
} from './icones.jsx'
import {
  lerClientes,
  salvarCliente,
  apagarCliente,
  novoCliente,
  renovarCliente,
  registrarPagamento,
  lerRevendedores,
  salvarRevendedor,
  apagarRevendedor,
  novoRevendedor,
  venderCreditoRevendedor,
  marcarVendaRevendaPaga,
  lerRenovacoes,
  lerPagamentos,
  lerComprasCredito,
  lerVendasRevenda,
  lerTabelaAtacado,
  salvarTabelaAtacado,
  registrarCompraCredito,
} from './dados.js'
import Login from './telas/Login.jsx'
import Hoje from './telas/Hoje.jsx'
import Clientes from './telas/Clientes.jsx'
import Creditos from './telas/Creditos.jsx'
import FichaCliente from './telas/FichaCliente.jsx'
import Revendedores from './telas/Revendedores.jsx'
import FichaRevendedor from './telas/FichaRevendedor.jsx'
import Financeiro from './telas/Financeiro.jsx'
import SinoNotificacoes from './SinoNotificacoes.jsx'

const TELAS = [
  { id: 'hoje', nome: 'Hoje', Icone: IconeHoje },
  { id: 'clientes', nome: 'Clientes', Icone: IconeClientes },
  { id: 'creditos', nome: 'Créditos', Icone: IconeCreditos },
  { id: 'revenda', nome: 'Revenda', Icone: IconeRevenda },
  { id: 'financeiro', nome: 'Financeiro', Icone: IconeFinanceiro },
]

/* ============================================================
   O app
   ============================================================ */

export default function App() {
  const [sessao, setSessao] = useState(undefined) // undefined = ainda checando; null = deslogado
  const [ativa, setAtiva] = useState('hoje')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [clientes, setClientes] = useState([])
  const [revendedores, setRevendedores] = useState([])
  const [renovacoes, setRenovacoes] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [comprasCredito, setComprasCredito] = useState([])
  const [vendasRevenda, setVendasRevenda] = useState([])
  const [tabelaAtacado, setTabelaAtacado] = useState(null)

  const [fichaAberta, setFichaAberta] = useState(null)
  const [fichaRevendedorAberta, setFichaRevendedorAberta] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })
    return () => assinatura.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao) return
    setCarregando(true)
    Promise.all([
      lerClientes(),
      lerRevendedores(),
      lerRenovacoes(),
      lerPagamentos(),
      lerComprasCredito(),
      lerVendasRevenda(),
      lerTabelaAtacado(),
    ])
      .then(([c, r, ren, pag, compras, vendas, tabela]) => {
        setClientes(c)
        setRevendedores(r)
        setRenovacoes(ren)
        setPagamentos(pag)
        setComprasCredito(compras)
        setVendasRevenda(vendas)
        setTabelaAtacado(tabela)
        setErro('')
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [sessao])

  function abrirFicha(cliente) {
    setFichaAberta(cliente || novoCliente())
  }

  async function salvar(clienteEditado) {
    await salvarCliente(clienteEditado)
    setClientes(await lerClientes())
    setFichaAberta(null)
  }

  async function apagar(idCliente) {
    await apagarCliente(idCliente)
    setClientes(await lerClientes())
    setFichaAberta(null)
  }

  async function renovar(clienteAtual, creditos) {
    const atualizado = await renovarCliente(clienteAtual, creditos)
    setClientes(await lerClientes())
    setRenovacoes(await lerRenovacoes())
    return atualizado
  }

  async function pagamento(clienteAtual, dadosPagamento) {
    const atualizado = await registrarPagamento(clienteAtual, dadosPagamento)
    setClientes(await lerClientes())
    setPagamentos(await lerPagamentos())
    return atualizado
  }

  async function salvarTabela(tabela) {
    const atualizada = await salvarTabelaAtacado(tabela)
    setTabelaAtacado(atualizada)
    return atualizada
  }

  async function comprarCredito(dadosCompra) {
    await registrarCompraCredito(dadosCompra)
    setComprasCredito(await lerComprasCredito())
  }

  function abrirFichaRevendedor(revendedor) {
    setFichaRevendedorAberta(revendedor || novoRevendedor())
  }

  async function salvarRevendedorAtual(revendedorEditado) {
    await salvarRevendedor(revendedorEditado)
    setRevendedores(await lerRevendedores())
    setFichaRevendedorAberta(null)
  }

  async function apagarRevendedorAtual(idRevendedor) {
    await apagarRevendedor(idRevendedor)
    setRevendedores(await lerRevendedores())
    setFichaRevendedorAberta(null)
  }

  async function vender(revendedorAtual, dadosVenda) {
    await venderCreditoRevendedor({ revendedorId: revendedorAtual.id, ...dadosVenda })
    setVendasRevenda(await lerVendasRevenda())
  }

  async function marcarPago(vendaId, pago) {
    await marcarVendaRevendaPaga(vendaId, pago)
    setVendasRevenda(await lerVendasRevenda())
  }

  if (sessao === undefined) return null
  if (sessao === null) return <Login />
  if (carregando || !tabelaAtacado) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 text-center">
        <p className="text-[14px] text-nevoa">Carregando seus dados…</p>
      </div>
    )
  }

  return (
    <div className="relative isolate min-h-full">
      <div className="brilho brilho-a" aria-hidden="true" />
      <div className="brilho brilho-b" aria-hidden="true" />

      <div className="relative z-10 flex min-h-full">
        {/* Menu lateral — computador */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] p-4 pc:flex">
          <div className="flex items-center gap-2.5 px-2 py-4">
            <Logo />
            <div>
              <p className="font-display text-[15px] font-bold leading-none tracking-tight text-tinta">
                Meu IPTV
              </p>
              <p className="mt-1.5 text-[11px] leading-none text-nevoa">painel da revenda</p>
            </div>
            <div className="ml-auto">
              <SinoNotificacoes tamanho={18} userId={sessao.user.id} />
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {TELAS.map(({ id, nome, Icone }) => {
              const on = id === ativa
              return (
                <button
                  key={id}
                  onClick={() => setAtiva(id)}
                  aria-current={on ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition ${
                    on
                      ? 'bg-eletrico/15 font-semibold text-eletrico'
                      : 'text-nevoa hover:bg-white/[0.05] hover:text-tinta'
                  }`}
                >
                  <Icone tamanho={19} />
                  {nome}
                </button>
              )
            })}
          </nav>

          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-auto flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[12px] leading-relaxed text-nevoa transition hover:bg-white/[0.05] hover:text-tinta"
          >
            <span className="truncate">{sessao.user.email}</span>
            <span className="shrink-0 font-medium text-coral">Sair</span>
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barra de cima — celular */}
          <header className="vidro sticky top-0 z-20 flex items-center gap-2.5 border-b border-white/[0.06] px-5 pb-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] pc:hidden">
            <Logo tamanho={24} />
            <p className="font-display text-[15px] font-bold tracking-tight text-tinta">Meu IPTV</p>
            <div className="ml-auto flex items-center gap-2">
              <SinoNotificacoes tamanho={18} userId={sessao.user.id} />
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-coral"
              >
                Sair
              </button>
            </div>
          </header>

          {erro && (
            <p className="mx-5 mt-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] text-coral pc:mx-10">
              Não consegui falar com o banco: {erro}
            </p>
          )}

          <main className="flex-1">
            <div
              key={ativa}
              className="mx-auto w-full max-w-2xl px-5 pb-40 pt-8 pc:px-10 pc:pb-16 pc:pt-14"
            >
              {ativa === 'hoje' && (
                <Hoje clientes={clientes} comprasCredito={comprasCredito} renovacoes={renovacoes} vendasRevenda={vendasRevenda} />
              )}
              {ativa === 'clientes' && (
                <Clientes clientes={clientes} aoAbrirFicha={abrirFicha} />
              )}
              {ativa === 'creditos' && (
                <Creditos
                  clientes={clientes}
                  revendedores={revendedores}
                  comprasCredito={comprasCredito}
                  renovacoes={renovacoes}
                  vendasRevenda={vendasRevenda}
                  aoRegistrarCompra={comprarCredito}
                />
              )}
              {ativa === 'revenda' && (
                <Revendedores
                  revendedores={revendedores}
                  vendasRevenda={vendasRevenda}
                  aoAbrirFicha={abrirFichaRevendedor}
                />
              )}
              {ativa === 'financeiro' && (
                <Financeiro
                  clientes={clientes}
                  pagamentos={pagamentos}
                  vendasRevenda={vendasRevenda}
                  renovacoes={renovacoes}
                  comprasCredito={comprasCredito}
                />
              )}
            </div>
          </main>

          {/* Barra de baixo — celular */}
          <nav
            aria-label="Telas do app"
            className="vidro fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.07] pc:hidden"
          >
            <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
              {TELAS.map(({ id, nome, Icone }) => {
                const on = id === ativa
                return (
                  <button
                    key={id}
                    onClick={() => setAtiva(id)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 transition ${
                      on ? 'text-eletrico' : 'text-nevoa'
                    }`}
                  >
                    <span
                      className={`rounded-full px-3.5 py-1 transition ${
                        on ? 'bg-eletrico/15' : ''
                      }`}
                    >
                      <Icone tamanho={21} />
                    </span>
                    <span className={`text-[10.5px] ${on ? 'font-semibold' : ''}`}>{nome}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {fichaAberta && (
        <FichaCliente
          cliente={fichaAberta}
          renovacoes={renovacoes}
          pagamentos={pagamentos}
          comprasCredito={comprasCredito}
          vendasRevenda={vendasRevenda}
          tabelaAtacado={tabelaAtacado}
          aoSalvar={salvar}
          aoFechar={() => setFichaAberta(null)}
          aoApagar={apagar}
          aoRenovar={renovar}
          aoRegistrarPagamento={pagamento}
          aoSalvarTabela={salvarTabela}
        />
      )}

      {fichaRevendedorAberta && (
        <FichaRevendedor
          revendedor={fichaRevendedorAberta}
          comprasCredito={comprasCredito}
          renovacoes={renovacoes}
          vendasRevenda={vendasRevenda}
          aoSalvar={salvarRevendedorAtual}
          aoFechar={() => setFichaRevendedorAberta(null)}
          aoApagar={apagarRevendedorAtual}
          aoVender={vender}
          aoMarcarPago={marcarPago}
        />
      )}
    </div>
  )
}
