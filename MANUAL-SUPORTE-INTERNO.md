# 📘 MANUAL DE SUPORTE — on.imob (Interno)

## 🎯 Bem-vindo ao Time de Suporte

Este manual cobre TUDO que o suporte precisa saber para ajudar clientes com on.imob.

---

## 📋 ÍNDICE

1. [Onboarding Rápido](#onboarding)
2. [Arquitetura do Produto](#arquitetura)
3. [Fluxos Principais](#fluxos)
4. [Troubleshooting](#troubleshooting)
5. [Escalações](#escalacoes)
6. [SLAs e Métricas](#slas)

---

## 🚀 Onboarding {#onboarding}

### Primeiros 7 Dias (Crítico)

**Dia 1: Importação de Dados**
- Cliente vem de Jetimob/Imobisoft/SICADI
- Guie para `/api/import/preview` (não salva nada)
- Se tiver erro, veja seção "Troubleshooting: Import"

**Dia 2-3: Setup Básico**
- Configurar branding (logo, cores)
- Integração VivaReal
- Se Professional: integração ZapImóveis
- Se Enterprise: Open Banking

**Dia 4-5: Primeiro Imóvel**
- Cliente insere dados do imóvel
- Sistema gera avaliação científica (5 segundos)
- Cliente recebe PDF
- Publica no VivaReal

**Dia 6-7: Primeiro Lead**
- Cliente qualifica um lead (prospect)
- Usa WhatsApp 2-way com IA
- IA sugere próximas ações

### KPIs de Onboarding

```
✓ Taxa de ativação: >70% em dia 7
✓ Imóvel publicado: >80% em dia 14
✓ Primeiro lead qualificado: >60% em dia 7
✓ Churn após onboarding: <5%
```

---

## 🏗️ Arquitetura do Produto {#arquitetura}

### Módulos Principais

```
on.imob
├── CRM (Leads + Proprietários)
│   ├─ Cadastro de contatos
│   ├─ Histórico de interações
│   ├─ Funil de vendas
│   └─ Scoring automático
│
├── Avaliação Científica
│   ├─ Regressão estatística
│   ├─ NBR 14.653 compliance
│   ├─ Intervalo confiança 80%
│   └─ PDF gerado automaticamente
│
├── IA Assistant (Gemini)
│   ├─ WhatsApp 2-way
│   ├─ Qualificação automática
│   ├─ Sugestões de ações
│   └─ Histórico persistente
│
├── Integrações
│   ├─ VivaReal (publish/sync)
│   ├─ ZapImóveis (publish/sync)
│   ├─ Open Banking (Itaú/Bradesco/Santander)
│   └─ Nota Fiscal SEFAZ
│
├── Pagamentos
│   ├─ PIX (0% taxa)
│   ├─ Boleto (2,49% taxa)
│   ├─ Cartão via Stripe (2,99% taxa)
│   └─ Split automático 95/5
│
├── Financeiro
│   ├─ Dashboard em tempo real
│   ├─ Comissões por corretor
│   ├─ Cash flow 12 meses
│   └─ Alertas de inadimplência
│
├── Vistoria (DIFERENCIAL)
│   ├─ App com câmera
│   ├─ Checklist automático
│   ├─ Fotos geolocalizadas
│   └─ Relatório PDF
│
├── Sites Automáticos
│   ├─ Por imóvel (SEO-otimizado)
│   ├─ Schema.org JSON-LD
│   ├─ WhatsApp/Email CTA
│   └─ Responsive mobile
│
└── App Nativo
    ├─ iOS + Android
    ├─ Publicação de imóveis
    ├─ Qualificação de leads
    ├─ Vistoria com câmera
    └─ Notificações push
```

---

## 🔄 Fluxos Principais {#fluxos}

### Fluxo 1: Novo Lead

```
1. Cliente recebe lead (WhatsApp/email)
   ├─ Cadastra em on.imob
   └─ Adiciona notas/tags
   
2. Sistema envia IA sugestões
   ├─ "Pergunte sobre tipo de imóvel"
   ├─ "Envie link com 3 opções"
   └─ "Agende vistoria"
   
3. Conversa persistente
   ├─ Histórico no CRM
   ├─ Última ação em destaque
   └─ Pontuação de interesse
   
4. Lead qualificado ou descartado
   ├─ Status: Prospect → Negociando → Vendido
   └─ Comissão calculada automaticamente
```

### Fluxo 2: Novo Imóvel

```
1. Cliente insere dados básicos (2 min)
   ├─ Endereço
   ├─ Tipo (apto/casa/comercial)
   ├─ Quartos/banheiros
   └─ Características

2. Sistema calcula avaliação (5 seg)
   ├─ Regressão estatística
   ├─ Market data análise
   ├─ Comparação similares
   └─ Gera PDF automaticamente

3. Cliente recebe documento
   ├─ Tabelas + gráficos
   ├─ Intervalo confiança
   ├─ Valor justo comprovado
   └─ Pode compartilhar com proprietário

4. Publicação automática
   ├─ VivaReal (1 clique)
   ├─ ZapImóveis (Professional+)
   ├─ Site próprio gerado
   └─ WhatsApp/Email CTA

5. Sincronização
   ├─ Preço atualizado? Sincroniza
   ├─ Vendido? Despublica automaticamente
   └─ Novo lead? Notificação push
```

### Fluxo 3: Pagamento + Split

```
1. Cliente recebe depósito
   ├─ PIX: instantâneo (0% taxa)
   ├─ Boleto: 2-5 dias (2,49% taxa)
   └─ Cartão: 3 dias úteis (2,99% taxa)

2. Split automático (95/5)
   ├─ 95% para imobiliária
   ├─ 5% para proprietário
   └─ Tudo via Assas

3. Proprietário recebe
   ├─ Saldo em tempo real
   ├─ Pode solicitar transferência
   ├─ Comprovante PDF automático
   └─ Sem intermediários

4. Conciliação com banco
   ├─ Open Banking (se Enterprise)
   ├─ Saldo atualizado 24/7
   ├─ Alertas de discrepâncias
   └─ Reconciliação automática
```

### Fluxo 4: Vistoria

```
1. Corretor clica "Agendar Vistoria"
   ├─ App abre câmera
   ├─ Seleciona checklist pré-definido
   └─ Começa vistoria

2. Durante vistoria
   ├─ Tira fotos (geolocalizadas automaticamente)
   ├─ Marca problemas (infiltração, rachadura, etc)
   ├─ Adiciona notas por cômodo
   └─ GPS registra localização exata

3. Termina vistoria
   ├─ Sistem gera relatório PDF
   ├─ Inclui fotos + notas + checklist
   ├─ Envia para cliente automaticamente
   └─ Salva no CRM

4. Follow-up automático
   ├─ IA sugere: "Enviar relatório ao proprietário"
   ├─ Cliente envia via WhatsApp
   └─ Rastreia abertura (se enviado digitalmente)
```

---

## 🛠️ Troubleshooting {#troubleshooting}

### Problema: Avaliação não gera PDF

**Sintomas:**
- Cliente insere dados, clica "Gerar Avaliação"
- Página fica carregando >5 segundos
- Nenhum PDF recebido

**Diagnóstico:**
```bash
# Verificar se Gemini API está respondendo
curl https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent

# Verificar fila de processamento
SELECT COUNT(*) FROM evaluations WHERE status='processing' AND created_at < NOW() - INTERVAL 10 MINUTE;

# Se houver registros >10 min, há travamento
```

**Solução:**
1. Verificar quota Gemini (limite 1000 req/min)
2. Se excedido, aguardar 60 segundos
3. Se erro de timeout, reintentar (idempotente)
4. Se persistir, escale para Time de Engenharia

---

### Problema: Import de dados falha

**Sintomas:**
- Cliente faz upload de CSV
- Preview mostra erro "Arquivo inválido"

**Diagnóstico:**
```bash
# Verificar formato esperado
SELECT * FROM import_logs WHERE status='error' ORDER BY created_at DESC LIMIT 1;

# Possíveis erros:
# 1. Encoding: deve ser UTF-8
# 2. Delimitador: deve ser "," ou ";"
# 3. Cabeçalhos: devem ser exatos (case-sensitive)
# 4. Linhas vazias: remove antes de upload
```

**Solução:**
1. Peça cliente para verificar encoding (UTF-8)
2. Abra em Excel e salve como "CSV UTF-8"
3. Remova linhas vazias
4. Verifique nomes das colunas (devem corresponder ao mapeamento)
5. Tente upload de novo

---

### Problema: WhatsApp IA não responde

**Sintomas:**
- Cliente escreve no WhatsApp
- Sem resposta automática
- Fila de mensagens aumenta

**Diagnóstico:**
```bash
# Verificar status do webhook Meta
SELECT * FROM webhooks_status WHERE platform='whatsapp' ORDER BY updated_at DESC LIMIT 1;

# Verificar fila Gemini
SELECT COUNT(*) FROM ai_queue WHERE status='pending' AND created_at < NOW() - INTERVAL 5 MINUTE;
```

**Solução:**
1. Verificar se webhook Meta está ativo (dashboard Meta)
2. Se fila > 1000, há gargalo (contact eng team)
3. Verificar if Gemini API token é válido
4. Se tudo OK, força reprocessamento: `UPDATE ai_queue SET retries = 0 WHERE status = 'failed';`

---

### Problema: Split não funcionando

**Sintomas:**
- Pagamento recebido (PIX OK)
- Proprietário não recebe parte dele (5%)
- Só imobiliária recebe (95%)

**Diagnóstico:**
```bash
# Verificar configuração split por imóvel
SELECT * FROM splits WHERE imovel_id = ? AND status = 'active';

# Se vazio, split nunca foi criado
# Se inativo, foi desativado
```

**Solução:**
1. Verificar if cliente configurou split (Settings > Split Automático)
2. Se não, guie: "Settings > Split > Configurar Split"
3. Adicione dados de bancários proprietário
4. Teste com transação pequena (R$ 1)
5. Se OK, reprocesse transações anteriores

---

## 📞 Escalações {#escalacoes}

### Level 1: Suporte (Seu Nível)
- ✅ Onboarding
- ✅ Setup de integrações
- ✅ Troubleshooting básico
- ✅ FAQ
- ✅ Retenção

### Level 2: Engenharia (Escalação)
- ❌ Bugs profundos (API error 500)
- ❌ Performance issues (>2s latência)
- ❌ Problemas com Gemini API
- ❌ Problemas com Open Banking
- ❌ Problemas com Split (Assas)

**Como escalar:**
```
Ticket no Jira:
├─ Título: "[ESCALATION] WhatsApp IA não responde"
├─ Descrição: Cliente X, issue Y, tentativas Z
├─ Logs: [copiar erros relevantes]
├─ Prioridade: P1 (crítico), P2 (alto), P3 (normal)
└─ Assign: @eng-team

Seguir: "SLA Level 2 = 2h resposta, 4h solução"
```

---

## 📊 SLAs e Métricas {#slas}

### Tempos de Resposta

| Canal | SLA Resposta | SLA Resolução |
|-------|---|---|
| Email | 12h | 24h |
| WhatsApp | 2h | 4h |
| Chat | 1h | 2h |
| Telefone | 30min | 1h |

### Métricas de Saúde

```
✓ CSAT (Customer Satisfaction): >4.5/5.0
✓ NPS (Net Promoter Score): >50
✓ First Contact Resolution: >70%
✓ Churn Rate: <2% mensal
✓ Ticket Volume: <10 por cliente/mês
```

### Dashboard de Suporte

```
Diariamente:
├─ Tickets novos: ? (meta <5/dia)
├─ Resolvidos hoje: ? (meta >80% SLA)
├─ Escalações: ? (meta <10%)
└─ CSAT: ? (meta >4.5)

Semanalmente:
├─ Churn (cancelamentos): ? (meta <2%)
├─ Satisfação média: ? (meta >4.5)
├─ Problemas recorrentes: ? (encaminhar para produto)
└─ Tendências: ?
```

---

## 💡 Dicas para Excelência

### Comunicação
- ✅ Sempre confirme o problema (repetir back)
- ✅ Use linguagem simples (sem jargão técnico)
- ✅ Seja empático ("Entendo sua frustração")
- ✅ Ofereça soluções alternativas
- ✅ Sempre termine com "Posso ajudar com mais algo?"

### Troubleshooting
- ✅ Comece pelo mais óbvio (refresh page, logout/login)
- ✅ Peça logs/screenshots (reproduzir problema)
- ✅ Isole variáveis (navegador, dispositivo, internet)
- ✅ Documente tudo (futuros tickets podem ter mesmo issue)
- ✅ Se não souber, escale (não adivinhe)

### Retenção
- ✅ Responda rápido (2h máximo)
- ✅ Seja proativo (antes do cliente reclamar)
- ✅ Ofereça features que ele não conhece
- ✅ Pergunte: "Como está indo?"
- ✅ Se pensar em cancelar, ofereça desconto (30 dias)

---

## 📞 Contatos Importantes

```
Time de Engenharia: eng@on-imob.com
Head de Produto: product@on-imob.com
Gestor de Suporte: [seu-gestor]
Banco de Dados: db-admin@on-imob.com
Infra (Render/Stripe/etc): infra@on-imob.com
```

---

## 🎓 Treinamento Contínuo

**Semana 1:** Onboarding (você está aqui)
**Semana 2:** Troubleshooting prático
**Semana 3:** Escalações e edge cases
**Semana 4:** Retenção e upsell
**Mês 2+:** Especialista em domínio (imobiliário, técnico, etc)

---

**Bem-vindo ao time! Qualquer dúvida, pergunte. 🚀**
