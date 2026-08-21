import { useEffect, useMemo, useState } from 'react'
import {
  calcularSaldoCreditos,
  calcularSaldoRevendedor,
  calcularTotalCompradoRevendedor,
  formatarData,
  formatarMoeda,
  hojeISO,
  vendasDoRevendedor,
} from '../dados.js'
import {
  IconeAlerta,
  IconeCheck,
  IconeCreditos,
  IconeLixeira,
  IconeTroca,
  IconeVoltar,
} from '../icones.jsx'

const campo =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-3 text-[15px] text-tinta placeholder-nevoa/50 outline-none transition focus:border-eletrico/60 focus:bg-white/[0.06]'

const rotulo = 'mb-1.5 block text-[13px] font-medium text-nevoa'

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className={rotulo}>{label}</span>
      {children}
    </label>
  )
}

export default function FichaRevendedor({
  revendedor,
  comprasCredito,
  renovacoes,
  vendasRevenda,
  aoSalvar,
  aoFechar,
  aoApagar,
  aoVender,
  aoMarcarPago,
}) {
  const editando = Boolean(revendedor.id)
  const [rascunho, setRascunho] = useState(revendedor)
  const [confirmarApagar, setConfirmarApagar] = useState(false)
  const [erro, setErro] = useState('')

  const [mostrarVenda, setMostrarVenda] = useState(false)
  const [vendaQuantidade, setVendaQuantidade] = useState('')
  const [vendaValor, setVendaValor] = useState('')
  const [vendaValorEditado, setVendaValorEditado] = useState(false)
  const [vendaData, setVendaData] = useState(hojeISO())
  const [vendaPago, setVendaPago] = useState(false)
  const [aviso, setAviso] = useState('')

  const saldoEstoque = useMemo(
    () => calcularSaldoCreditos(comprasCredito, renovacoes, vendasRevenda),
    [comprasCredito, renovacoes, vendasRevenda],
  )
  const saldoRevendedor = editando ? calcularSaldoRevendedor(revendedor.id, vendasRevenda) : 0
  const totalComprado = editando ? calcularTotalCompradoRevendedor(revendedor.id, vendasRevenda) : 0
  const historico = editando ? vendasDoRevendedor(revendedor.id, vendasRevenda) : []

  const def = (chave) => (e) => setRascunho((r) => ({ ...r, [chave]: e.target.value }))

  // Sugere o valor da venda pelo preço por crédito do revendedor, até ele mexer na mão.
  useEffect(() => {
    if (vendaValorEditado) return
    const preco = Number(rascunho.precoPorCredito) || 0
    const qtd = Number(vendaQuantidade) || 0
    setVendaValor(qtd > 0 && preco > 0 ? String(Math.round(qtd * preco * 100) / 100) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendaQuantidade, rascunho.precoPorCredito])

  const podeSalvar = useMemo(() => rascunho.nome.trim().length > 0, [rascunho.nome])

  function salvar(e) {
    e.preventDefault()
    if (!podeSalvar) {
      setErro('Falta o nome do revendedor.')
      return
    }
    aoSalvar({ ...rascunho, precoPorCredito: Number(rascunho.precoPorCredito) || 0 })
  }

  async function confirmarVenda() {
    const quantidade = Number(vendaQuantidade)
    if (!quantidade || quantidade <= 0) {
      setErro('Informe uma quantidade de créditos maior que zero.')
      return
    }
    setErro('')

    await aoVender(rascunho, {
      quantidade,
      valor: Number(vendaValor) || 0,
      data: vendaData,
      pago: vendaPago,
    })

    setMostrarVenda(false)
    setVendaQuantidade('')
    setVendaValorEditado(false)
    setVendaData(hojeISO())
    setVendaPago(false)
    setAviso(
      `Vendeu ${quantidade} crédito${quantidade === 1 ? '' : 's'} por ${formatarMoeda(Number(vendaValor) || 0)}.`,
    )
  }

  function alternarPago(venda) {
    aoMarcarPago(venda.id, !venda.pago)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={salvar}
        className="surge flex h-full w-full flex-col bg-noite pc:my-6 pc:h-[calc(100%-3rem)] pc:max-w-lg pc:rounded-3xl pc:border pc:border-white/[0.08]"
        style={{ background: 'linear-gradient(180deg, #0d1326 0%, #0b1020 55%)' }}
      >
        {/* Cabeçalho */}
        <div className="vidro flex items-center gap-2 border-b border-white/[0.07] px-4 py-3.5 pc:rounded-t-3xl">
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Voltar sem salvar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-nevoa transition hover:bg-white/[0.06] hover:text-tinta"
          >
            <IconeVoltar tamanho={20} />
          </button>
          <h2 className="font-display text-[16px] font-semibold text-tinta">
            {editando ? 'Editar revendedor' : 'Novo revendedor'}
          </h2>

          {editando && (
            <button
              type="button"
              onClick={() => setConfirmarApagar(true)}
              aria-label="Apagar revendedor"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-coral/80 transition hover:bg-coral/10 hover:text-coral"
            >
              <IconeLixeira tamanho={19} />
            </button>
          )}
        </div>

        {/* Corpo */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <Campo label="Nome">
            <input
              className={campo}
              value={rascunho.nome}
              onChange={def('nome')}
              placeholder="Ex.: Painel do João"
              autoFocus
            />
          </Campo>

          <Campo label="WhatsApp">
            <input
              className={campo}
              value={rascunho.whatsapp}
              onChange={def('whatsapp')}
              placeholder="(11) 91234-5678"
              inputMode="tel"
            />
          </Campo>

          <Campo label="Preço por crédito (dele)">
            <input
              type="number"
              step="0.01"
              min="0"
              className={campo}
              value={rascunho.precoPorCredito}
              onChange={def('precoPorCredito')}
              placeholder="8,00"
            />
          </Campo>

          <Campo label="Observações">
            <textarea
              className={`${campo} min-h-[76px] resize-none`}
              value={rascunho.observacoes}
              onChange={def('observacoes')}
              placeholder="Combinados, forma de pagamento preferida..."
            />
          </Campo>

          {editando && (
            <>
              <div className="h-px bg-white/[0.07]" />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-nevoa">Saldo dele</p>
                  <p className="mt-1 font-display text-[20px] font-bold text-tinta">{saldoRevendedor}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-nevoa">Já comprou</p>
                  <p className="mt-1 font-display text-[20px] font-bold text-tinta">
                    {formatarMoeda(totalComprado)}
                  </p>
                </div>
              </div>

              <div>
                <span className={rotulo}>Vender créditos</span>

                {aviso && (
                  <p className="mb-3 flex items-center gap-2 rounded-xl border border-menta/25 bg-menta/10 px-3.5 py-2.5 text-[13px] text-menta">
                    <IconeCheck tamanho={15} />
                    {aviso}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarVenda((v) => !v)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-eletrico/30 bg-eletrico/10 px-3.5 py-3 text-left transition hover:bg-eletrico/15"
                >
                  <IconeTroca tamanho={16} className="text-eletrico" />
                  <span className="text-[13.5px] font-semibold text-eletrico">Registrar venda de crédito</span>
                </button>

                {mostrarVenda && (
                  <div className="mt-2.5 space-y-2.5 rounded-xl border border-eletrico/20 bg-eletrico/[0.06] p-3.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <label>
                        <span className="mb-1 block text-[11.5px] text-nevoa">Quantidade</span>
                        <input
                          type="number"
                          min="1"
                          className={`${campo} py-2 text-[13px]`}
                          value={vendaQuantidade}
                          onChange={(e) => setVendaQuantidade(e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-1 block text-[11.5px] text-nevoa">Valor cobrado</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`${campo} py-2 text-[13px]`}
                          value={vendaValor}
                          onChange={(e) => {
                            setVendaValorEditado(true)
                            setVendaValor(e.target.value)
                          }}
                        />
                      </label>
                    </div>

                    <label>
                      <span className="mb-1 block text-[11.5px] text-nevoa">Data</span>
                      <input
                        type="date"
                        className={`${campo} py-2 text-[13px]`}
                        value={vendaData}
                        onChange={(e) => setVendaData(e.target.value)}
                      />
                    </label>

                    <label className="flex items-center gap-2.5 text-[13px] text-nevoa">
                      <input
                        type="checkbox"
                        checked={vendaPago}
                        onChange={(e) => setVendaPago(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-eletrico"
                      />
                      Já recebi o pagamento
                    </label>

                    <p className="text-[12px] text-nevoa">
                      Saldo atual no seu estoque: <span className="font-medium text-tinta">{saldoEstoque}</span>
                    </p>

                    {erro && (
                      <p className="flex items-center gap-2 text-[13px] text-coral">
                        <IconeAlerta tamanho={16} />
                        {erro}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={confirmarVenda}
                      className="w-full rounded-full bg-eletrico/20 py-2 text-[13px] font-semibold text-eletrico transition hover:bg-eletrico/30"
                    >
                      Confirmar venda
                    </button>
                  </div>
                )}
              </div>

              {historico.length > 0 && (
                <div>
                  <span className={rotulo}>Histórico</span>
                  <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07]">
                    {historico.map((venda) => (
                      <li key={venda.id} className="flex items-center gap-3 px-3.5 py-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            venda.pago ? 'bg-menta/15 text-menta' : 'bg-ambar/15 text-ambar'
                          }`}
                        >
                          <IconeCreditos tamanho={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] text-tinta">
                            {venda.quantidade} crédito{venda.quantidade === 1 ? '' : 's'} ·{' '}
                            {formatarMoeda(venda.valor)}
                          </p>
                          <p className="text-[11.5px] text-nevoa">{formatarData(venda.data)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => alternarPago(venda)}
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                            venda.pago
                              ? 'bg-menta/15 text-menta hover:bg-menta/25'
                              : 'bg-ambar/15 text-ambar hover:bg-ambar/25'
                          }`}
                        >
                          {venda.pago ? 'paga' : 'em aberto'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/[0.07] px-4 py-4 pc:rounded-b-3xl">
          {erro && !mostrarVenda && (
            <p className="mb-3 flex items-center gap-2 text-[13px] text-coral">
              <IconeAlerta tamanho={16} />
              {erro}
            </p>
          )}
          <button
            type="submit"
            className="pilula flex min-h-[52px] w-full items-center justify-center rounded-full font-display text-[15px] font-semibold"
          >
            {editando ? 'Salvar alterações' : 'Adicionar revendedor'}
          </button>
        </div>
      </form>

      {/* Confirmar apagar */}
      {confirmarApagar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="superficie surge w-full max-w-sm p-5 text-center">
            <IconeAlerta tamanho={28} className="mx-auto text-coral" />
            <p className="mt-3 font-display text-[16px] font-semibold text-tinta">
              Apagar {rascunho.nome || 'este revendedor'}?
            </p>
            <p className="mt-1.5 text-[13.5px] text-nevoa">
              O cadastro e o histórico de vendas dele somem — essa ação não tem volta.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmarApagar(false)}
                className="flex-1 rounded-full border border-white/[0.1] py-2.5 text-[14px] font-medium text-nevoa hover:text-tinta"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => aoApagar(rascunho.id)}
                className="flex-1 rounded-full bg-coral/90 py-2.5 text-[14px] font-semibold text-white hover:bg-coral"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
