# ✅ TESTING CHECKLIST — on.imob

Documento para validar funcionalidades **item por item** antes de vender.

---

## 🎯 TIER 1 — WhatsApp + Integrações

### WhatsApp 2-Way Bot

- [ ] **Teste 1:** Enviar mensagem para WhatsApp da imobiliária
  - Esperado: Bot responde automaticamente
  - Comando: `curl -X POST http://localhost:8000/api/whatsapp/webhook`

- [ ] **Teste 2:** Bot qualifica lead
  - Esperado: Sistema identifica tipo de imóvel + valor
  - Verificar: Database com histórico

- [ ] **Teste 3:** Histórico de conversas
  - Esperado: GET `/api/whatsapp/historico/{usuario_id}`
  - Retorna: Últimas 10 mensagens

- [ ] **Teste 4:** Context-aware com Gemini IA
  - Enviar pergunta complexa
  - Esperado: Resposta inteligente + sugestões

### VivaReal Integration

- [ ] **Teste 1:** Publicar imóvel
  - `POST /api/integracao/vivareal/publicar`
  - Esperado: 200 OK + listing_id

- [ ] **Teste 2:** Atualizar preço
  - `PATCH /api/integracao/vivareal/atualizar/{listing_id}`
  - Esperado: Preço atualizado em tempo real

- [ ] **Teste 3:** Receber leads
  - Verificar webhook: leads recebidos?
  - Confirmar: Armazenados no banco

- [ ] **Teste 4:** Despublicar
  - `DELETE /api/integracao/vivareal/{listing_id}`
  - Esperado: Removido do VivaReal

### ZapImóveis Integration

- [ ] **Teste 1:** Publicar imóvel
  - `POST /api/integracao/zapimovels/publicar`
  - Esperado: 200 OK

- [ ] **Teste 2:** Sincronizar preço
  - Atualizar em on.imob
  - Esperado: Atualizado em ZapImóveis (24h)

- [ ] **Teste 3:** Bidirecional
  - Atualizar em ZapImóveis
  - Esperado: Sincroniza em on.imob

---

## 🌐 TIER 2.1 — Site Auto-Gerado

### Site Generation

- [ ] **Teste 1:** Gerar site para imóvel
  - `POST /api/site/gerar`
  - Payload: `{imovel_id, descricao, fotos, preco}`
  - Esperado: Site HTML gerado em 2-5 segundos

- [ ] **Teste 2:** SEO Tags
  - Abrir site gerado
  - Verificar: Meta tags, Schema.org, Open Graph

- [ ] **Teste 3:** Imagens Responsivas
  - Testar em mobile (375px), tablet (768px), desktop (1920px)
  - Esperado: Layout se adapta perfeitamente

- [ ] **Teste 4:** Gallery com Lazy Loading
  - Scroll site
  - Verificar: Imagens carregam sob demanda (Network tab)

- [ ] **Teste 5:** CTA (Call-to-Action)
  - Clicar em "WhatsApp"
  - Esperado: Abre conversa no WhatsApp

- [ ] **Teste 6:** Google Maps
  - Verificar mapa do endereço
  - Esperado: Marcador correto

- [ ] **Teste 7:** Atualizar Site
  - `PATCH /api/site/{imovel_id}`
  - Esperado: Site atualizado em 2-5 segundos

- [ ] **Teste 8:** Deletar Site
  - `DELETE /api/site/{imovel_id}`
  - Esperado: Site removido

---

## 💳 TIER 2.2 — Portal Pagamento

### PIX

- [ ] **Teste 1:** Gerar QR Code PIX
  - `POST /api/pagamento/pix/gerar`
  - Esperado: QR code gerado (dados base64)

- [ ] **Teste 2:** Copiar chave PIX
  - Campo com chave PIX (123.456.789-10)
  - Esperado: Cópia para clipboard funciona

- [ ] **Teste 3:** Webhook PIX (mock)
  - Simular pagamento recebido
  - Esperado: Status muda para "Pago" (2-5 min)

### Boleto

- [ ] **Teste 1:** Gerar Boleto
  - `POST /api/pagamento/boleto/gerar`
  - Esperado: Boleto PDF gerado

- [ ] **Teste 2:** Linhas de Código
  - Copiar linha digitável
  - Esperado: Funciona em app de banco

- [ ] **Teste 3:** Webhook Boleto (mock)
  - Simular pagamento confirmado
  - Esperado: Status muda para "Pago"

### Cartão (Stripe)

- [ ] **Teste 1:** Formulário Seguro
  - Testar com cartão de teste Stripe
  - Dados: `4242 4242 4242 4242 | 12/25 | 123`
  - Esperado: Pagamento aprovado

- [ ] **Teste 2:** Recibos
  - `GET /api/pagamento/comprovante/{payment_id}`
  - Esperado: PDF com recibo baixa

- [ ] **Teste 3:** Rejeição de Cartão
  - Testar com cartão rejeitado: `4000 0000 0000 0002`
  - Esperado: Mensagem de erro clara

