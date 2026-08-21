/* ============================================================
   Meu IPTV — dados dos clientes
   Fase 6: guardado de verdade no Supabase (banco + login).
   ============================================================ */

import { supabase } from './supabase.js'

export const PERFIS = {
  padrao: { id: 'padrao', nome: 'Padrão / Varejo' },
  atacado: { id: 'atacado', nome: 'Atacado / Multi-telas' },
  familia: { id: 'familia', nome: 'Família' },
  cortesia: { id: 'cortesia', nome: 'Cortesia' },
}

export const PLANOS = {
  mensal: { id: 'mensal', nome: 'Mensal', dias: 30 },
  trimestral: { id: 'trimestral', nome: 'Trimestral', dias: 90 },
  semestral: { id: 'semestral', nome: 'Semestral', dias: 180 },
}

export const STATUS = {
  ativo: { id: 'ativo', nome: 'Ativo', cor: 'menta' },
  a_vencer: { id: 'a_vencer', nome: 'A vencer', cor: 'ambar' },
  vencido: { id: 'vencido', nome: 'Vencido', cor: 'coral' },
  debito: { id: 'debito', nome: 'Acumulando débito', cor: 'ambar' },
  cortesia: { id: 'cortesia', nome: 'Cortesia', cor: 'nevoa' },
}

export const FORMAS_PAGAMENTO = {
  pix: { id: 'pix', nome: 'PIX' },
  dinheiro: { id: 'dinheiro', nome: 'Dinheiro' },
  outro: { id: 'outro', nome: 'Outro' },
}

const DIAS_PARA_AVISAR = 3

/* ---------- Tabela de preço do Atacado ---------- */

const ATACADO_PADRAO = { precoTela1: 35, precoTela2: 60, precoTelaExtra: 25 }

function tabelaAtacadoDoBanco(row) {
  return {
    id: row.id,
    precoTela1: Number(row.preco_tela1),
    precoTela2: Number(row.preco_tela2),
    precoTelaExtra: Number(row.preco_tela_extra),
  }
}

export async function lerTabelaAtacado() {
  const { data, error } = await supabase.from('config_atacado').select('*').maybeSingle()
  if (error) throw error
  return data ? tabelaAtacadoDoBanco(data) : { ...ATACADO_PADRAO }
}

export async function salvarTabelaAtacado(tabela) {
  const linha = {
    preco_tela1: Number(tabela.precoTela1) || 0,
    preco_tela2: Number(tabela.precoTela2) || 0,
    preco_tela_extra: Number(tabela.precoTelaExtra) || 0,
  }
  if (tabela.id) {
    const { data, error } = await supabase
      .from('config_atacado')
      .update(linha)
      .eq('id', tabela.id)
      .select()
      .single()
    if (error) throw error
    return tabelaAtacadoDoBanco(data)
  }
  const { data, error } = await supabase.from('config_atacado').insert(linha).select().single()
  if (error) throw error
  return tabelaAtacadoDoBanco(data)
}

export function calcularValorAtacado(telas, tabela) {
  const t = tabela || ATACADO_PADRAO
  const n = Number(telas) || 1
  if (n <= 1) return t.precoTela1
  if (n === 2) return t.precoTela2
  return t.precoTela2 + (n - 2) * t.precoTelaExtra
}

/* ---------- Clientes ---------- */

function arredondar(numero) {
  return Math.round((Number(numero) || 0) * 100) / 100
}

function clienteDoBanco(row) {
  return {
    id: row.id,
    nome: row.nome,
    whatsapp: row.whatsapp || '',
    appUsado: row.app_usado || '',
    macId: row.mac_id || '',
    usuario: row.usuario || '',
    senha: row.senha || '',
    perfil: row.perfil,
    plano: row.plano,
    telas: row.telas,
    valor: Number(row.valor),
    vencimento: row.vencimento,
    debitoAcumulado: Number(row.debito_acumulado),
    observacoes: row.observacoes || '',
    criadoEm: row.created_at,
  }
}

function clientePraBanco(c) {
  return {
    nome: c.nome,
    whatsapp: c.whatsapp,
    app_usado: c.appUsado,
    mac_id: c.macId,
    usuario: c.usuario,
    senha: c.senha,
    perfil: c.perfil,
    plano: c.plano,
    telas: Number(c.telas) || 1,
    valor: Number(c.valor) || 0,
    vencimento: c.vencimento,
    debito_acumulado: Number(c.debitoAcumulado) || 0,
    observacoes: c.observacoes,
  }
}

