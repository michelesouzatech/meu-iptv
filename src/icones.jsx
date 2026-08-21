/* Ícones em SVG puro — sem instalar biblioteca nenhuma.
   Traço fino e cantos arredondados, no mesmo tom da referência. */

const traco = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const Svg = ({ tamanho = 22, children, ...resto }) => (
  <svg width={tamanho} height={tamanho} {...traco} {...resto}>
    {children}
  </svg>
)

export const IconeHoje = (p) => (
  <Svg {...p}>
    <path d="M12 2v6" />
    <path d="m4.9 7.9 1.4 1.4" />
    <path d="M2 18h2" />
    <path d="M20 18h2" />
    <path d="m17.7 9.3 1.4-1.4" />
    <path d="M22 22H2" />
    <path d="m8 6 4-4 4 4" />
    <path d="M16 18a4 4 0 0 0-8 0" />
  </Svg>
)

export const IconeClientes = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
)

export const IconeCreditos = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </Svg>
)

export const IconeRevenda = (p) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.59 13.51 6.83 3.98" />
    <path d="m15.41 6.51-6.82 3.98" />
  </Svg>
)

export const IconeFinanceiro = (p) => (
  <Svg {...p}>
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </Svg>
)

export const IconeCadeado = (p) => (
  <Svg {...p}>
    <rect width="16" height="11" x="4" y="11" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
)

export const IconeCheck = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m8.5 12.2 2.4 2.4 4.6-5" />
  </Svg>
)

export const IconeConversa = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.5-4.4A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
  </Svg>
)

export const IconeMais = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
)

export const IconeTroca = (p) => (
  <Svg {...p}>
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </Svg>
)

export const IconeSeta = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
)

/* Marca: uma TV com o sinal saindo dela */
export const Logo = ({ tamanho = 26 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.5" y="7.5" width="19" height="13" rx="3" stroke="#3B82F6" strokeWidth="1.7" />
    <path
      d="m7.5 3.2 4.5 4 4.5-4"
      stroke="#3B82F6"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.6 17.2a2.6 2.6 0 0 0-2.6-2.6" stroke="#34D399" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12.6 17.2A6.6 6.6 0 0 0 6 10.6" stroke="#34D399" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export const IconeBusca = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
)

export const IconeX = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
)

export const IconeEditar = (p) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
)

export const IconeLixeira = (p) => (
  <Svg {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Svg>
)

export const IconeVoltar = (p) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
)

export const IconeOlho = (p) => (
  <Svg {...p}>
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const IconeOlhoFechado = (p) => (
  <Svg {...p}>
    <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10.5 8 10.5 8a17.5 17.5 0 0 1-2.16 3.19M6.15 6.15C3.53 7.9 1.5 11 1.5 11s3.5 8 10.5 8a9.3 9.3 0 0 0 4.32-1.03" />
    <path d="M9.5 14.5a3 3 0 0 0 4.24-4.24" />
    <path d="m2 2 20 20" />
  </Svg>
)

export const IconeAlerta = (p) => (
  <Svg {...p}>
    <path d="M10.3 3.9 1.9 18a1.8 1.8 0 0 0 1.5 2.7h17.2a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
)
