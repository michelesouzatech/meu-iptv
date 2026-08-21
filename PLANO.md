# 📺 Meu IPTV — Plano do MVP

> O painel de controle da revenda de IPTV do Thiago: quem vence hoje, quem cobrar,
> quantos créditos restam no painel master e quanto realmente sobrou de lucro no fim do mês.

---

## 1. Decisões

| Tema | Decisão |
|---|---|
| **Quem usa** | Só o Thiago (uso próprio, dados dele) |
| **Precisa de login?** | Sim, mas só na Fase 6 — um login simples pra proteger os dados (senhas de clientes, valores) quando o app estiver na internet |
| **Onde usa** | **Mobile-first**: ele abre no celular de manhã pra ver quem cobrar. Funciona igual no computador |
| **Onde os dados ficam** | Fases 0 a 5: salvo no navegador (localStorage). Fase 6: Supabase (banco de verdade) |
| **Nome** | Meu IPTV |
| **Paleta (azul-noite)** | Fundo `#0B1020` · Cartão `#151B2E` · Destaque `#3B82F6` (azul elétrico) · OK `#34D399` (menta) · Alerta `#FB7185` (coral) · Aviso `#FBBF24` (âmbar, "a vencer") |
| **Fontes** | Space Grotesk (títulos e números) + Inter (texto) |
| **Referência de layout** | `ideia01.jpg` — app financeiro escuro com cartões translúcidos. Inspiração de **clima e cartões**, não cópia: identidade própria |
| **Caixa de ferramentas** | Vite + React + Tailwind (a mesma do Meu Ritmo e do FinPilot), deploy na Vercel |

---

## 2. Telas do app

| Tela | O que o Thiago faz nela |
|---|---|
| **Hoje** (abertura) | A tela do café da manhã. Saldo de créditos no topo e duas listas: **"Cobrar hoje"** (clientes pagantes vencendo ou vencidos, com botão de WhatsApp) e **"Avisar sem bloquear"** (família). |
| **Clientes** | Lista com busca e filtro por status. Cada linha mostra nome, perfil de cobrança, vencimento e status colorido. |
| **Ficha do cliente** | Cadastro completo: WhatsApp, app usado (Bob Player, XCIPTV…), MAC/Device ID, usuário e senha da lista, plano, nº de telas, perfil de cobrança, valor e vencimento. Botões **Renovar**, **Registrar pagamento** e **Cobrar no WhatsApp**, mais o histórico. |
| **Créditos** | O estoque do painel master: saldo atual, custo por crédito, entradas (compras) e saídas (cada renovação/venda). |
| **Revendedores** | Sub-revendedores: contato, preço por crédito daquele revendedor, saldo dele e histórico de compra e consumo. |
| **Financeiro** | Faturamento do mês, custo dos créditos, **lucro líquido real**, inadimplência e previsão dos próximos 30 dias. Separado, o painel **Cortesia & Família**. |

---

## 3. O diferencial (detalhado): os perfis de cobrança

O coração do Meu IPTV. Cada cliente tem **um perfil**, e o perfil muda o comportamento do app inteiro —
é o que separa o negócio de verdade das concessões pessoais.

| Perfil | O que acontece no vencimento | Aparece em "Cobrar hoje"? | Entra no caixa comercial? |
|---|---|---|---|
| **Padrão / Varejo** | Vira **Vencido** (bloqueado até pagar) | Sim, com mensagem de cobrança pronta | Sim — faturamento e inadimplência |
| **Atacado / Multi-telas** | Igual ao varejo, mas o valor vem da faixa de telas (desconto por volume) | Sim | Sim |
| **Família / Pagar quando puder** | **Renova sem cortar o sinal** e soma o valor do mês ao *débito acumulado* do cliente | **Não** — vai pro bloco "Avisar sem bloquear" | Não — vai pro painel Cortesia & Família |
| **Cortesia / Uso próprio (R$ 0)** | Renova, consome crédito, não gera cobrança nenhuma | Não | Não — só o **custo do crédito**, como "investido na casa" |

### Regras por extenso

