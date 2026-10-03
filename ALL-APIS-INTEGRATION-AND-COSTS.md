# 🔌 Todas as APIs - Integração, Setup & Custos Consolidados

**Data**: 2026-10-02

---

## 📊 RESUMO EXECUTIVO - Custos de Todas as APIs

| API | Setup | Custo/Mês | Por Cliente | Status |
|-----|-------|-----------|-------------|--------|
| **Meta (Facebook/Instagram)** | GRÁTIS | **R$0** | R$0 | ✅ Grátis |
| **Google Ads** | GRÁTIS | **R$0** | R$0 | ✅ Grátis |
| **TikTok Ads** | GRÁTIS | **R$0** | R$0 | ✅ Grátis |
| **LinkedIn Ads** | GRÁTIS | **R$0** | R$0 | ✅ Grátis |
| **TOTAL APIs** | **GRÁTIS** | **R$0** | **R$0** | ✅ |

---

## 🎯 IMPORTANTE: Não Pagamos Pelas APIs!

```
❌ ERRADO: "Preciso pagar para usar Meta API"
❌ ERRADO: "Google Ads API cobra taxa"
❌ ERRADO: "TikTok API é paga"

✅ CORRETO: TODAS as APIs de publicidade são GRÁTIS para integrar
✅ O cliente PAGA pelos anúncios (ad spend) direto para a plataforma
✅ ADS Inteligente recebe 0% de custo de API
```

---

# 🔗 META ADS API - Setup & Integração

## Como Funciona

```
Cliente quer rodar anúncio na Meta
    ↓
ADS Inteligente envia comando via Meta API (GRÁTIS)
    ↓
Meta publica anúncio
    ↓
Cliente paga Meta diretamente (ad spend)
    ↓
ADS Inteligente não paga nada à Meta
```

## Setup: 4 Passos

### Passo 1: Criar App (GRÁTIS)
```
1. Ir para https://developers.facebook.com/
2. Clique "Create App"
3. Escolha "Business" como tipo
4. Preencha: app name, email, app purpose
5. Receba: App ID + App Secret (guardar seguro!)
```

### Passo 2: Obter Permissões (GRÁTIS)
```
Solicitar permissões:
✅ ads_management (criar/editar campanhas)
✅ ads_read (ler dados de campanhas)
✅ campaigns_read_create (CRUD campanhas)
✅ pages_read_engagement (ler páginas)

Isso é tudo GRÁTIS!
```

### Passo 3: Gerar Access Token (GRÁTIS)
```
Opção A - User Token (desenvolvimento):
- Logar como admin da conta Meta
- Gerar token pessoal
- Válido enquanto usuário ativo

Opção B - System User Token (produção):
- Criar System User na app
- Gerar token para automação
- Válido indefinidamente
- RECOMENDADO para produção
```

### Passo 4: Começar Chamadas API (GRÁTIS)
```
Exemplo de chamada:

POST /v17.0/123456789/campaigns
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Campanha Meu Produto",
  "objective": "CONVERSIONS",
  "status": "PAUSED",
  "daily_budget": 5000  ← em centavos (R$50)
}

CUSTO: R$0 para fazer esta chamada
Cliente PAGA: R$50/dia em ads (vai direto para Meta)
```

## Limites & Rate Limits (Meta)

| Limite | Valor | Suficiente? |
|--------|-------|------------|
| **Requisições/segundo** | 25 | ✅ Sim (1000+ clientes) |
| **Batch requests** | 50/call | ✅ Sim |
| **Concurrent** | Ilimitado | ✅ Sim |
| **Webhook throughput** | Ilimitado | ✅ Sim |

---

# 🎵 TIKTOK ADS API - Setup & Integração

## Como Funciona

```
Cliente quer rodar anúncio no TikTok
    ↓
ADS Inteligente envia comando via TikTok API (GRÁTIS)
    ↓
TikTok publica anúncio
    ↓
Cliente paga TikTok diretamente (ad spend)
    ↓
ADS Inteligente não paga nada
```

## Setup: 5 Passos

### Passo 1: Registrar App (GRÁTIS)
```
1. Ir para https://business.tiktok.com/
2. Clique "Apps"
3. "Create App"
4. Escolha: "TikTok Ads"
5. Preencha: app name, description
6. Receba: Client ID + Client Secret
```

### Passo 2: Setup OAuth (GRÁTIS)
```
Configurar Redirect URI:
https://seu-app.com/oauth/tiktok/callback

Escopos necessários:
✅ ad_read (ler anúncios)
✅ ad_create (criar anúncios)
✅ ad_manage (editar anúncios)
```

