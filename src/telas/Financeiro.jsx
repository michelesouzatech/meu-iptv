import { useMemo, useState } from 'react'
import {
  calcularCortesiaFamilia,
  calcularCustoMedioCredito,
  calcularFinanceiroDoMes,
  calcularInadimplencia,
  calcularPrevisao30Dias,
  formatarMes,
  formatarMoeda,
  mesAtualISO,
  adicionarMeses,
} from '../dados.js'
import { IconeAlerta, IconeCreditos, IconeFinanceiro, IconeSeta } from '../icones.jsx'

function comInicialMaiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function TrocaDeMes({ mes, aoTrocar }) {
  const ehMesAtual = mes === mesAtualISO()
  return (
    <div className="superficie surge-2 mt-6 flex items-center gap-2 px-2 py-2">
      <button
        type="button"
        onClick={() => aoTrocar(adicionarMeses(mes, -1))}
        aria-label="Mês anterior"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-nevoa transition hover:bg-white/[0.06] hover:text-tinta"
      >
        <IconeSeta tamanho={17} className="rotate-180" />
      </button>
      <p className="flex-1 truncate text-center font-display text-[14.5px] font-semibold text-tinta">
        {comInicialMaiuscula(formatarMes(mes))}
      </p>
      <button
        type="button"
        onClick={() => aoTrocar(adicionarMeses(mes, 1))}
        disabled={ehMesAtual}
        aria-label="Próximo mês"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-nevoa transition hover:bg-white/[0.06] hover:text-tinta disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <IconeSeta tamanho={17} />
      </button>
    </div>
  )
}

function Cartao({ titulo, valor, cor = 'text-tinta', sub, className = '' }) {
  return (
    <div className={`superficie px-5 py-4 ${className}`}>
      <p className="text-[12px] uppercase tracking-wide text-nevoa">{titulo}</p>
      <p className={`mt-1 font-display text-[26px] font-bold leading-none ${cor}`}>{valor}</p>
      {sub && <p className="mt-1.5 text-[12.5px] leading-relaxed text-nevoa">{sub}</p>}
    </div>
  )
}

export default function Financeiro({ clientes, pagamentos, vendasRevenda, renovacoes, comprasCredito }) {
  const [mes, setMes] = useState(mesAtualISO)

  const custoMedio = useMemo(() => calcularCustoMedioCredito(comprasCredito), [comprasCredito])
  const financeiro = useMemo(
    () => calcularFinanceiroDoMes(mes, clientes, pagamentos, vendasRevenda, renovacoes, custoMedio),
    [mes, clientes, pagamentos, vendasRevenda, renovacoes, custoMedio],
  )
  const inadimplencia = useMemo(() => calcularInadimplencia(clientes), [clientes])
  const previsao = useMemo(() => calcularPrevisao30Dias(clientes), [clientes])
  const cortesiaFamilia = useMemo(
    () => calcularCortesiaFamilia(mes, clientes, renovacoes, custoMedio),
    [mes, clientes, renovacoes, custoMedio],
  )

  const lucroPositivo = financeiro.lucro >= 0
  const taxaInadimplencia = Math.round(inadimplencia.taxa * 100)

  return (
    <>
      <header className="surge">
        <h1 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] pc:text-[46px]">
          <span className="block text-tinta">O lucro.</span>
          <span className="block text-eletrico">O de verdade.</span>
        </h1>
        <p className="mt-3.5 max-w-[38ch] text-[15px] leading-relaxed text-nevoa">
          Faturamento menos o custo dos créditos — inclusive os que a casa consome.
        </p>
      </header>

      <TrocaDeMes mes={mes} aoTrocar={setMes} />

      <section className="superficie surge-3 mt-5 px-5 py-5">
        <p className="text-[12px] uppercase tracking-wide text-nevoa">Lucro líquido real</p>
        <p
          className={`mt-1 font-display text-[42px] font-bold leading-none ${
            lucroPositivo ? 'text-menta' : 'text-coral'
          }`}
        >
          {formatarMoeda(financeiro.lucro)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4 text-[13px]">
          <span className="text-nevoa">Faturamento bruto</span>
          <span className="font-medium text-tinta">{formatarMoeda(financeiro.faturamento)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[13px]">
          <span className="text-nevoa">Custo dos créditos</span>
          <span className="font-medium text-tinta">− {formatarMoeda(financeiro.custoCreditos)}</span>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Cartao
          titulo="Faturamento"
          valor={formatarMoeda(financeiro.faturamento)}
          className="surge-3"
          sub={`${formatarMoeda(financeiro.faturamentoClientes)} clientes · ${formatarMoeda(
            financeiro.faturamentoRevenda,
          )} revenda`}
        />
        <Cartao
          titulo="Créditos consumidos"
          valor={financeiro.creditosConsumidos}
          className="surge-3"
          sub={`custo de ${formatarMoeda(financeiro.custoCreditos)} no mês`}
        />
      </div>

      <section className="superficie surge-3 mt-5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              taxaInadimplencia > 0 ? 'bg-coral/15 text-coral' : 'bg-menta/15 text-menta'
            }`}
          >
            <IconeAlerta tamanho={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] uppercase tracking-wide text-nevoa">Inadimplência comercial</p>
            <p
              className={`font-display text-[20px] font-bold leading-tight ${
                taxaInadimplencia > 0 ? 'text-coral' : 'text-menta'
              }`}
            >
              {taxaInadimplencia}%
            </p>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-nevoa">
          {inadimplencia.qtdVencidos === 0
            ? 'Nenhum cliente pagante vencido agora.'
            : `${inadimplencia.qtdVencidos} de ${inadimplencia.qtdTotal} clientes pagantes vencidos · ${formatarMoeda(
                inadimplencia.valorVencido,
              )} em atraso.`}
        </p>
      </section>

      <section className="superficie surge-3 mt-5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-eletrico/15 text-eletrico">
            <IconeFinanceiro tamanho={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] uppercase tracking-wide text-nevoa">Previsão de 30 dias</p>
            <p className="font-display text-[20px] font-bold leading-tight text-tinta">
              {formatarMoeda(previsao.valor)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-nevoa">
          {previsao.qtd === 0
            ? 'Nenhum vencimento de cliente pagante nos próximos 30 dias.'
            : `${previsao.qtd} vencimento${previsao.qtd === 1 ? '' : 's'} de cliente pagante chegando.`}
        </p>
      </section>

      <section className="superficie surge-3 mt-6 overflow-hidden">
        <div className="px-5 pb-3 pt-4">
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-nevoa">
            Cortesia & Família
          </p>
          <p className="mt-1 text-[12.5px] text-nevoa">Fora do caixa comercial — mas o custo é real.</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-t border-white/[0.06]">
          <div className="px-5 py-4">
            <p className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wide text-nevoa">
              <IconeCreditos tamanho={13} />
              Cortesia
            </p>
            <p className="mt-1 font-display text-[19px] font-bold text-tinta">
              {formatarMoeda(cortesiaFamilia.custoCortesia)}
            </p>
            <p className="mt-1 text-[12px] text-nevoa">
              {cortesiaFamilia.creditosCortesia} crédito{cortesiaFamilia.creditosCortesia === 1 ? '' : 's'} da casa
              neste mês
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[11.5px] uppercase tracking-wide text-nevoa">Família deve</p>
            <p className="mt-1 font-display text-[19px] font-bold text-ambar">
              {formatarMoeda(cortesiaFamilia.debitoFamilia)}
            </p>
            <p className="mt-1 text-[12px] text-nevoa">débito acumulado até agora</p>
          </div>
        </div>
      </section>
    </>
  )
}
