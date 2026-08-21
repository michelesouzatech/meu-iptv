# 🚀 Meu IPTV — Prompts de cada fase

Este arquivo é o seu **ponto de retorno**. Fechou o Claude e voltou outro dia?
Abra aqui, copie o prompt da fase onde você parou e cole numa conversa nova.
(Ou simplesmente peça: *"continue meu app da Fase 3"*.)

**Identidade visual de todas as fases:**
fundo `#0B1020` · cartão `#151B2E` · destaque `#3B82F6` (azul elétrico) ·
OK `#34D399` (menta) · alerta `#FB7185` (coral) · aviso `#FBBF24` (âmbar) ·
fontes Space Grotesk (títulos/números) + Inter (texto) · **mobile-first**.

**Como ligar o app:** dentro da pasta `meu-iptv`, rode `npm run dev` e abra

- o **preview duplo** (celular + computador): <http://localhost:5190/preview.html>
- o app sozinho: <http://localhost:5190/>

(A porta 5190 é fixa e só do Meu IPTV — 5173 é o Meu Ritmo e 5174/5180 são o FinPilot.)

---

## Prompt — Fase 0: Setup + preview duplo

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago (clientes, vencimentos, créditos e lucro real).
Vamos construir SÓ a Fase 0: deixar o projeto de pé com a cara do app.

Nesta fase:
- Criar o projeto com Vite + React + Tailwind (a mesma base do meu app Meu Ritmo).
- Aplicar a identidade: fundo #0B1020, cartão #151B2E, destaque #3B82F6,
  OK #34D399, alerta #FB7185, aviso #FBBF24. Fontes Space Grotesk (títulos e
  números) + Inter (texto).
- Montar o esqueleto mobile-first: uma barra de navegação embaixo (estilo app de
  celular) com Hoje, Clientes, Créditos, Revendedores e Financeiro — cada uma
  abrindo uma tela vazia com o título, só pra eu ver a cara do app. Ainda sem
  nenhuma função.
- Criar a tela de preview duplo: uma página preview.html com DOIS <iframe> lado a
  lado apontando para a MESMA URL do app rodando no localhost. À esquerda, dentro
  de uma moldura com cara de celular (~390px de largura, cantos arredondados). À
  direita, em largura de computador. Os iframes carregam o app real e clicável,
  não prints nem cópias estáticas — então eu clico nos dois e funciona, e quando
  você mudar o app, os dois atualizam sozinhos.
- Me dizer qual endereço eu abro no navegador pra ver o preview.

Identidade visual: azul-noite (paleta acima), Space Grotesk + Inter, mobile-first.
Não faça ainda: nenhum cadastro, nenhum dado, nenhum banco de dados, nenhum login.
Não instale nada além de Vite, React e Tailwind.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] Abro o preview e vejo o app duas vezes: celular à esquerda, computador à direita
- [ ] Consigo clicar na navegação nas DUAS telas do preview e elas respondem
- [ ] As cores e as fontes são as do plano (fundo azul-noite, destaque azul elétrico)
- [ ] No celular a navegação fica embaixo, com o dedo alcançando fácil
```

---

## Prompt — Fase 1: Clientes e vencimentos ⭐ (o core)

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago.
Já concluí a Fase 0 (projeto de pé, identidade visual e preview duplo).
Agora vamos construir SÓ a Fase 1: clientes e vencimentos.

Nesta fase:
- Tela Clientes: lista com busca por nome e filtro por status. Cada linha mostra
  nome, perfil de cobrança, data de vencimento e o status com cor.
- Cadastro/edição do cliente com todos os campos do PLANO.md: nome, WhatsApp,
  app usado, MAC/Device ID, usuário e senha da lista, perfil de cobrança, plano,
  nº de telas, valor, data de vencimento e observações.
- Os 4 perfis de cobrança (Padrão/Varejo, Atacado/Multi-telas, Família, Cortesia)
  com as regras da seção 3 do PLANO.md. No Atacado, o valor sai da tabela de
  desconto por telas.
- O status é CALCULADO sozinho pela data e pelo perfil (Ativo, A vencer quando
  faltam 3 dias ou menos, Vencido, Acumulando débito, Cortesia). Nunca marcado na mão.
- Tela Hoje: saldo de créditos no topo (por enquanto só um número que eu digito),
  e duas listas separadas: "Cobrar hoje" (clientes pagantes vencendo ou vencidos)
  e "Avisar sem bloquear" (família).
- Botão "Cobrar no WhatsApp": abre a conversa do cliente no WhatsApp com a mensagem
  já escrita (nome, valor, vencimento). Família recebe um aviso gentil, sem valor
  de bloqueio. Cortesia não tem esse botão.
- Tudo salvo no navegador (localStorage), pra continuar lá quando eu fechar e abrir.

Identidade visual: azul-noite (fundo #0B1020, cartão #151B2E, destaque #3B82F6,
OK #34D399, alerta #FB7185, aviso #FBBF24), Space Grotesk + Inter, mobile-first.
Não faça ainda: renovar, registrar pagamento, estoque de créditos de verdade,
revendedores, financeiro, banco de dados ou login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] Cadastro um cliente completo e ele aparece na lista
- [ ] Coloco uma data de vencimento pra ontem e ele fica Vencido sozinho, em coral
- [ ] Um cliente Família vencido aparece em "Avisar sem bloquear" e NÃO em "Cobrar hoje"
- [ ] Clico em "Cobrar no WhatsApp" e abre a conversa com a mensagem pronta
- [ ] Fecho o navegador, abro de novo e meus clientes continuam lá
```