### Portal Geral

- [ ] **Teste 1:** Listar Pagamentos
  - `GET /api/pagamento/listar`
  - Esperado: Histórico com filtros

- [ ] **Teste 2:** Buscar por Status
  - Filtrar: "Pendente", "Pago", "Reembolsado"
  - Esperado: Filtragem funciona

- [ ] **Teste 3:** Exportar Relatório
  - `GET /api/pagamento/exportar/csv`
  - Esperado: CSV com todas as transações

---

## 📊 TIER 2.3 — Financeiro + Split

### Cash Flow

- [ ] **Teste 1:** Histórico 12 meses
  - `GET /api/financeiro/cash-flow`
  - Esperado: Gráfico com entrada/saída

- [ ] **Teste 2:** Previsão 3 meses
  - Esperado: Linha de tendência (ML)

- [ ] **Teste 3:** Alertas
  - Inadimplência detectada?
  - Esperado: Email + notificação

### ROI por Imóvel

- [ ] **Teste 1:** Calcular ROI
  - `POST /api/financeiro/roi`
  - Payload: `{imovel_id}`
  - Esperado: ROI % com período

- [ ] **Teste 2:** Ranking
  - `GET /api/financeiro/ranking`
  - Esperado: Imóveis ordenados por ROI

### Split Payment (Assas)

- [ ] **Teste 1:** Configurar Split
  - `POST /api/split/configurar/{imovel_id}`
  - Esperado: Split 95/5 (imobiliária/proprietário)

- [ ] **Teste 2:** Pagamento com Split
  - Criar pagamento via Assas
  - Esperado: Automático divide 95/5

- [ ] **Teste 3:** Extrato Proprietário
  - `GET /api/split/extrato/{proprietario_id}`
  - Esperado: Saldo devolvido

- [ ] **Teste 4:** Transferência Automática
  - Saldo >= R$100?
  - Esperado: Automático transfere para conta proprietário

### Dashboard CFO

- [ ] **Teste 1:** Visualizar KPIs
  - Total aluguéis, repassos, comissões, saldo
  - Esperado: Dashboard atualizado

- [ ] **Teste 2:** Comparativo Mês a Mês
  - Comparar Setembro vs Outubro
  - Esperado: Crescimento % mostrado

- [ ] **Teste 3:** Alertas de Anomalia
  - Anomalia detectada?
  - Esperado: Alert destacado em vermelho

---

## 🔐 TIER 3 — Login + Branding

### Login Page

- [ ] **Teste 1:** Login com Email/Senha
  - Email válido + senha correta
  - Esperado: Redirecionado para /dashboard

- [ ] **Teste 2:** Erro de Senha
  - Senha incorreta
  - Esperado: Mensagem "Email ou senha inválidos"

- [ ] **Teste 3:** Email Não Existe
  - Email fictício
  - Esperado: Erro genérico (segurança)

- [ ] **Teste 4:** Recuperar Senha
  - Clicar "Esqueceu a senha?"
  - Email recebido?
  - Esperado: Link de reset valido (24h)

### Cadastro Multi-step

- [ ] **Teste 1:** Passo 1 - Informações Básicas
  - Preencher: nome, email, tipo (imobiliário)
  - Clicar "Próximo"
  - Esperado: Validação OK, vai para passo 2

- [ ] **Teste 2:** Passo 2 - Dados Empresa
  - Aparece só para imobiliários?
  - Esperado: SIM

- [ ] **Teste 3:** Passo 3 - Senha
  - Força de senha: Weak → Strong
  - Esperado: Barra muda de cor (red → yellow → green)

- [ ] **Teste 4:** Confirmação de Senha
  - Senhas não batem
  - Esperado: Erro "As senhas não conferem"

- [ ] **Teste 5:** Termos de Serviço
  - Não aceitar termos
  - Esperado: Botão "Criar Conta" desabilitado

### Branding Customizável

- [ ] **Teste 1:** Configurar Logo
  - URL: `https://meu-site.com/logo.png`
  - Salvar
  - Esperado: Logo aparece em /login

- [ ] **Teste 2:** Cores
  - Cor primária: #FF0000
  - Cor secundária: #00FF00
  - Esperado: Login fica vermelho/verde

- [ ] **Teste 3:** Nome Imobiliária
  - Nome: "ABC Imobiliária"
  - Esperado: Aparece em /login como heading

- [ ] **Teste 4:** Tagline
  - Tagline: "Sua casa, nossa missão!"
  - Esperado: Aparece abaixo do nome

---

## 🏦 TIER 2.4 — Open Banking

### Autorização OAuth2

- [ ] **Teste 1:** Itaú — Conectar
  - Clicar "Conectar Itaú"
  - Fazer login no Itaú (teste)
  - Autorizar
  - Esperado: Token recebido, status "Conectado"

- [ ] **Teste 2:** Bradesco — Conectar
  - Mesmo processo
  - Esperado: Token recebido

