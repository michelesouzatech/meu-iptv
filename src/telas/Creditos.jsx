import { useMemo, useState } from 'react'
import {
  calcularCustoMedioCredito,
  calcularSaldoCreditos,
  extratoCreditos,
  formatarData,
  formatarMoeda,
  hojeISO,
  SALDO_BAIXO,
} from '../dados.js'
import { IconeAlerta, IconeCreditos, IconeMais, IconeTroca, IconeX } from '../icones.jsx'

const campo =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-3 text-[15px] text-tinta placeholder-nevoa/50 outline-none transition focus:border-eletrico/60 focus:bg-white/[0.06]'

const rotulo = 'mb-1.5 block text-[13px] font-medium text-nevoa'

function novaCompra() {
  return { data: hojeISO(), painel: '', quantidade: '', custoTotal: '' }
}

export default function Creditos({
  clientes,
  revendedores,
  comprasCredito,
  renovacoes,
  vendasRevenda,
  aoRegistrarCompra,
}) {
  const saldo = useMemo(
    () => calcularSaldoCreditos(comprasCredito, renovacoes, vendasRevenda),
    [comprasCredito, renovacoes, vendasRevenda],
  )
  const custoMedio = useMemo(() => calcularCustoMedioCredito(comprasCredito), [comprasCredito])
  const extrato = useMemo(
    () => extratoCreditos(comprasCredito, renovacoes, vendasRevenda),
    [comprasCredito, renovacoes, vendasRevenda],
  )
  const [formAberto, setFormAberto] = useState(false)
  const [rascunho, setRascunho] = useState(novaCompra)
  const [erro, setErro] = useState('')

  const nomeDoCliente = useMemo(() => {
    const mapa = new Map(clientes.map((c) => [c.id, c.nome]))
    return (id) => mapa.get(id) || 'cliente removido'
  }, [clientes])

  const nomeDoRevendedor = useMemo(() => {
    const mapa = new Map((revendedores || []).map((r) => [r.id, r.nome]))
    return (id) => mapa.get(id) || 'revendedor removido'
  }, [revendedores])

  const saldoBaixo = saldo <= SALDO_BAIXO

  function def(chave) {
    return (e) => setRascunho((r) => ({ ...r, [chave]: e.target.value }))
  }

  function abrirForm() {
    setRascunho(novaCompra())
    setErro('')
    setFormAberto(true)
  }

  async function confirmarCompra(e) {
    e.preventDefault()
    const quantidade = Number(rascunho.quantidade)
    const custoTotal = Number(rascunho.custoTotal)

    if (!quantidade || quantidade <= 0) {
      setErro('Informe uma quantidade de créditos maior que zero.')
      return
    }
    if (!custoTotal || custoTotal <= 0) {
      setErro('Informe o custo total da compra.')
      return
    }

    await aoRegistrarCompra({ ...rascunho, quantidade, custoTotal })
    setFormAberto(false)
  }

  const custoPorCreditoPreview =
    Number(rascunho.quantidade) > 0 ? Number(rascunho.custoTotal) / Number(rascunho.quantidade) : 0

  return (
    <>
      <header className="surge">
        <h1 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] pc:text-[46px]">
          <span className="block text-tinta">O estoque.</span>
          <span className="block text-eletrico">Sempre à vista.</span>
        </h1>
        <p className="mt-3.5 max-w-[38ch] text-[15px] leading-relaxed text-nevoa">
          Quanto crédito ainda resta no painel master antes de ativar o próximo cliente.
        </p>
      </header>

      <section className="superficie surge-2 mt-6 px-5 py-5">
        <p className="text-[12px] uppercase tracking-wide text-nevoa">Saldo atual</p>
        <p
          className={`mt-1 font-display text-[42px] font-bold leading-none ${
            saldoBaixo ? 'text-coral' : 'text-tinta'
          }`}
        >
          {saldo}
        </p>
        {saldoBaixo && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-coral">
            <IconeAlerta tamanho={14} />
            Saldo baixo — hora de comprar mais créditos.
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-[13px] text-nevoa">
          <IconeCreditos tamanho={16} className="text-eletrico" />
          Custo médio por crédito:{' '}
          <span className="font-medium text-tinta">{formatarMoeda(custoMedio)}</span>
        </div>
      </section>

      <div className="surge-2 mt-5">
        <button
          type="button"
          onClick={abrirForm}
          className="pilula flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full font-display text-[15px] font-semibold"
        >
          <IconeMais tamanho={18} />
          Registrar compra
        </button>
      </div>

      <section className="superficie surge-3 mt-6 overflow-hidden">
        <div className="px-5 pb-3 pt-4">
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-nevoa">
            Extrato
          </p>
        </div>
        {extrato.length === 0 ? (
          <p className="px-5 pb-5 text-[13.5px] text-nevoa">
            Nenhuma movimentação ainda. Registre a primeira compra de créditos.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {extrato.map((item) => (
              <li key={item.id} className="flex items-center gap-3.5 px-5 py-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    item.tipo === 'entrada' ? 'bg-menta/15 text-menta' : 'bg-white/[0.06] text-nevoa'
                  }`}
                >
                  {item.tipo === 'entrada' ? <IconeMais tamanho={16} /> : <IconeTroca tamanho={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-tinta">
                    {item.tipo === 'entrada'
                      ? item.painel
                        ? `Compra · ${item.painel}`
                        : 'Compra de créditos'
                      : item.tipo === 'revenda'
                        ? `Venda · ${nomeDoRevendedor(item.revendedorId)}`
                        : `Renovação · ${nomeDoCliente(item.clienteId)}`}
                  </p>
                  <p className="mt-0.5 text-[12px] text-nevoa">
                    {formatarData(item.data)}
                    {item.tipo === 'entrada' && ` · ${formatarMoeda(item.custoTotal)}`}
                    {item.tipo === 'revenda' && ` · ${formatarMoeda(item.valor)}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-display text-[15px] font-semibold ${
                    item.tipo === 'entrada' ? 'text-menta' : 'text-nevoa'
                  }`}
                >
                  {item.tipo === 'entrada' ? '+' : '−'}
                  {item.tipo === 'entrada'
                    ? item.quantidade
                    : item.tipo === 'revenda'
                      ? item.quantidade
                      : item.creditos}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {formAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pc:items-center">
          <form
            onSubmit={confirmarCompra}
            className="surge w-full rounded-t-3xl bg-noite p-5 pc:max-w-sm pc:rounded-3xl pc:border pc:border-white/[0.08]"
            style={{ background: 'linear-gradient(180deg, #0d1326 0%, #0b1020 55%)' }}
          >
            <div className="mb-4 flex items-center">
              <h2 className="font-display text-[16px] font-semibold text-tinta">Registrar compra</h2>
              <button
                type="button"
                onClick={() => setFormAberto(false)}
                aria-label="Fechar"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-nevoa transition hover:bg-white/[0.06] hover:text-tinta"
              >
                <IconeX tamanho={16} />
              </button>
            </div>

            <div className="space-y-3.5">
              <label className="block">
                <span className={rotulo}>Painel / servidor de origem</span>
                <input
                  className={campo}
                  value={rascunho.painel}
                  onChange={def('painel')}
                  placeholder="Ex.: Painel XPTO"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={rotulo}>Quantidade</span>
                  <input
                    type="number"
                    min="1"
                    className={campo}
                    value={rascunho.quantidade}
                    onChange={def('quantidade')}
                    placeholder="50"
                  />
                </label>
                <label className="block">
                  <span className={rotulo}>Custo total</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={campo}
                    value={rascunho.custoTotal}
                    onChange={def('custoTotal')}
                    placeholder="150,00"
                  />
                </label>
              </div>

              <label className="block">
                <span className={rotulo}>Data</span>
                <input type="date" className={campo} value={rascunho.data} onChange={def('data')} />
              </label>

              {custoPorCreditoPreview > 0 && (
                <p className="text-[12.5px] text-nevoa">
                  Sai por <span className="font-medium text-tinta">{formatarMoeda(custoPorCreditoPreview)}</span>{' '}
                  o crédito.
                </p>
              )}

              {erro && (
                <p className="flex items-center gap-2 text-[13px] text-coral">
                  <IconeAlerta tamanho={16} />
                  {erro}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="pilula mt-5 flex min-h-[52px] w-full items-center justify-center rounded-full font-display text-[15px] font-semibold"
            >
              Registrar compra
            </button>
          </form>
        </div>
      )}
    </>
  )
}