### Passo 3: Obter Credenciais (GRÁTIS)
```
Autenticar cliente:
1. Redirecionar para TikTok login
2. Cliente autoriza acesso
3. Receber code de autorização
4. Trocar code por Access Token (válido 2 horas)
5. Usar Refresh Token para renovar

TUDO GRÁTIS!
```

### Passo 4: Criar Campanha (GRÁTIS)
```
POST /v1.3/oauth2/ad/campaigns/create
Authorization: Bearer {access_token}

{
  "advertiser_id": "1234567890",
  "campaign_name": "Promoção Verão",
  "budget": 50000,  ← em centavos (R$500)
  "budget_mode": "DAILY",
  "objective_type": "SALES"
}

CUSTO: R$0 para fazer esta chamada
Cliente PAGA: R$500 em ads (vai direto para TikTok)
```

### Passo 5: Gerenciar Anúncios (GRÁTIS)
```
Endpoints disponíveis (todos GRÁTIS):
✅ GET /v1.3/campaigns (listar)
✅ POST /v1.3/campaigns/update (editar)
✅ POST /v1.3/ads/create (criar ad)
✅ GET /v1.3/reports (analytics)
✅ POST /v1.3/optimizer/recommendations (AI)
```

## Limites & Rate Limits (TikTok)

| Limite | Valor | Suficiente? |
|--------|-------|------------|
| **Requisições/segundo** | 10 | ✅ Sim (500+ clientes) |
| **Batch requests** | 100/call | ✅ Sim |
| **Daily quota** | Ilimitado | ✅ Sim |
| **Webhook throughput** | Ilimitado | ✅ Sim |

---

# 🔍 GOOGLE ADS API - Setup & Integração

## Como Funciona

```
Cliente quer rodar anúncio no Google
    ↓
ADS Inteligente envia comando via Google Ads API (GRÁTIS)
    ↓
Google publica anúncio
    ↓
Cliente paga Google diretamente (ad spend)
    ↓
ADS Inteligente não paga nada
```

## Setup: 5 Passos

### Passo 1: Criar Google Cloud Project (GRÁTIS)
```
1. Ir para console.cloud.google.com
2. Criar novo projeto
3. Nome: "ADS Inteligente"
4. Clique "Create"
5. Aguarde criação (2 min)
```

### Passo 2: Habilitar API (GRÁTIS)
```
1. Search "Google Ads API" no Cloud Console
2. Clique "Enable"
3. Espere (1 min)
4. Pronto!

CUSTO: R$0
```

### Passo 3: Criar Service Account (GRÁTIS)
```
1. Ir para "Credentials"
2. Create Credentials → Service Account
3. Nome: "ads-inteligente-api"
4. Descrição: "API for campaign management"
5. Create and Continue
6. Conceder role: "Editor"
7. Pronto!
```

### Passo 4: Gerar API Key (GRÁTIS)
```
1. Clique em service account criada
2. Ir para "Keys"
3. "Add Key" → Create new key
4. Tipo: JSON
5. Download (guardar seguro!)
6. Pronto!
```

### Passo 5: Adicionar à Conta do Cliente (GRÁTIS)
```
1. Cliente vai em Google Ads Manager
2. Vai para "Admin" → "Access and security"
3. Adiciona service account como manager
4. Libera acesso
5. Pronto!

TUDO GRÁTIS!
```

## Limites & Rate Limits (Google)

| Limite | Valor | Suficiente? |
|--------|-------|------------|
| **Queries/dia** | 10.000 | ✅ Sim (1000+ clientes) |
| **Queries/minuto** | 60 | ✅ Sim |
| **Concurrent** | 10 | ✅ Sim |
| **Mutation/dia** | 10.000 | ✅ Sim |

---

# 💼 LINKEDIN ADS API - Setup & Integração

## Como Funciona

```
Cliente quer rodar anúncio no LinkedIn
    ↓
ADS Inteligente envia comando via LinkedIn API (GRÁTIS)
    ↓
LinkedIn publica anúncio
    ↓
Cliente paga LinkedIn diretamente (ad spend)
    ↓
ADS Inteligente não paga nada
```

## Setup: 4 Passos

### Passo 1: Registrar Aplicação (GRÁTIS)
```
1. Ir para https://www.linkedin.com/developers/
2. Clique "Create app"
3. Preencha:
   - App name: "ADS Inteligente"
   - LinkedIn Page: Selecionar página
   - App logo: Fazer upload
4. Concorde com termos
5. Clique "Create app"
6. Receba: Client ID + Client Secret
```