export async function lerClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('vencimento')
  if (error) throw error
  return (data || []).map(clienteDoBanco)
}

export async function salvarCliente(cliente) {
  const linha = clientePraBanco(cliente)
  if (cliente.id) {
    const { data, error } = await supabase
      .from('clientes')
      .update(linha)
      .eq('id', cliente.id)
      .select()
      .single()
    if (error) throw error
    return clienteDoBanco(data)
  }
  const { data, error } = await supabase.from('clientes').insert(linha).select().single()
  if (error) throw error
  return clienteDoBanco(data)
}

export async function apagarCliente(idCliente) {
  const { error } = await supabase.from('clientes').delete().eq('id', idCliente)
  if (error) throw error
}

export function novoCliente() {
  return {
    id: null,
    nome: '',
    whatsapp: '',
    appUsado: '',
    macId: '',
    usuario: '',
    senha: '',
    perfil: 'padrao',
    plano: 'mensal',
    telas: 1,
    valor: 35,
    vencimento: dataISODaquiA(30),
    debitoAcumulado: 0,
    observacoes: '',
  }
}

/* ---------- Datas ---------- */

// Usa o calendário local (nunca toISOString: ela converte pra UTC e
// vira o dia errado à noite, dependendo do fuso).
function paraISO(d) {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function hojeISO() {
  return paraISO(new Date())
}

export function dataISODaquiA(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return paraISO(d)
}

// Soma dias a uma data ISO já existente (usado pra empurrar o vencimento na renovação).
export function adicionarDias(iso, dias) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  const d = new Date(ano, mes - 1, dia)
  d.setDate(d.getDate() + dias)
  return paraISO(d)
}

function diasEntre(deISO, ateISO) {
  const MS_DIA = 86400000
  const de = new Date(deISO + 'T00:00:00')
  const ate = new Date(ateISO + 'T00:00:00')
  return Math.round((ate - de) / MS_DIA)
}

export function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDataPorExtenso(iso) {
  const dias = diasEntre(hojeISO(), iso)
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  if (dias > 1) return `vence em ${dias} dias`
  if (dias === -1) return 'venceu ontem'
  return `venceu há ${Math.abs(dias)} dias`
}

export function formatarMoeda(valor) {
  return (Number(valor) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/* ---------- O cálculo que é o coração do app ---------- */

export function calcularStatus(cliente, hoje = hojeISO()) {
  if (cliente.perfil === 'cortesia') return STATUS.cortesia

  const dias = diasEntre(hoje, cliente.vencimento)
  const venceu = dias < 0

  if (cliente.perfil === 'familia') {
    return venceu ? STATUS.debito : dias <= DIAS_PARA_AVISAR ? STATUS.a_vencer : STATUS.ativo
  }

  // Padrão e Atacado
  if (venceu) return STATUS.vencido
  if (dias <= DIAS_PARA_AVISAR) return STATUS.a_vencer
  return STATUS.ativo
}

/* Cobrar hoje: pagantes (padrão/atacado) vencendo ou já vencidos. */
export function precisaCobrar(cliente, hoje = hojeISO()) {
  if (cliente.perfil !== 'padrao' && cliente.perfil !== 'atacado') return false
  const status = calcularStatus(cliente, hoje)
  return status.id === 'vencido' || status.id === 'a_vencer'
}

/* Avisar sem bloquear: família vencendo ou já acumulando débito. */
export function precisaAvisar(cliente, hoje = hojeISO()) {
  if (cliente.perfil !== 'familia') return false
  const status = calcularStatus(cliente, hoje)
  return status.id === 'debito' || status.id === 'a_vencer'
}

/* ---------- Mensagem pronta pro WhatsApp ---------- */

export function linkWhatsApp(cliente) {
  const digitos = String(cliente.whatsapp || '').replace(/\D/g, '')
  if (!digitos) return null
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos

  const primeiroNome = (cliente.nome || '').trim().split(' ')[0] || 'tudo bem'
  let texto

  if (cliente.perfil === 'familia') {
    texto =
      `Oi, ${primeiroNome}! Passando só pra avisar que o seu acesso venceu ` +
      `${formatarDataPorExtenso(cliente.vencimento)}. Sem pressa, o sinal continua ` +
      `firme 😉 Quando puder acertar, me chama por aqui.`
  } else if (calcularStatus(cliente).id === 'vencido') {
    // Já venceu: sem contar quantos dias — só avisa e pergunta se quer renovar.
    texto =
      `Oi, ${primeiroNome}! Seu acesso venceu. Quer que eu renove (${formatarMoeda(cliente.valor)})? ` +
      `Se sim, me avisa por aqui que eu libero 🙂`
  } else {
    texto =
      `Oi, ${primeiroNome}! Seu acesso ${formatarDataPorExtenso(cliente.vencimento)} ` +
      `(${formatarMoeda(cliente.valor)}). Pode me mandar o pagamento por aqui pra eu renovar? 🙂`
  }

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

/* ============================================================
   Renovações e pagamentos
   ============================================================ */

function renovacaoDoBanco(row) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    data: row.data,
    ate: row.ate,
    valor: Number(row.valor),
    perfil: row.perfil,
    creditos: Number(row.creditos),
    criadoEm: row.created_at,
  }
}

function pagamentoDoBanco(row) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    perfil: row.perfil,
    data: row.data,
    valor: Number(row.valor),
    forma: row.forma,
    criadoEm: row.created_at,
  }
}

