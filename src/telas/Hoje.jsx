import {
  calcularSaldoCreditos,
  formatarDataPorExtenso,
  formatarMoeda,
  linkWhatsApp,
  precisaAvisar,
  precisaCobrar,
  SALDO_BAIXO,
} from '../dados.js'
import { useMemo } from 'react'
import { IconeAlerta, IconeConversa, IconeCreditos, IconeCheck, IconeHoje } from '../icones.jsx'

function CartaoCliente({ cliente, familia }) {
  const link = linkWhatsApp(cliente)
  return (
    <li className="flex items-center gap-3.5 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-tinta">{cliente.nome}</p>
        <p className={`mt-0.5 text-[12.5px] ${familia ? 'text-ambar' : 'text-nevoa'}`}>
          {familia
            ? `${formatarDataPorExtenso(cliente.vencimento)} · débito de ${formatarMoeda(cliente.debitoAcumulado)}`
            : `${formatarMoeda(cliente.valor)} · ${formatarDataPorExtenso(cliente.vencimento)}`}
        </p>
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-eletrico/15 text-eletrico transition hover:bg-eletrico/25"
          aria-label={`Falar com ${cliente.nome} no WhatsApp`}
        >
          <IconeConversa tamanho={19} />
        </a>
      ) : (
        <span className="shrink-0 text-[11.5px] text-nevoa/60">sem WhatsApp</span>
      )}
    </li>
  )
}

function Bloco({ titulo, vazio, itens, familia }) {
  return (
    <section className="superficie surge-2 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pb-3 pt-4">
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-nevoa">
          {titulo}
        </p>
        {itens.length > 0 && (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-nevoa">
            {itens.length}
          </span>
        )}
      </div>
      {itens.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 text-[13.5px] text-nevoa">
          <IconeCheck tamanho={16} className="text-menta" />
          {vazio}
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {itens.map((c) => (
            <CartaoCliente key={c.id} cliente={c} familia={familia} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Hoje({ clientes, comprasCredito, renovacoes, vendasRevenda }) {
  const saldo = useMemo(
    () => calcularSaldoCreditos(comprasCredito, renovacoes, vendasRevenda),
    [comprasCredito, renovacoes, vendasRevenda],
  )
  const saldoBaixo = saldo <= SALDO_BAIXO

  const cobrar = clientes.filter((c) => precisaCobrar(c))
  const avisar = clientes.filter((c) => precisaAvisar(c))

  return (
    <>
      <header className="surge">
        <h1 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] pc:text-[46px]">
          <span className="block text-tinta">Bom dia.</span>
          <span className="block text-eletrico">Quem cobrar hoje?</span>
        </h1>
      </header>

      <div className="superficie surge-2 mt-6 flex items-center gap-4 px-5 py-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            saldoBaixo ? 'bg-coral/15 text-coral' : 'bg-eletrico/15 text-eletrico'
          }`}
        >
          <IconeCreditos tamanho={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] uppercase tracking-wide text-nevoa">Saldo de créditos</p>
          <p className={`font-display text-[22px] font-bold ${saldoBaixo ? 'text-coral' : 'text-tinta'}`}>
            {saldo}
          </p>
          {saldoBaixo && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-coral">
              <IconeAlerta tamanho={12} />
              Saldo baixo — hora de comprar mais créditos.
            </p>
          )}
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="superficie surge-3 mt-6 px-5 py-10 text-center">
          <IconeHoje tamanho={28} className="mx-auto text-nevoa/50" />
          <p className="mt-3 text-[14.5px] leading-relaxed text-nevoa">
            Cadastre seus clientes na aba <strong className="text-tinta">Clientes</strong> — assim
            que tiverem vencimento chegando, eles aparecem aqui sozinhos.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <Bloco
            titulo="Cobrar hoje"
            vazio="Ninguém pra cobrar agora — respira 🎉"
            itens={cobrar}
          />
          <Bloco
            titulo="Avisar sem bloquear"
            vazio="Nenhum aviso de família pendente."
            itens={avisar}
            familia
          />
        </div>
      )}
    </>
  )
}
