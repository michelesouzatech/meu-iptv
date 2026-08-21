import { useMemo, useState } from 'react'
import { PERFIS, STATUS, calcularStatus, formatarData, formatarMoeda } from '../dados.js'
import { IconeBusca, IconeX, IconeMais, IconeClientes } from '../icones.jsx'

const ORDEM_STATUS = { vencido: 0, debito: 1, a_vencer: 2, ativo: 3, cortesia: 4 }

const coresPonto = { menta: 'bg-menta', ambar: 'bg-ambar', coral: 'bg-coral', nevoa: 'bg-nevoa' }
const coresTexto = { menta: 'text-menta', ambar: 'text-ambar', coral: 'text-coral', nevoa: 'text-nevoa' }

export default function Clientes({ clientes, aoAbrirFicha }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return clientes
      .filter((c) => !termo || c.nome.toLowerCase().includes(termo))
      .filter((c) => filtro === 'todos' || calcularStatus(c).id === filtro)
      .sort((a, b) => {
        const sa = calcularStatus(a)
        const sb = calcularStatus(b)
        if (ORDEM_STATUS[sa.id] !== ORDEM_STATUS[sb.id]) {
          return ORDEM_STATUS[sa.id] - ORDEM_STATUS[sb.id]
        }
        return a.vencimento.localeCompare(b.vencimento)
      })
  }, [clientes, busca, filtro])

  const filtros = [{ id: 'todos', nome: 'Todos' }, ...Object.values(STATUS)]

  return (
    <>
      <header className="surge">
        <h1 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] pc:text-[46px]">
          <span className="block text-tinta">Todo mundo.</span>
          <span className="block text-eletrico">Num lugar só.</span>
        </h1>
        <p className="mt-3.5 max-w-[38ch] text-[15px] leading-relaxed text-nevoa">
          {clientes.length === 0
            ? 'Nenhum cliente cadastrado ainda.'
            : `${clientes.length} cliente${clientes.length === 1 ? '' : 's'} cadastrado${clientes.length === 1 ? '' : 's'}.`}
        </p>
      </header>

      <div className="surge-2 mt-6">
        <div className="relative">
          <IconeBusca
            tamanho={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-nevoa"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full rounded-full border border-white/[0.09] bg-white/[0.04] py-3 pl-11 pr-10 text-[15px] text-tinta placeholder-nevoa/50 outline-none transition focus:border-eletrico/60 focus:bg-white/[0.06]"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-nevoa hover:text-tinta"
            >
              <IconeX tamanho={15} />
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {filtros.map((f) => {
            const on = filtro === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
                  on
                    ? 'border-eletrico/50 bg-eletrico/15 text-eletrico'
                    : 'border-white/[0.08] bg-white/[0.03] text-nevoa hover:text-tinta'
                }`}
              >
                {f.nome}
              </button>
            )
          })}
        </div>
      </div>

      <section className="superficie surge-3 mt-5 overflow-hidden">
        {listaFiltrada.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <IconeClientes tamanho={30} className="mx-auto text-nevoa/50" />
            <p className="mt-3 text-[14.5px] text-nevoa">
              {clientes.length === 0
                ? 'Adicione o primeiro cliente pra começar.'
                : 'Nenhum cliente encontrado com esse filtro.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {listaFiltrada.map((cliente) => {
              const status = calcularStatus(cliente)
              return (
                <li key={cliente.id}>
                  <button
                    type="button"
                    onClick={() => aoAbrirFicha(cliente)}
                    className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${coresPonto[status.cor]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-tinta">
                        {cliente.nome}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-nevoa">
                        {PERFIS[cliente.perfil].nome} · {formatarData(cliente.vencimento)}
                        {cliente.perfil !== 'cortesia' && ` · ${formatarMoeda(cliente.valor)}`}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[12.5px] font-medium ${coresTexto[status.cor]}`}>
                      {status.nome}
                    </span>
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
          Adicionar cliente
        </button>
      </div>
    </>
  )
}