export async function lerRenovacoes() {
  const { data, error } = await supabase.from('renovacoes').select('*').order('data', { ascending: false })
  if (error) throw error
  return (data || []).map(renovacaoDoBanco)
}

export async function lerPagamentos() {
  const { data, error } = await supabase.from('pagamentos').select('*').order('data', { ascending: false })
  if (error) throw error
  return (data || []).map(pagamentoDoBanco)
}

/* O histórico do cliente: renovações e pagamentos juntos, mais recente primeiro. */
export function historicoDoCliente(clienteId, renovacoes, pagamentos) {
  const rs = renovacoes.filter((r) => r.clienteId === clienteId).map((r) => ({ ...r, tipo: 'renovacao' }))
  const ps = pagamentos.filter((p) => p.clienteId === clienteId).map((p) => ({ ...p, tipo: 'pagamento' }))

  return [...rs, ...ps].sort((a, b) => {
    if (a.data !== b.data) return b.data.localeCompare(a.data)
    return (b.criadoEm || '').localeCompare(a.criadoEm || '')
  })
}

/* Empurra o vencimento conforme o plano e registra a renovação.
   Na Família, o valor do mês soma no débito acumulado (o sinal nunca corta).
   Todo perfil consome crédito do estoque — inclusive Família e Cortesia. */
export async function renovarCliente(cliente, creditos = CREDITOS_SUGERIDOS_POR_RENOVACAO) {
  const dias = PLANOS[cliente.plano].dias
  const novoVencimento = adicionarDias(cliente.vencimento, dias)
  const novoDebito =
    cliente.perfil === 'familia'
      ? arredondar((Number(cliente.debitoAcumulado) || 0) + (Number(cliente.valor) || 0))
      : Number(cliente.debitoAcumulado) || 0

  const { data: linhaCliente, error: erroCliente } = await supabase
    .from('clientes')
    .update({ vencimento: novoVencimento, debito_acumulado: novoDebito })
    .eq('id', cliente.id)
    .select()
    .single()
  if (erroCliente) throw erroCliente

  const { error: erroRenovacao } = await supabase.from('renovacoes').insert({
    cliente_id: cliente.id,
    data: hojeISO(),
    ate: novoVencimento,
    valor: cliente.valor,
    perfil: cliente.perfil,
    creditos: Number(creditos) || 0,
  })
  if (erroRenovacao) throw erroRenovacao

  return clienteDoBanco(linhaCliente)
}

