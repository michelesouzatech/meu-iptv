import { useMemo } from 'react'
import {
  calcularSaldoRevendedor,
  calcularTotalCompradoRevendedor,
  formatarMoeda,
  temVendaEmAberto,
} from '../dados.js'
import { IconeAlerta, IconeMais, IconeRevenda } from '../icones.jsx'

export default function Revendedores({ revendedores, vendasRevenda, aoAbrirFicha }) {
  const lista = useMemo(
    () => [...revendedores].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [revendedores],
  )

  return (
    <>
      <header className="surge">
        <h1 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] pc:text-[46px]">
          <span className="block text-tinta">Sua rede.</span>
          <span className="block text-eletrico">Com saldo certo.</span>
        </h1>
        <p className="mt-3.5 max-w-[38ch] text-[15px] leading-relaxed text-nevoa">
          {revendedores.length === 0
            ? 'Nenhum revendedor cadastrado ainda.'
            : `${revendedores.length} revendedor${revendedores.length === 1 ? '' : 'es'} cadastrado${
                revendedores.length === 1 ? '' : 's'
              }.`}
        </p>
      </header>

      <section className="superficie surge-2 mt-6 overflow-hidden">
        {lista.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <IconeRevenda tamanho={30} className="mx-auto text-nevoa/50" />
            <p className="mt-3 text-[14.5px] text-nevoa">
              Cadastre o primeiro sub-revendedor pra começar a vender crédito pra ele.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {lista.map((revendedor) => {
              const saldo = calcularSaldoRevendedor(revendedor.id, vendasRevenda)
              const total = calcularTotalCompradoRevendedor(revendedor.id, vendasRevenda)
              const emAberto = temVendaEmAberto(revendedor.id, vendasRevenda)
              return (
                <li key={revendedor.id}>
                  <button
                    type="button"
                    onClick={() => aoAbrirFicha(revendedor)}
                    className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-tinta">{revendedor.nome}</p>
                      <p className="mt-0.5 truncate text-[12.5px] text-nevoa">
                        {saldo} crédito{saldo === 1 ? '' : 's'} · {formatarMoeda(total)} comprados
                      </p>
                    </div>
                    {emAberto && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-ambar/15 px-2.5 py-1 text-[11px] font-medium text-ambar">
                        <IconeAlerta tamanho={12} />
                        em aberto
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 mt-6 pc:static pc:bottom-auto">
        <button
          type="button"
          onClick={() => aoAbrirFicha(null)}
          className="pilula flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full font-display text-[15px] font-semibold"
        >
          <IconeMais tamanho={18} />
          Adicionar revendedor
        </button>
      </div>
    </>
  )
}