---

## Prompt — Fase 2: Renovar e receber

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago.
Já concluí as Fases 0 e 1 (identidade + preview duplo + clientes, status e tela Hoje).
Agora vamos construir SÓ a Fase 2: renovar e receber.

Nesta fase:
- Botão "Renovar" na ficha do cliente: empurra a data de vencimento conforme o plano
  (mensal, trimestral, semestral) e registra a renovação no histórico.
- Botão "Registrar pagamento": data, valor e forma (PIX, dinheiro, outro).
- Regra da Família: ao renovar sem pagamento, o valor do mês SOMA no débito
  acumulado do cliente. A ficha mostra "Fulano deve R$ 105,00 referentes a 3 meses".
  Quando ele paga, o débito abate.
- Regra da Cortesia: renova normalmente e nunca gera cobrança nem débito.
- Histórico na ficha do cliente: todas as renovações e pagamentos, do mais novo
  pro mais antigo.
- Tudo continua salvo no navegador (localStorage).

Identidade visual: azul-noite, Space Grotesk + Inter, mobile-first.
Não faça ainda: estoque de créditos, revendedores, financeiro, banco de dados ou login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] Clico em Renovar num cliente mensal e o vencimento anda 1 mês pra frente
- [ ] O cliente sai de "Cobrar hoje" depois que eu renovo e registro o pagamento
- [ ] Renovo um cliente Família 3 vezes sem pagar e o débito acumulado mostra o total certo
- [ ] Registro o pagamento da família e o débito abate
- [ ] O histórico da ficha mostra tudo que eu fiz, na ordem certa
```

---

## Prompt — Fase 3: Créditos (estoque do painel master)

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago.
Já concluí as Fases 0, 1 e 2 (clientes, status, tela Hoje, renovação e pagamento).
Agora vamos construir SÓ a Fase 3: o estoque de créditos do painel master.

Nesta fase:
- Tela Créditos: saldo atual bem grande no topo, custo médio por crédito, e o
  extrato de entradas e saídas.
- Registrar compra de créditos: data, painel/servidor de origem, quantidade,
  custo total (o app calcula o custo por crédito sozinho).
- Cada renovação de cliente CONSOME crédito do estoque automaticamente —
  inclusive Família e Cortesia. É isso que faz o lucro ser real depois.
- O saldo de créditos da tela Hoje passa a vir daqui (não é mais um número digitado).
- Aviso visual quando o saldo estiver baixo.
- Tudo continua salvo no navegador (localStorage).

Identidade visual: azul-noite, Space Grotesk + Inter, mobile-first.
Não faça ainda: revendedores, financeiro, banco de dados ou login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] Registro uma compra de 50 créditos e o saldo sobe pra 50
- [ ] Renovo um cliente e o saldo cai sozinho, aparecendo no extrato
- [ ] Renovo um cliente Cortesia e o crédito também sai (é custo da casa)
- [ ] O saldo que aparece na tela Hoje é o mesmo da tela Créditos
```

---

## Prompt — Fase 4: Revendedores

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago.
Já concluí as Fases 0 a 3 (clientes, renovação, pagamento e estoque de créditos).
Agora vamos construir SÓ a Fase 4: os sub-revendedores.