/* Registra um pagamento avulso. Na Família, abate do débito acumulado (nunca fica negativo). */
export async function registrarPagamento(cliente, { valor, forma, data }) {
  const { error: erroPagamento } = await supabase.from('pagamentos').insert({
    cliente_id: cliente.id,
    perfil: cliente.perfil,
    data: data || hojeISO(),
    valor: arredondar(valor),
    forma,
  })
  if (erroPagamento) throw erroPagamento

  if (cliente.perfil !== 'familia') return cliente

  const novoDebito = Math.max(0, arredondar((Number(cliente.debitoAcumulado) || 0) - (Number(valor) || 0)))
  const { data: linhaCliente, error: erroCliente } = await supabase
    .from('clientes')
    .update({ debito_acumulado: novoDebito })
    .eq('id', cliente.id)
    .select()
    .single()
  if (erroCliente) throw erroCliente
  return clienteDoBanco(linhaCliente)
}

/* ============================================================
   Créditos (estoque do painel master)
   ============================================================ */

// Sugestão mostrada no campo de renovação — o Thiago ajusta na hora conforme o painel.
export const CREDITOS_SUGERIDOS_POR_RENOVACAO = 1

// Abaixo disso, a tela Créditos e a tela Hoje avisam que o saldo está baixo.
export const SALDO_BAIXO = 10

function compraCreditoDoBanco(row) {
  return {
    id: row.id,
    data: row.data,
    painel: row.painel || '',
    quantidade: Number(row.quantidade),
    custoTotal: Number(row.custo_total),
    custoPorCredito: Number(row.custo_por_credito),
    criadoEm: row.created_at,
  }
}

export async function lerComprasCredito() {
  const { data, error } = await supabase.from('compras_credito').select('*').order('data', { ascending: false })
  if (error) throw error
  return (data || []).map(compraCreditoDoBanco)
}

/* Registra uma compra de créditos no painel master (entrada no estoque). */
export async function registrarCompraCredito({ data, painel, quantidade, custoTotal }) {
  const qtd = Number(quantidade) || 0
  const custo = arredondar(custoTotal)
  const { error } = await supabase.from('compras_credito').insert({
    data: data || hojeISO(),
    painel: (painel || '').trim(),
    quantidade: qtd,
    custo_total: custo,
    custo_por_credito: qtd > 0 ? arredondar(custo / qtd) : 0,
  })
  if (error) throw error
}

/* Saldo = tudo que entrou nas compras menos as renovações e as vendas pra revendedor. */
export function calcularSaldoCreditos(comprasCredito, renovacoes, vendasRevenda) {
  const entradas = comprasCredito.reduce((soma, c) => soma + (Number(c.quantidade) || 0), 0)
  const saidasRenovacao = renovacoes.reduce((soma, r) => soma + (Number(r.creditos) || 0), 0)
  const saidasRevenda = vendasRevenda.reduce((soma, v) => soma + (Number(v.quantidade) || 0), 0)
  return entradas - saidasRenovacao - saidasRevenda
}

/* Custo médio ponderado por todas as compras já registradas. */
export function calcularCustoMedioCredito(comprasCredito) {
  const totalCreditos = comprasCredito.reduce((soma, c) => soma + (Number(c.quantidade) || 0), 0)
  if (totalCreditos <= 0) return 0
  const totalCusto = comprasCredito.reduce((soma, c) => soma + (Number(c.custoTotal) || 0), 0)
  return arredondar(totalCusto / totalCreditos)
}

/* Extrato do estoque: compras (entrada), renovações que consumiram crédito e vendas pra
   revendedor (saídas), mais recente primeiro. */
export function extratoCreditos(comprasCredito, renovacoes, vendasRevenda) {
  const entradas = comprasCredito.map((c) => ({ ...c, tipo: 'entrada' }))
  const saidasRenovacao = renovacoes.filter((r) => Number(r.creditos) > 0).map((r) => ({ ...r, tipo: 'saida' }))
  const saidasRevenda = vendasRevenda.map((v) => ({ ...v, tipo: 'revenda' }))

  return [...entradas, ...saidasRenovacao, ...saidasRevenda].sort((a, b) => {
    if (a.data !== b.data) return b.data.localeCompare(a.data)
    return (b.criadoEm || '').localeCompare(a.criadoEm || '')
  })
}

/* ============================================================
   Revendedores
   ============================================================ */

function revendedorDoBanco(row) {
  return {
    id: row.id,
    nome: row.nome,
    whatsapp: row.whatsapp || '',
    precoPorCredito: Number(row.preco_por_credito),
    observacoes: row.observacoes || '',
    criadoEm: row.created_at,
  }
}