### Passo 2: Configurar OAuth (GRÁTIS)
```
Redirect URI:
https://seu-app.com/oauth/linkedin/callback

Escopos necessários:
✅ r_ads (read ads)
✅ w_ads (write ads)
✅ r_ads_analytics (read analytics)
✅ w_member_social (post content)
```

### Passo 3: Obter Access Token (GRÁTIS)
```
1. Cliente clica "Connect LinkedIn"
2. Autoriza ADS Inteligente
3. Recebe access token (válido 2 meses)
4. Usar para fazer chamadas

CUSTO: R$0
```

### Passo 4: Criar Campanha (GRÁTIS)
```
POST /v2/adCampaigns
Authorization: Bearer {access_token}

{
  "name": "Campanha LinkedIn",
  "account": "urn:li:sponsoredAccount:123456",
  "costType": "CPM",
  "objective": "LEAD_GENERATION",
  "budget": 50000  ← em centavos (R$500)
}

CUSTO: R$0 para fazer esta chamada
Cliente PAGA: R$500 em ads (vai direto para LinkedIn)
```

## Limites & Rate Limits (LinkedIn)

| Limite | Valor | Suficiente? |
|--------|-------|------------|
| **Requisições/segundo** | 5 | ✅ Sim (250+ clientes) |
| **Batch requests** | 50/call | ✅ Sim |
| **Daily quota** | Ilimitado | ✅ Sim |

---

# 💰 CONSOLIDAÇÃO DE CUSTOS - Todas as APIs

## Custo Direto das APIs (para ADS Inteligente)

### Por 1 Cliente/Mês
```
Meta API:    R$0
Google API:  R$0
TikTok API:  R$0
LinkedIn API: R$0
─────────────────
TOTAL:       R$0 ✅
```

### Por 1.000 Clientes/Mês
```
Meta API:    R$0 × 1.000 = R$0
Google API:  R$0 × 1.000 = R$0
TikTok API:  R$0 × 1.000 = R$0
LinkedIn API: R$0 × 1.000 = R$0
─────────────────────────────
TOTAL:       R$0 ✅
```

---

## Custo Total do Sistema (com todas as despesas)

### Para 1.000 Clientes/Mês

| Categoria | Custo | % ARPU |
|-----------|-------|--------|
| **APIs (Meta, Google, TikTok, LinkedIn)** | **R$0** | **0%** |
| Infraestrutura (Render) | R$1.010 | 0.17% |
| Banco de Dados | R$400 | 0.07% |
| IA (Gemini) | R$68 | 0.01% |
| Cache (Redis) | R$200 | 0.03% |
| CDN (CloudFlare) | R$500 | 0.08% |
| Web Scraping (Supadata) | R$800 | 0.13% |
| Monitoring (Datadog) | R$1.500 | 0.25% |
| Email (SendGrid) | R$100 | 0.02% |
| Payment (Stripe) | R$1.761 | 0.29% |
| Analytics | R$300 | 0.05% |
| Mobile (Firebase) | R$1.500 | 0.25% |
| **TOTAL OPERACIONAL** | **R$7.639** | **1.27%** |

---

## O Que o Cliente Paga (Ad Spend)

```
IMPORTANTE: Cliente paga pelos ANÚNCIOS na Meta/Google/TikTok/LinkedIn!

Exemplo:
Cliente contrata ADS Inteligente (R$599/mês)
Cliente também gasta em anúncios: R$5.000/mês
    ├─ R$599 → ADS Inteligente recebe
    └─ R$5.000 → Meta/Google/TikTok/LinkedIn recebem (direto)

ADS Inteligente NOT paga pelas APIs = R$0

Se usar Revenue Share:
    ├─ Cliente paga R$0/mês fixo
    └─ ADS recebe 15% do ad spend = 15% de R$5.000 = R$750
```

---

## Comparativo: Onde o Dinheiro Vai

```
Cliente gasta: R$5.000/mês em anúncios

MODELO 1: Plano Mensal (R$599)
├─ ADS Inteligente: R$599
├─ Meta/Google/TikTok/LinkedIn: R$5.000
└─ Total Cliente: R$5.599/mês

MODELO 2: Revenue Share (R$0 + 15%)
├─ ADS Inteligente: 15% × R$5.000 = R$750
├─ Meta/Google/TikTok/LinkedIn: R$5.000
└─ Total Cliente: R$5.750/mês
```

---