- **Status possíveis:** `Ativo` · `A vencer` (faltam 3 dias ou menos) · `Vencido` · `Acumulando débito` (família com valor em aberto) · `Cortesia`.
- **O status é calculado sozinho** pela data de vencimento e pelo perfil — o Thiago nunca precisa marcar na mão.
- **Todo cliente consome crédito do estoque ao renovar** — inclusive família e cortesia. É exatamente isso que faz o lucro ser **real**: o app consegue dizer *"seu lucro líquido foi R$ X, e as TVs da casa te custaram R$ Y"*.
- **Débito acumulado da família:** cada renovação sem pagamento soma o valor do mês. A ficha mostra *"Fulano deve R$ 105,00 referentes a 3 meses"*. Quando ele paga, o débito abate.
- **Cobrar no WhatsApp:** abre o WhatsApp do cliente com a mensagem já escrita (nome, valor, vencimento). Clientes de **Família e Cortesia nunca recebem a mensagem de cobrança padrão** — a família tem um aviso gentil, sem valor de bloqueio.
- **Atacado:** o Thiago cadastra a tabela de desconto por telas (ex.: 1 tela R$ 35 · 2 telas R$ 60 · 3+ R$ 25 cada) e o valor do cliente sai dela automaticamente.

---

## 4. O que o app guarda

```
Cliente:      nome, WhatsApp, app usado (Bob Player, XCIPTV...), MAC/Device ID,
              usuário da lista, senha da lista, perfil de cobrança,
              plano (mensal/trimestral/semestral), telas, valor,
              data de vencimento, status, débito acumulado, observações

Renovação:    de qual cliente, data, até quando renovou, valor,
              créditos consumidos, pago (sim/não)

Pagamento:    de qual cliente, data, valor, forma (PIX/dinheiro/outro)

Compra de     data, de qual painel/servidor, quantidade de créditos,
créditos:     custo total, custo por crédito

Revendedor:   nome, WhatsApp, preço por crédito dele, saldo de créditos

Venda ao      qual revendedor, data, quantidade de créditos,
revendedor:   valor cobrado, pago (sim/não)
```

**Como tudo se liga:** cada renovação e cada pagamento pertencem a um cliente; toda renovação e toda venda pra revendedor tiram crédito do estoque; e é dessa conta — o que entrou de dinheiro menos o custo dos créditos que saíram — que nasce o **lucro líquido real**.

---

## 5. Fases de construção

- [x] **Fase 0 — Setup + preview duplo** *(Aula 2)*
      Projeto rodando, azul-noite, mobile-first, e a tela de preview mostrando o app
      no celular e no computador ao mesmo tempo.

- [x] **Fase 1 — Clientes e vencimentos** ⭐ *o core* *(Aula 2)*
      Cadastrar cliente completo, escolher o perfil de cobrança, lista com busca e filtro
      por status, e a tela **Hoje** com "Cobrar hoje" + botão do WhatsApp.

- [x] **Fase 2 — Renovar e receber** *(Aula 2 / dever de casa)*
      Botão renovar (empurra o vencimento), registrar pagamento, o débito acumulado da
      família crescendo sozinho e o histórico de cada cliente.

- [x] **Fase 3 — Créditos** *(dever de casa)*
      O estoque do painel master: registrar compra, saldo caindo a cada renovação,
      custo por crédito.

- [x] **Fase 4 — Revendedores** *(dever de casa)*
      Cadastro do sub-revendedor, preço por crédito dele, vender crédito
      (sai do seu estoque, entra no dele) e o saldo.

- [x] **Fase 5 — Financeiro** *(dever de casa)*
      Faturamento, custo, lucro líquido real, inadimplência, previsão de 30 dias
      e o painel Cortesia & Família separado.

- [x] **Fase 6 — Publicar** *(Aula 3)*
      Supabase (dados de verdade + login) + deploy na Vercel. App no ar em
      https://meu-iptv-iota.vercel.app — falta só instalar no celular como app (atalho na tela inicial).

> Da Fase 1 à 5 o app já é **inteiro**: cadastra, cobra, renova, controla estoque,
> atende revendedor e mostra o lucro. Versão 2 é melhoria — nunca meio app.

---

## 6. Versão 2 (fica pra depois — nada se perde)

- **Disparo automático de WhatsApp** (exige API paga e aprovação da Meta). No MVP fica o botão que abre a conversa com a mensagem pronta.
- **Notificação de manhã no celular** ("cobrar hoje: 3 clientes") — precisa de servidor de notificação.
- **Relatórios com gráficos** e exportar para planilha.
- **Anexar comprovante** de pagamento na ficha do cliente.
- **Login próprio do revendedor** pra ele mesmo ver o saldo de créditos dele.
- **Link de PIX gerado** direto na mensagem de cobrança.
- **Vários painéis master** com saldo separado por servidor (no MVP cada compra já registra de qual painel veio).