function revendedorPraBanco(r) {
  return {
    nome: r.nome,
    whatsapp: r.whatsapp,
    preco_por_credito: Number(r.precoPorCredito) || 0,
    observacoes: r.observacoes,
  }
}

export async function lerRevendedores() {
  const { data, error } = await supabase.from('revendedores').select('*').order('nome')
  if (error) throw error
  return (data || []).map(revendedorDoBanco)
}

export async function salvarRevendedor(revendedor) {
  const linha = revendedorPraBanco(revendedor)
  if (revendedor.id) {
    const { data, error } = await supabase
      .from('revendedores')
      .update(linha)
      .eq('id', revendedor.id)
      .select()
      .single()
    if (error) throw error
    return revendedorDoBanco(data)
  }
  const { data, error } = await supabase.from('revendedores').insert(linha).select().single()
  if (error) throw error
  return revendedorDoBanco(data)
}

export async function apagarRevendedor(idRevendedor) {
  const { error } = await supabase.from('revendedores').delete().eq('id', idRevendedor)
  if (error) throw error
}

export function novoRevendedor() {
  return {
    id: null,
    nome: '',
    whatsapp: '',
    precoPorCredito: 0,
    observacoes: '',
  }
}

function vendaRevendaDoBanco(row) {
  return {
    id: row.id,
    revendedorId: row.revendedor_id,
    data: row.data,
    quantidade: Number(row.quantidade),
    valor: Number(row.valor),
    pago: Boolean(row.pago),
    criadoEm: row.created_at,
  }
}

export async function lerVendasRevenda() {
  const { data, error } = await supabase.from('vendas_revenda').select('*').order('data', { ascending: false })
  if (error) throw error
  return (data || []).map(vendaRevendaDoBanco)
}

/* Vende crédito pro revendedor: sai do estoque do painel master, entra no saldo dele. */
export async function venderCreditoRevendedor({ revendedorId, data, quantidade, valor, pago }) {
  const { data: linha, error } = await supabase
    .from('vendas_revenda')
    .insert({
      revendedor_id: revendedorId,
      data: data || hojeISO(),
      quantidade: Number(quantidade) || 0,
      valor: arredondar(valor),
      pago: Boolean(pago),
    })
    .select()
    .single()
  if (error) throw error
  return vendaRevendaDoBanco(linha)
}

/* Alterna a venda entre paga e em aberto. */
export async function marcarVendaRevendaPaga(vendaId, pago) {
  const { error } = await supabase.from('vendas_revenda').update({ pago: Boolean(pago) }).eq('id', vendaId)
  if (error) throw error
}

export function vendasDoRevendedor(revendedorId, vendasRevenda) {
  return vendasRevenda
    .filter((v) => v.revendedorId === revendedorId)
    .sort((a, b) => {
      if (a.data !== b.data) return b.data.localeCompare(a.data)
      return (b.criadoEm || '').localeCompare(a.criadoEm || '')
    })
}

/* Saldo do revendedor: soma de tudo que ele já comprou. O app não enxerga o consumo dele
   com os próprios clientes — isso é operação de dentro da revenda dele. */
export function calcularSaldoRevendedor(revendedorId, vendasRevenda) {
  return vendasDoRevendedor(revendedorId, vendasRevenda).reduce((soma, v) => soma + (Number(v.quantidade) || 0), 0)
}

export function calcularTotalCompradoRevendedor(revendedorId, vendasRevenda) {
  return vendasDoRevendedor(revendedorId, vendasRevenda).reduce((soma, v) => soma + (Number(v.valor) || 0), 0)
}

export function temVendaEmAberto(revendedorId, vendasRevenda) {
  return vendasDoRevendedor(revendedorId, vendasRevenda).some((v) => !v.pago)
}

/* ============================================================
   Financeiro (o lucro real)
   ============================================================ */

const NOMES_MES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function mesAtualISO() {
  return hojeISO().slice(0, 7) // 'AAAA-MM'
}