## Custos Reais Para ADS Inteligente

### Sempre R$0 pelas APIs!

| Plano | Ad Spend Cliente | Receita ADS | Custo Operacional | Lucro |
|------|------------------|-------------|-------------------|-------|
| **Mensal (R$599)** | Qualquer | R$599 | R$7.64 | R$591.36 |
| **Revenue Share (15%)** | R$0 | R$0 | R$7.64 | -R$7.64 |
| **Revenue Share (R$5k)** | R$5.000 | R$750 | R$7.64 | R$742.36 |
| **Revenue Share (R$10k)** | R$10.000 | R$1.500 | R$7.64 | R$1.492.36 |

---

# 🔧 COMO PAGAR PELAS APIs

## A Resposta: NÃO PRECISA PAGAR!

```
❌ Meta não cobra pela API
❌ Google não cobra pela API
❌ TikTok não cobra pela API
❌ LinkedIn não cobra pela API

✅ APIs são GRÁTIS para integrar

Quem PAGA:
└─ O Cliente paga pela publicidade (ad spend) direto na plataforma
```

## O Cliente Paga Por Quê?

### 1. Ad Spend (Anúncios)
```
Cliente cria campanha: R$5.000/mês
Isso é pago DIRETO para Meta/Google/TikTok/LinkedIn
ADS Inteligente: R$0 em custo de API
```

### 2. Plano ADS Inteligente
```
Starter: R$299/mês
Professional: R$599/mês
Plus: R$999/mês
```

### 3. Revenue Share (alternativa)
```
Cliente paga R$0/mês fixo
ADS recebe 15% dos ads que o cliente vender
```

---

# 📊 EXEMPLO REAL - Cliente Vendendo Via ADS

## Cenário: E-commerce com ADS Inteligente

```
Cliente é um vendedor de roupas:

Mês 1:
├─ Contrata ADS Professional: R$599/mês
├─ Gasta em anúncios: R$2.000/mês (paga direto para Meta)
├─ Vende R$8.000 com os anúncios
├─ Lucro: R$8.000 - R$2.000 (ads) - R$599 (ADS) = R$5.401
└─ ADS custo interno: R$7.64 (operacional)
    └─ Lucro ADS: R$599 - R$7.64 = R$591.36

Mês 2:
├─ Campanha vai melhor
├─ Gasta em anúncios: R$5.000/mês (paga direto para Meta)
├─ Vende R$25.000
├─ Lucro: R$25.000 - R$5.000 - R$599 = R$19.401
└─ ADS lucro: R$599 - R$7.64 = R$591.36
```

---

# 🎯 ESTRUTURA FINAL DE CUSTOS

## ADS Inteligente: R$7.64/cliente/mês de operação

| Item | Custo |
|------|-------|
| Infraestrutura | R$3.41 |
| IA (Gemini) | R$0.07 |
| Scraping (Supadata) | R$0.80 |
| Monitoring | R$1.50 |
| Pagamento (Stripe) | R$1.76 |
| Outros | R$0.40 |
| **TOTAL** | **R$7.64** |

## APIs: R$0/cliente/mês

```
Meta API:     R$0
Google API:   R$0
TikTok API:   R$0
LinkedIn API: R$0
────────────────
TOTAL:        R$0
```

---

# ✅ CONCLUSÃO

### Custos de Integração das APIs

| API | Setup | Manutenção | Por Cliente | Total |
|-----|-------|-----------|-------------|-------|
| **Meta** | R$0 | R$0 | R$0 | ✅ GRÁTIS |
| **Google** | R$0 | R$0 | R$0 | ✅ GRÁTIS |
| **TikTok** | R$0 | R$0 | R$0 | ✅ GRÁTIS |
| **LinkedIn** | R$0 | R$0 | R$0 | ✅ GRÁTIS |

### Quem Paga o Quê

```
ADS Inteligente PAGA:
├─ Infraestrutura (servidor, BD, etc): R$7.64/cliente/mês
└─ NÃO PAGA pelas APIs

Cliente PAGA:
├─ Plano ADS: R$299-999/mês (ou 15% revenue share)
└─ Anúncios direto na plataforma: R$X/mês (vai para Meta/Google/etc)
```

### Modelo é Altamente Lucrativo

```
Revenue Mensal: R$599 (plano) + R$X (revenue share)
Custo Operacional: R$7.64
Lucro Bruto: R$591.36 (plano) ou R$X (revenue share)
Margem: 98.7% 🚀

APIs Não Custam Nada! ✅
```

---

Generated: 2026-10-02