- [ ] **Teste 3:** Santander — Conectar
  - Mesmo processo
  - Esperado: Token recebido

### Busca de Contas

- [ ] **Teste 1:** Listar Contas
  - `GET /api/open-banking/contas/itau/{token}`
  - Esperado: Lista de contas (corrente, poupança)

- [ ] **Teste 2:** Tipos de Conta
  - Tipo: "CHECKING", "SAVINGS"
  - Esperado: Identificado corretamente

### Transações

- [ ] **Teste 1:** Buscar Últimos 30 dias
  - `POST /api/open-banking/transacoes`
  - Data: Últimas 4 semanas
  - Esperado: 10-50 transações listadas

- [ ] **Teste 2:** Detalhes de Transação
  - Valor, descrição, data
  - Esperado: Todos os campos preenchidos

### Saldo em Tempo Real

- [ ] **Teste 1:** Buscar Saldo
  - `GET /api/open-banking/saldo/{banco}/{token}/{conta}`
  - Esperado: Saldo disponível + corrente

### Reconciliação

- [ ] **Teste 1:** Reconciliar Extratos
  - `POST /api/open-banking/reconciliar`
  - Sistema tem 20 transações, banco tem 22
  - Esperado: 20 reconciliadas, 2 faltando

- [ ] **Teste 2:** Percentual
  - 20/22 transações = 90.9%
  - Esperado: "Percentual reconciliação: 90.9%"

- [ ] **Teste 3:** Alertas
  - Divergência encontrada?
  - Esperado: Recomendação gerada

### Sincronização

- [ ] **Teste 1:** Sincronizar Agora
  - `POST /api/open-banking/sincronizar-agora/{banco}/{token}/{conta}`
  - Esperado: Transações baixadas em <5 segundos

- [ ] **Teste 2:** Configurar Automático
  - `POST /api/open-banking/sincronizar-automatico/...?intervalo_horas=24`
  - Esperado: "Prximo sync: amanhã às 14:30"

---

## 🎯 Landing Page

- [ ] **Teste 1:** Hero Section
  - CTA "Começar Gratuitamente"
  - Esperado: Redireciona para /cadastro

- [ ] **Teste 2:** Features Cards (9)
  - Verificar ícones + descrições
  - Esperado: Todos com hover effect

- [ ] **Teste 3:** Diferencial Section
  - Avaliação Científica destacada
  - Esperado: 80% confiança visível

- [ ] **Teste 4:** Pricing
  - 3 planos listados
  - Esperado: Professional em destaque

- [ ] **Teste 5:** Responsive
  - Testar em 375px, 768px, 1920px
  - Esperado: Layout se adapta

---

## ⚙️ Admin Settings

- [ ] **Teste 1:** Painel Access
  - GET /settings
  - Esperado: Painel carrega sem erros

- [ ] **Teste 2:** 9 Seções
  - Geral, Branding, Webhooks, Open Banking, Pagamentos, WhatsApp, Integrações, API, Segurança
  - Esperado: Todas acessíveis

- [ ] **Teste 3:** Webhooks Test
  - Clicar "Testar Todos"
  - Esperado: Status OK para 3 webhooks

- [ ] **Teste 4:** API Key Copiar
  - Copiar chave
  - Esperado: Copiada para clipboard

---

## 🚀 Deployment

- [ ] **Teste 1:** Docker
  - `./deploy.sh docker`
  - Esperado: App roda em http://localhost:8000

- [ ] **Teste 2:** Health Check
  - `curl http://localhost:8000/health`
  - Esperado: `{"status": "ok", ...}`

- [ ] **Teste 3:** Heroku (opcional)
  - `./deploy.sh heroku`
  - Esperado: Deployed em https://on-imob-api.herokuapp.com

- [ ] **Teste 4:** Logs
  - Ver logs de deployment
  - Esperado: Nenhum erro vermelho

---

## 📝 Resumo

**Testes por Tier:**

| Tier | Tests | Status |
|------|-------|--------|
| 1 (WhatsApp + Integrações) | 8 | ⬜⬜⬜⬜⬜⬜⬜⬜ |
| 2.1 (Site Auto-gerado) | 8 | ⬜⬜⬜⬜⬜⬜⬜⬜ |
| 2.2 (Pagamentos) | 13 | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| 2.3 (Financeiro + Split) | 11 | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| 3 (Login + Branding) | 12 | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| 2.4 (Open Banking) | 10 | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| Landing + Admin | 9 | ⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| Deployment | 4 | ⬜⬜⬜⬜ |

**TOTAL: 75 testes**

---

## 📞 Checklist de Venda

Quando todos os testes passarem ✅:

- [ ] Criar conta de teste
- [ ] Testar fluxo completo (lead → pagamento)
- [ ] Preparar documentação
- [ ] Treinar equipe
- [ ] Configurar suporte
- [ ] Preparar landing page
- [ ] Segurança: HTTPS + SSL
- [ ] Backup automático ativo
- [ ] Monitoramento ativo
- [ ] **LANÇAR! 🎉**