export function adicionarMeses(mesISO, delta) {
  const [ano, mes] = mesISO.split('-').map(Number)
  const d = new Date(ano, mes - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatarMes(mesISO) {
  const [ano, mes] = mesISO.split('-').map(Number)
  return `${NOMES_MES[mes - 1]} de ${ano}`
}

function noMes(dataISO, mesISO) {
  return typeof dataISO === 'string' && dataISO.startsWith(mesISO)
}

function ehComercial(perfil) {
  return perfil === 'padrao' || perfil === 'atacado'
}

/* Faturamento = dinheiro que realmente entrou no mês: pagamentos de clientes comerciais
   (Padrão/Atacado) + vendas de crédito pra revendedor já pagas. Família nunca soma aqui —
   o que ela deve fica só no painel Cortesia & Família.
   Custo = todo crédito consumido no mês (renovações de TODOS os perfis, inclusive Cortesia
   e Família) vezes o custo médio do crédito — é isso que faz o lucro ser real. */
export function calcularFinanceiroDoMes(mesISO, clientes, pagamentos, vendasRevenda, renovacoes, custoMedio) {
  const perfilDoCliente = new Map(clientes.map((c) => [c.id, c.perfil]))

  const faturamentoClientes = pagamentos
    .filter((p) => noMes(p.data, mesISO))
    .filter((p) => ehComercial(p.perfil || perfilDoCliente.get(p.clienteId)))
    .reduce((soma, p) => soma + (Number(p.valor) || 0), 0)

  const faturamentoRevenda = vendasRevenda
    .filter((v) => noMes(v.data, mesISO) && v.pago)
    .reduce((soma, v) => soma + (Number(v.valor) || 0), 0)

  const creditosConsumidos = renovacoes
    .filter((r) => noMes(r.data, mesISO))
    .reduce((soma, r) => soma + (Number(r.creditos) || 0), 0)
  const custoCreditos = arredondar(creditosConsumidos * custoMedio)

  const faturamento = arredondar(faturamentoClientes + faturamentoRevenda)

  return {
    faturamento,
    faturamentoClientes: arredondar(faturamentoClientes),
    faturamentoRevenda: arredondar(faturamentoRevenda),
    custoCreditos,
    creditosConsumidos,
    lucro: arredondar(faturamento - custoCreditos),
  }
}

/* Inadimplência comercial: quanto do valor mensal esperado dos clientes pagantes
   (Padrão/Atacado) está com o status Vencido agora. Família nunca entra aqui. */
export function calcularInadimplencia(clientes) {
  const comerciais = clientes.filter((c) => ehComercial(c.perfil))
  const vencidos = comerciais.filter((c) => calcularStatus(c).id === 'vencido')

  const valorTotal = comerciais.reduce((soma, c) => soma + (Number(c.valor) || 0), 0)
  const valorVencido = vencidos.reduce((soma, c) => soma + (Number(c.valor) || 0), 0)

  return {
    taxa: valorTotal > 0 ? valorVencido / valorTotal : 0,
    valorVencido: arredondar(valorVencido),
    valorTotal: arredondar(valorTotal),
    qtdVencidos: vencidos.length,
    qtdTotal: comerciais.length,
  }
}

/* Previsão dos próximos 30 dias: só quem ainda vai vencer (não os já vencidos), entre
   os clientes pagantes (Padrão/Atacado). */
export function calcularPrevisao30Dias(clientes, hoje = hojeISO()) {
  const chegando = clientes.filter((c) => {
    if (!ehComercial(c.perfil)) return false
    const dias = diasEntre(hoje, c.vencimento)
    return dias >= 0 && dias <= 30
  })
  return {
    valor: arredondar(chegando.reduce((soma, c) => soma + (Number(c.valor) || 0), 0)),
    qtd: chegando.length,
  }
}

/* O painel separado que não polui o caixa comercial: quanto a casa consumiu de graça
   (Cortesia) neste mês, e quanto a Família deve no total, agora. */
export function calcularCortesiaFamilia(mesISO, clientes, renovacoes, custoMedio) {
  const creditosCortesia = renovacoes
    .filter((r) => noMes(r.data, mesISO) && r.perfil === 'cortesia')
    .reduce((soma, r) => soma + (Number(r.creditos) || 0), 0)

  const debitoFamilia = clientes
    .filter((c) => c.perfil === 'familia')
    .reduce((soma, c) => soma + (Number(c.debitoAcumulado) || 0), 0)

  return {
    custoCortesia: arredondar(creditosCortesia * custoMedio),
    creditosCortesia,
    debitoFamilia: arredondar(debitoFamilia),
  }
}