Nesta fase:
- Tela Revendedores: lista com nome, saldo de créditos de cada um e quanto ele
  já comprou.
- Cadastro do revendedor: nome, WhatsApp, preço por crédito personalizado dele
  e observações.
- Vender créditos pro revendedor: quantidade e valor cobrado. O crédito SAI do
  meu estoque do painel master e ENTRA no saldo do revendedor.
- Marcar a venda como paga ou em aberto.
- Histórico por revendedor: tudo que ele comprou e quanto consumiu.
- Tudo continua salvo no navegador (localStorage).

Identidade visual: azul-noite, Space Grotesk + Inter, mobile-first.
Não faça ainda: financeiro, banco de dados ou login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] Cadastro um revendedor com preço por crédito próprio
- [ ] Vendo 20 créditos pra ele: meu estoque cai 20 e o saldo dele sobe 20
- [ ] Consigo marcar a venda como em aberto e depois como paga
- [ ] O histórico do revendedor mostra todas as vendas
```

---

## Prompt — Fase 5: Financeiro (o lucro real)

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago.
Já concluí as Fases 0 a 4 (clientes, renovação, créditos e revendedores).
Agora vamos construir SÓ a Fase 5: o financeiro.

Nesta fase:
- Tela Financeiro do mês, com métricas COMERCIAIS limpas:
  faturamento bruto dos clientes pagantes + vendas pra revendedores,
  custo dos créditos consumidos (todos, inclusive família e cortesia),
  LUCRO LÍQUIDO REAL, taxa de inadimplência comercial
  e previsão de receita dos próximos 30 dias (pelos vencimentos que estão por vir).
- Painel separado "Cortesia & Família", que NÃO polui o caixa oficial:
  total investido em créditos pra uso da casa (cortesia),
  e total acumulado a receber da família.
- Poder trocar o mês que estou olhando.
- Tudo continua salvo no navegador (localStorage).

Identidade visual: azul-noite, Space Grotesk + Inter, mobile-first.
Números grandes em Space Grotesk, lucro em menta #34D399, inadimplência em coral #FB7185.
Não faça ainda: banco de dados, login, gráficos ou exportar (isso é Versão 2).
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu
puder testar.

Está pronto quando:
- [ ] O faturamento bate com os pagamentos que eu registrei no mês
- [ ] O lucro líquido desconta o custo dos créditos, inclusive os da cortesia
- [ ] Os clientes Família não aparecem no faturamento nem na inadimplência
- [ ] O painel Cortesia & Família mostra quanto a casa custou e quanto a família deve
- [ ] A previsão de 30 dias bate com os vencimentos que estão chegando
```

---

## Prompt — Fase 6: Publicar (Supabase + Vercel + celular)

```
Leia o arquivo PLANO.md. Estou construindo o app Meu IPTV: o painel de controle da
revenda de IPTV do Thiago. O app está completo e funcionando com os dados salvos
no navegador. Agora é a última fase: colocar no ar de verdade.

Primeiro, ative a skill do back-end dizendo:

    vamos construir o back-end do meu app

Com ela vamos:
- Criar o banco de dados no Supabase com as tabelas do PLANO.md
  (clientes, renovações, pagamentos, compras de crédito, revendedores,
  vendas pra revendedor).
- Trocar o localStorage pelo banco de verdade, sem perder o que eu já cadastrei.
- Adicionar login (só eu entro) e proteger os dados — tem senha de cliente
  e valores aí dentro, ninguém mais pode ver.

Depois disso:
- Publicar na Vercel com: npx vercel --prod
- Transformar em PWA pra eu instalar o Meu IPTV na tela inicial do celular
  e abrir como app de verdade.

Está pronto quando:
- [ ] Meus dados estão no Supabase, não mais só no navegador
- [ ] Preciso fazer login pra entrar, e sem login não se vê nada
- [ ] O app abre pelo link da Vercel, do celular, fora de casa
- [ ] Consigo instalar na tela inicial do celular e abrir sem barra de navegador
```

---

## E depois? (Versão 2)

Está tudo anotado na seção 6 do `PLANO.md`: disparo automático de WhatsApp,
notificação matinal, relatórios com gráficos, comprovante de pagamento,
login próprio do revendedor e link de PIX na cobrança.
