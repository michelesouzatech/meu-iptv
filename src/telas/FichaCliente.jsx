import { useEffect, useMemo, useState } from 'react'
import {
  PERFIS,
  PLANOS,
  FORMAS_PAGAMENTO,
  calcularSaldoCreditos,
  calcularValorAtacado,
  CREDITOS_SUGERIDOS_POR_RENOVACAO,
  dataISODaquiA,
  adicionarDias,
  formatarData,
  formatarMoeda,
  historicoDoCliente,
  hojeISO,
} from '../dados.js'
import {
  IconeVoltar,
  IconeLixeira,
  IconeOlho,
  IconeOlhoFechado,
  IconeAlerta,
  IconeTroca,
  IconeCreditos,
  IconeCheck,
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

export default function FichaCliente({
  cliente,
  renovacoes,
  pagamentos,
  comprasCredito,
  vendasRevenda,
  tabelaAtacado,
  aoSalvar,
  aoFechar,
  aoApagar,
  aoRenovar,
  aoRegistrarPagamento,
  aoSalvarTabela,
}) {
  const editando = Boolean(cliente.id)
  const [rascunho, setRascunho] = useState(cliente)
  const [vencimentoManual, setVencimentoManual] = useState(editando)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarTabela, setMostrarTabela] = useState(false)
  const [tabelaAtacadoRascunho, setTabelaAtacadoRascunho] = useState(tabelaAtacado)
  const [confirmarApagar, setConfirmarApagar] = useState(false)
  const [erro, setErro] = useState('')

  const [mostrarPagamento, setMostrarPagamento] = useState(false)
  const [pagamentoValor, setPagamentoValor] = useState(cliente.valor)
  const [pagamentoForma, setPagamentoForma] = useState('pix')
  const [pagamentoData, setPagamentoData] = useState(hojeISO())
  const [aviso, setAviso] = useState('')
  const historico = useMemo(
    () => (editando ? historicoDoCliente(cliente.id, renovacoes, pagamentos) : []),
    [editando, cliente.id, renovacoes, pagamentos],
  )

  const [mostrarRenovacao, setMostrarRenovacao] = useState(false)
  const [creditosRenovacao, setCreditosRenovacao] = useState(CREDITOS_SUGERIDOS_POR_RENOVACAO)
  const saldoCreditos = useMemo(
    () => calcularSaldoCreditos(comprasCredito, renovacoes, vendasRevenda),
    [comprasCredito, renovacoes, vendasRevenda],
  )

  const def = (chave) => (e) => setRascunho((r) => ({ ...r, [chave]: e.target.value }))

  // Enquanto estou cadastrando um cliente novo, trocar o plano sugere a data de vencimento.
  useEffect(() => {
    if (editando || vencimentoManual) return
    setRascunho((r) => ({ ...r, vencimento: dataISODaquiA(PLANOS[r.plano].dias) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rascunho.plano])

  // No Atacado, o valor sai sozinho da tabela de desconto por telas.
  useEffect(() => {
    if (rascunho.perfil !== 'atacado') return
    setRascunho((r) => ({ ...r, valor: calcularValorAtacado(r.telas, tabelaAtacadoRascunho) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rascunho.perfil, rascunho.telas, tabelaAtacadoRascunho])

  useEffect(() => {
    if (rascunho.perfil === 'cortesia') setRascunho((r) => ({ ...r, valor: 0 }))
  }, [rascunho.perfil])

  const ehAtacado = rascunho.perfil === 'atacado'
  const ehFamilia = rascunho.perfil === 'familia'
  const ehCortesia = rascunho.perfil === 'cortesia'

  const tituloBotaoSalvar = editando ? 'Salvar alterações' : 'Adicionar cliente'

  const podeSalvar = useMemo(() => rascunho.nome.trim().length > 0, [rascunho.nome])

  function salvar(e) {
    e.preventDefault()
    if (!podeSalvar) {
      setErro('Falta o nome do cliente.')
      return
    }
    aoSalvar({
      ...rascunho,
      telas: Number(rascunho.telas) || 1,
      valor: Number(rascunho.valor) || 0,
      debitoAcumulado: Number(rascunho.debitoAcumulado) || 0,
    })
  }

  async function salvarTabela() {
    await aoSalvarTabela(tabelaAtacadoRascunho)
    setMostrarTabela(false)
  }

  const previaRenovacao = adicionarDias(rascunho.vencimento, PLANOS[rascunho.plano].dias)

  async function renovarAgora() {
    const creditos = Number(creditosRenovacao) || 0
    const atualizado = await aoRenovar(rascunho, creditos)
    setRascunho((r) => ({
      ...r,
      vencimento: atualizado.vencimento,
      debitoAcumulado: atualizado.debitoAcumulado,
    }))
    setMostrarRenovacao(false)
    setAviso(
      `Renovado até ${formatarData(atualizado.vencimento)}${
        creditos ? ` · ${creditos} crédito${creditos === 1 ? '' : 's'} consumido${creditos === 1 ? '' : 's'}` : ''
      }.`,
    )
  }

  async function confirmarPagamento() {
    const atualizado = await aoRegistrarPagamento(rascunho, {
      valor: pagamentoValor,
      forma: pagamentoForma,
      data: pagamentoData,
    })
    setRascunho((r) => ({ ...r, debitoAcumulado: atualizado.debitoAcumulado }))
    setMostrarPagamento(false)
    setAviso(`Pagamento de ${formatarMoeda(pagamentoValor)} registrado.`)
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
            {editando ? 'Editar cliente' : 'Novo cliente'}
          </h2>

          {editando && (
            <button
              type="button"
              onClick={() => setConfirmarApagar(true)}
              aria-label="Apagar cliente"
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
              placeholder="Ex.: Marcos Silva"
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

          <div className="grid grid-cols-2 gap-3">
            <Campo label="App usado">
              <input
                className={campo}
                value={rascunho.appUsado}
                onChange={def('appUsado')}
                placeholder="Bob Player"
                list="apps-conhecidos"
              />
              <datalist id="apps-conhecidos">
                <option value="Bob Player" />
                <option value="XCIPTV" />
                <option value="IPTV Smarters" />
                <option value="Duplex Play" />
              </datalist>
            </Campo>
            <Campo label="MAC / Device ID">
              <input
                className={`${campo} font-mono text-[13px]`}
                value={rascunho.macId}
                onChange={def('macId')}
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Usuário da lista">
              <input className={campo} value={rascunho.usuario} onChange={def('usuario')} />
            </Campo>
            <Campo label="Senha da lista">
              <div className="relative">
                <input
                  className={`${campo} pr-11`}
                  type={mostrarSenha ? 'text' : 'password'}
                  value={rascunho.senha}
                  onChange={def('senha')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-1 flex w-9 items-center justify-center text-nevoa hover:text-tinta"
                >
                  {mostrarSenha ? <IconeOlhoFechado tamanho={18} /> : <IconeOlho tamanho={18} />}
                </button>
              </div>
            </Campo>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <Campo label="Perfil de cobrança">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PERFIS).map((p) => {
                const on = rascunho.perfil === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRascunho((r) => ({ ...r, perfil: p.id }))}
                    className={`rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-medium transition ${
                      on
                        ? 'border-eletrico/50 bg-eletrico/15 text-eletrico'
                        : 'border-white/[0.08] bg-white/[0.03] text-nevoa hover:text-tinta'
                    }`}
                  >
                    {p.nome}
                  </button>
                )
              })}
            </div>
          </Campo>

          {ehAtacado && (
            <div className="rounded-xl border border-eletrico/20 bg-eletrico/[0.06] px-3.5 py-3 text-[12.5px] text-nevoa">
              Valor calculado pela tabela de atacado.{' '}
              <button
                type="button"
                onClick={() => setMostrarTabela((v) => !v)}
                className="font-medium text-eletrico underline-offset-2 hover:underline"
              >
                {mostrarTabela ? 'fechar tabela' : 'editar tabela'}
              </button>
              {mostrarTabela && (
                <div className="mt-3 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-[12px]">
                    <label>
                      1 tela
                      <input
                        type="number"
                        className={`${campo} mt-1 py-2 text-[13px]`}
                        value={tabelaAtacadoRascunho.precoTela1}
                        onChange={(e) =>
                          setTabelaAtacadoRascunho((t) => ({ ...t, precoTela1: Number(e.target.value) }))
                        }
                      />
                    </label>
                    <label>
                      2 telas
                      <input
                        type="number"
                        className={`${campo} mt-1 py-2 text-[13px]`}
                        value={tabelaAtacadoRascunho.precoTela2}
                        onChange={(e) =>
                          setTabelaAtacadoRascunho((t) => ({ ...t, precoTela2: Number(e.target.value) }))
                        }
                      />
                    </label>
                    <label>
                      3+ (cada)
                      <input
                        type="number"
                        className={`${campo} mt-1 py-2 text-[13px]`}
                        value={tabelaAtacadoRascunho.precoTelaExtra}
                        onChange={(e) =>
                          setTabelaAtacadoRascunho((t) => ({
                            ...t,
                            precoTelaExtra: Number(e.target.value),
                          }))
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={salvarTabela}
                    className="rounded-full bg-eletrico/20 px-3.5 py-1.5 text-[12.5px] font-semibold text-eletrico hover:bg-eletrico/30"
                  >
                    Salvar tabela
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Campo label="Plano">
              <select className={campo} value={rascunho.plano} onChange={def('plano')}>
                {Object.values(PLANOS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Telas">
              <input
                type="number"
                min="1"
                className={campo}
                value={rascunho.telas}
                onChange={def('telas')}
              />
            </Campo>
            <Campo label="Valor">
              <input
                type="number"
                step="0.01"
                disabled={ehAtacado || ehCortesia}
                className={`${campo} ${ehAtacado || ehCortesia ? 'opacity-60' : ''}`}
                value={rascunho.valor}
                onChange={def('valor')}
              />
            </Campo>
          </div>

          <Campo label="Data de vencimento">
            <input
              type="date"
              className={campo}
              value={rascunho.vencimento}
              onChange={(e) => {
                setVencimentoManual(true)
                def('vencimento')(e)
              }}
            />
          </Campo>

          {ehFamilia && (
            <Campo label="Débito acumulado até agora">
              <input
                type="number"
                step="0.01"
                className={campo}
                value={rascunho.debitoAcumulado}
                onChange={def('debitoAcumulado')}
              />
            </Campo>
          )}

          <Campo label="Observações">
            <textarea
              className={`${campo} min-h-[76px] resize-none`}
              value={rascunho.observacoes}
              onChange={def('observacoes')}
              placeholder="Combinados, preferências, o que for útil lembrar"
            />
          </Campo>

          {editando && (
            <>
              <div className="h-px bg-white/[0.07]" />

              <div>
                <span className={rotulo}>Renovar e receber</span>

                {aviso && (
                  <p className="mb-3 flex items-center gap-2 rounded-xl border border-menta/25 bg-menta/10 px-3.5 py-2.5 text-[13px] text-menta">
                    <IconeCheck tamanho={15} />
                    {aviso}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarPagamento(false)
                      setMostrarRenovacao((v) => !v)
                    }}
                    className="rounded-xl border border-eletrico/30 bg-eletrico/10 px-3.5 py-3 text-left transition hover:bg-eletrico/15"
                  >
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold text-eletrico">
                      <IconeTroca tamanho={16} />
                      Renovar
                    </span>
                    <span className="mt-1 block text-[12px] text-nevoa">
                      até {formatarData(previaRenovacao)}
                    </span>
                  </button>

                  {!ehCortesia && (
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarRenovacao(false)
                        setMostrarPagamento((v) => !v)
                      }}
                      className="rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <span className="flex items-center gap-2 text-[13.5px] font-semibold text-tinta">
                        <IconeCreditos tamanho={16} />
                        Registrar pagamento
                      </span>
                      <span className="mt-1 block text-[12px] text-nevoa">
                        avulso, não muda o vencimento
                      </span>
                    </button>
                  )}
                </div>

                {mostrarRenovacao && (
                  <div className="mt-2.5 space-y-2.5 rounded-xl border border-eletrico/20 bg-eletrico/[0.06] p-3.5">
                    <label>
                      <span className="mb-1 block text-[11.5px] text-nevoa">
                        Créditos consumidos nesta renovação
                      </span>
                      <input
                        type="number"
                        min="0"
                        className={`${campo} py-2 text-[13px]`}
                        value={creditosRenovacao}
                        onChange={(e) => setCreditosRenovacao(e.target.value)}
                      />
                    </label>
                    <p className="text-[12px] text-nevoa">
                      Saldo atual no estoque: <span className="font-medium text-tinta">{saldoCreditos}</span>
                    </p>
                    <button
                      type="button"
                      onClick={renovarAgora}
                      className="w-full rounded-full bg-eletrico/20 py-2 text-[13px] font-semibold text-eletrico transition hover:bg-eletrico/30"
                    >
                      Confirmar renovação
                    </button>
                  </div>
                )}

                {mostrarPagamento && (
                  <div className="mt-2.5 space-y-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <div className="grid grid-cols-3 gap-2">
                      <label>
                        <span className="mb-1 block text-[11.5px] text-nevoa">Valor</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`${campo} py-2 text-[13px]`}
                          value={pagamentoValor}
                          onChange={(e) => setPagamentoValor(e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-1 block text-[11.5px] text-nevoa">Forma</span>
                        <select
                          className={`${campo} py-2 text-[13px]`}
                          value={pagamentoForma}
                          onChange={(e) => setPagamentoForma(e.target.value)}
                        >
                          {Object.values(FORMAS_PAGAMENTO).map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nome}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="mb-1 block text-[11.5px] text-nevoa">Data</span>
                        <input
                          type="date"
                          className={`${campo} py-2 text-[13px]`}
                          value={pagamentoData}
                          onChange={(e) => setPagamentoData(e.target.value)}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={confirmarPagamento}
                      className="w-full rounded-full bg-menta/20 py-2 text-[13px] font-semibold text-menta transition hover:bg-menta/30"
                    >
                      Confirmar pagamento
                    </button>
                  </div>
                )}
              </div>

              {historico.length > 0 && (
                <div>
                  <span className={rotulo}>Histórico</span>
                  <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07]">
                    {historico.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-3.5 py-2.5">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            item.tipo === 'pagamento' ? 'bg-menta' : 'bg-eletrico'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] text-tinta">
                            {item.tipo === 'pagamento'
                              ? `Pagamento via ${FORMAS_PAGAMENTO[item.forma]?.nome || item.forma}`
                              : `Renovou até ${formatarData(item.ate)}${
                                  item.creditos
                                    ? ` · ${item.creditos} crédito${item.creditos === 1 ? '' : 's'}`
                                    : ''
                                }`}
                          </p>
                          <p className="text-[11.5px] text-nevoa">{formatarData(item.data)}</p>
                        </div>
                        <span className="shrink-0 text-[13px] font-medium text-nevoa">
                          {formatarMoeda(item.valor)}
                        </span>
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
          {erro && (
            <p className="mb-3 flex items-center gap-2 text-[13px] text-coral">
              <IconeAlerta tamanho={16} />
              {erro}
            </p>
          )}
          <button
            type="submit"
            className="pilula flex min-h-[52px] w-full items-center justify-center rounded-full font-display text-[15px] font-semibold"
          >
            {tituloBotaoSalvar}
          </button>
        </div>
      </form>

      {/* Confirmar apagar */}
      {confirmarApagar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="superficie surge w-full max-w-sm p-5 text-center">
            <IconeAlerta tamanho={28} className="mx-auto text-coral" />
            <p className="mt-3 font-display text-[16px] font-semibold text-tinta">
              Apagar {rascunho.nome || 'este cliente'}?
            </p>
            <p className="mt-1.5 text-[13.5px] text-nevoa">
              O cadastro e o histórico dele somem — essa ação não tem volta.
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
