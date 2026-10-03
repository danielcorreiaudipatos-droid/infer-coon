# 💰 ANÁLISE DE CUSTOS & PRECIFICAÇÃO — on.imob

## Estrutura de Custos (COGS)

### 1️⃣ **RENDER (Hosting)**

| Item | Custo |
|------|-------|
| Web Service (Backend FastAPI) | R$ 39/mês (Starter) |
| PostgreSQL Database | R$ 15/mês (Starter) |
| Redis Cache | R$ 15/mês (Starter) |
| **Total Render (Base)** | **R$ 69/mês** |
| **Por cliente (100 clientes)** | **R$ 0,69/cliente** |
| **Por cliente (10 clientes)** | **R$ 6,90/cliente** |

**Scaling com crescimento:**
- 100 clientes → Standard (R$ 150/mês Render)
- 500 clientes → Pro (R$ 300/mês Render)
- 1.000+ clientes → Enterprise (R$ 1.000/mês Render)

---

### 2️⃣ **GEMINI AI (Avaliação + IA Assistant)**

**Pricing Gemini 1.5 Flash (modelo atual):**
- Leitura: R$ 0,0015 por 1.000 tokens
- Escrita: R$ 0,006 por 1.000 tokens

**Custo por operação:**

#### Avaliação Científica (1 call)
```
Prompt input: ~2.000 tokens @ R$ 0,0015 = R$ 0,003
Resposta: ~1.000 tokens @ R$ 0,006 = R$ 0,006
────────────────────────────────────
Custo por avaliação: ~R$ 0,009 (arredonda R$ 0,01)
```

#### WhatsApp IA (1 conversa média 5 mensagens)
```
5 mensagens × 500 tokens médios = 2.500 tokens
Input: R$ 0,0015 × 2,5 = R$ 0,0037
Output: R$ 0,006 × 2,5 = R$ 0,015
────────────────────────────────────
Custo por conversa: ~R$ 0,02
```

**Por cliente (mensal):**
- Avaliações: 50 imóveis/cliente × R$ 0,01 = **R$ 0,50**
- WhatsApp: 10 conversas/dia × 30 dias × R$ 0,02 = **R$ 6,00**
- **Total IA por cliente: R$ 6,50/mês**

---

### 3️⃣ **SUPADATA (Web Scraping - Market Data)**

**Pricing Supadata:**
- Crawl: R$ 0,005 por página
- Extract: R$ 0,01 por página
- Transcript: R$ 0,02 por página

**Casos de uso em on.imob:**

#### Sincronização de Dados (para regressão)
```
Dados para modelo: 100 imóveis similares/mês
100 × R$ 0,015 (crawl + extract) = R$ 1,50/cliente/mês
```

#### Atualização de Preços (VivaReal/ZapImóveis)
```
Automático 1x/semana por imóvel
50 imóveis × 4 semanas = 200 queries
200 × R$ 0,015 = R$ 3,00/cliente/mês
```

**Total Supadata por cliente: R$ 4,50/mês**

*(Pode ser otimizado com cache: R$ 2,00/mês)*

---

### 4️⃣ **CUSTOS OPCIONAIS**

| Serviço | Custo | Notas |
|---------|-------|-------|
| Stripe (pagamentos) | 2,99% + R$ 0,30/tx | Por transação |
| Assas (split) | 1% + R$ 0,50/tx | Por transação |
| Open Banking (Itaú/Bradesco) | R$ 0/mês | Incluído no modelo |
| Nota Fiscal (SEFAZ) | R$ 5-10/mês | Por cliente |
| DMOB | R$ 0/mês | Incluído |
| **Total Opcional** | **~R$ 10/mês** | *Sob demanda* |

---

## 📊 TOTAL COGS POR CLIENTE

| Custo | Valor/Mês |
|------|-----------|
| **Render (hosting)** | R$ 0,69 (100 clientes) |
| **Gemini IA** | R$ 6,50 |
| **Supadata** | R$ 4,50 |
| **Opcional** | R$ 10,00 |
| **TOTAL COGS** | **R$ 21,69** |
| **Margem bruta (R$ 99)** | **77%** |
| **Margem bruta (R$ 299)** | **93%** |

---

## 💵 CÁLCULO DE PREÇOS

### **Volume: 10 Clientes (Inicial)**

```
Custos fixos/mês:
├─ Render: R$ 69
├─ Salário (1 dev): R$ 3.000
├─ Marketing: R$ 500
├─ Infraestrutura misc: R$ 200
└─ Total: R$ 3.769/mês

Custo variável (10 clientes):
├─ Gemini IA: 10 × R$ 6,50 = R$ 65
├─ Supadata: 10 × R$ 4,50 = R$ 45
└─ Total: R$ 110/mês

TOTAL COGS: R$ 3.879/mês

Custo por cliente: R$ 3.879 ÷ 10 = R$ 387,90/cliente
```

**Preço recomendado para 10 clientes:**
- **Startup: R$ 99/mês** ❌ (Loss: -R$ 288/cliente)
- **Professional: R$ 299/mês** ❌ (Loss: -R$ 88/cliente)
- **Mini Starter: R$ 599/mês** ✅ (Margem: 35%)

*→ Fase inicial: precisa de subsídio ou menos overhead*

---

### **Volume: 100 Clientes (Ramp-up)**

```
Custos fixos/mês:
├─ Render: R$ 150 (scaled)
├─ Salário (2 devs): R$ 6.000
├─ Marketing: R$ 2.000
├─ Suporte: R$ 1.000
├─ Infraestrutura: R$ 500
└─ Total: R$ 9.650/mês

Custo variável (100 clientes):
├─ Gemini IA: 100 × R$ 6,50 = R$ 650
├─ Supadata: 100 × R$ 4,50 = R$ 450
└─ Total: R$ 1.100/mês

TOTAL COGS: R$ 10.750/mês

Custo por cliente: R$ 10.750 ÷ 100 = R$ 107,50/cliente
```

**Preço recomendado para 100 clientes:**
- **Startup: R$ 99/mês** ❌ (Loss: -R$ 8,50)
- **Professional: R$ 299/mês** ✅ (Margem: 64%)
- **Enterprise: R$ 899/mês** ✅ (Margem: 88%)

*→ Fase growth: Professional é rentável*

---

### **Volume: 500 Clientes (Scale)**

```
Custos fixos/mês:
├─ Render: R$ 300 (scaled)
├─ Salário (3 devs + 1 sales): R$ 12.000
├─ Marketing: R$ 5.000
├─ Suporte: R$ 3.000
├─ Infraestrutura: R$ 1.000
└─ Total: R$ 21.300/mês

Custo variável (500 clientes):
├─ Gemini IA: 500 × R$ 6,50 = R$ 3.250
├─ Supadata: 500 × R$ 4,50 = R$ 2.250
└─ Total: R$ 5.500/mês

TOTAL COGS: R$ 26.800/mês

Custo por cliente: R$ 26.800 ÷ 500 = R$ 53,60/cliente
```

**Preço recomendado para 500 clientes:**
- **Startup: R$ 99/mês** ✅ (Margem: 46%)
- **Professional: R$ 299/mês** ✅ (Margem: 82%)
- **Enterprise: R$ 999/mês** ✅ (Margem: 95%)

*→ Escala: todos os planos são rentáveis*

---

### **Volume: 1.000 Clientes (Full Scale)**

```
Custos fixos/mês:
├─ Render: R$ 1.000 (enterprise)
├─ Salário (5 devs + 2 sales + 1 CS): R$ 20.000
├─ Marketing: R$ 10.000
├─ Suporte: R$ 5.000
├─ Infraestrutura: R$ 2.000
└─ Total: R$ 38.000/mês

Custo variável (1.000 clientes):
├─ Gemini IA: 1.000 × R$ 6,50 = R$ 6.500
├─ Supadata: 1.000 × R$ 4,50 = R$ 4.500
└─ Total: R$ 11.000/mês

TOTAL COGS: R$ 49.000/mês

Custo por cliente: R$ 49.000 ÷ 1.000 = R$ 49/cliente
```

**Preço recomendado para 1.000 clientes:**
- **Startup: R$ 99/mês** ✅ (Margem: 50%)
- **Professional: R$ 299/mês** ✅ (Margem: 84%)
- **Enterprise: R$ 999/mês** ✅ (Margem: 95%)

*→ Full scale: altamente lucrativo*

---

## 🎯 ESTRATÉGIA DE PRECIFICAÇÃO RECOMENDADA

### **Estratégia por Fase:**

#### **FASE 1: Launch (10-50 clientes)**
```
Starter: R$ 199/mês (50 imóveis, 3 usuários)
Professional: R$ 399/mês (ilimitado, 10 usuários)
Enterprise: R$ 999/mês (custom)

Nota: Estamos abaixo do custo de operação.
Solução: Use isso como "penetração de mercado"
         ou subsídio de investor (como Stripe fez).
```

**Alternativa: Tiers mais altos**
```
Starter: R$ 399/mês
Professional: R$ 799/mês
Enterprise: R$ 1.999/mês

Foco em qualidade > quantidade.
Ideal se sua proposta de valor é FORTE (avaliação científica).
```

#### **FASE 2: Growth (100-300 clientes)**
```
Startup: R$ 99/mês (50 imóveis)
Professional: R$ 299/mês (ilimitado) ← SWEET SPOT
Enterprise: R$ 899/mês (custom + suporte dedicado)

Margem: 64% (Professional)
ARR (300 clientes @ R$ 299): R$ 1,07M
```

#### **FASE 3: Scale (500+ clientes)**
```
Mesmos preços (R$ 99 / R$ 299 / R$ 899)

Margem: 82% (Professional)
ARR (1.000 clientes @ R$ 299): R$ 3,6M
Altamente lucrativo.
```

---

## 🏛️ IMPOSTOS & TAXAS (LUCRO PRESUMIDO)

### **Estrutura Tributária PJ:**

| Imposto | Alíquota | Base | Observação |
|---------|----------|------|-----------|
| **ISS (Prefeitura)** | 2-5% | Receita bruta | Varia por município |
| **IRPJ (IR - Lucro Presumido)** | 8% | Receita | Presumido 32% margem |
| **CSLL (Contribuição Social)** | 9% | Receita | Presumido 32% margem |
| **PIS/COFINS** | 7,65% | Receita | Não-cumulativo |
| **Total Tributário** | **~27,65%** | Receita | *Sem ISS municipal* |

**Com ISS (2% mínimo):**
```
Total com ISS: 27,65% + 2% = 29,65%
Total com ISS: 27,65% + 5% = 32,65% (máximo)
```

---

### **Exemplo Prático (R$ 10.000 MRR)**

```
RECEITA BRUTA: R$ 10.000

Impostos federais (25,65%):
├─ IRPJ: R$ 800 (8%)
├─ CSLL: R$ 900 (9%)
└─ PIS/COFINS: R$ 765 (7,65%)
   Subtotal federal: R$ 2.465

ISS Municipal (2%): R$ 200

TOTAL IMPOSTOS: R$ 2.665 (26,65%)

RECEITA LÍQUIDA: R$ 7.335
```

---

### **Impacto nos Preços**

Para manter margem operacional de 50%, você precisa cobrar:

```
Preço final = (Custo operacional × 1,5) ÷ (1 - 0,2665)
Preço final = (Custo × 1,5) ÷ 0,7335

Exemplo com custo de R$ 100/cliente:
Preço = (100 × 1,5) ÷ 0,7335
Preço = R$ 204,54 (arredonda R$ 199-209)
```

---

## 📈 FINANCIAL PROJECTIONS (COM IMPOSTOS)

### **Cenário Conservador (100 clientes em 6 meses)**

#### Preços: Startup R$ 199 / Professional R$ 299 (mix 60/40)

| Mês | Clientes | MRR | Impostos (28,65%) | Depois Impostos | COGS | Resultado |
|-----|----------|-----|-----------------|-----------------|------|-----------|
| 1 | 5 | R$ 1.495 | R$ 427 | R$ 1.068 | R$ 3.879 | **-R$ 2.811** |
| 2 | 15 | R$ 4.485 | R$ 1.281 | R$ 3.204 | R$ 5.800 | **-R$ 2.596** |
| 3 | 30 | R$ 8.970 | R$ 2.564 | R$ 6.406 | R$ 8.200 | **-R$ 1.794** |
| 4 | 50 | R$ 14.950 | R$ 4.276 | R$ 10.674 | R$ 10.000 | **+R$ 674** ✅ |
| 5 | 75 | R$ 22.425 | R$ 6.412 | R$ 16.013 | R$ 10.400 | **+R$ 5.613** |
| 6 | 100 | R$ 29.900 | R$ 8.553 | R$ 21.347 | R$ 10.750 | **+R$ 10.597** |

**Cumulative 6-month burn: R$ 11.713**
**Break-even: Mês 4**
**Runway needed: R$ 12k-15k (Seed round)**

---

### **Cenário Agressivo (500 clientes em 12 meses)**

| Trimestre | Clientes | MRR | Impostos | Receita Líquida | COGS | Resultado |
|-----------|----------|-----|---------|-----------------|------|-----------|
| Q1 | 50 | R$ 14.950 | R$ 4.276 | R$ 10.674 | R$ 10.000 | +R$ 674 |
| Q2 | 150 | R$ 44.850 | R$ 12.828 | R$ 32.022 | R$ 10.400 | +R$ 21.622 |
| Q3 | 300 | R$ 89.700 | R$ 25.656 | R$ 64.044 | R$ 10.750 | +R$ 53.294 |
| Q4 | 500 | R$ 149.500 | R$ 42.761 | R$ 106.739 | R$ 11.000 | +R$ 95.739 |

**Year 1 Gross Revenue: R$ 1.794.000**
**Year 1 Net (após impostos): R$ 1.278.600**
**Year 1 EBITDA: ~R$ 1.040.000** ✅
**Series A ready - com múltiplo 8-10x ARR: R$ 10-13M valuation**

---

## 🏆 RECOMENDAÇÃO FINAL (COM IMPOSTOS)

### **Preços Definitivos (Balanceado com Impostos 28,65%):**

```
┌────────────────────────────────────────────────────────┐
│                    TABELA DE PREÇOS                     │
├────────────────────────────────────────────────────────┤
│ STARTUP           R$ 199/mês                            │
│ - 50 imóveis/mês                                        │
│ - 3 usuários                                            │
│ - VivaReal integrado                                    │
│ - Avaliação científica (até 50 avaliações/mês)         │
│ - CRM básico + WhatsApp IA                             │
│                                                         │
│ Margem líquida: 45% (após impostos)                    │
│ Ideal para: Imobiliárias pequenas (<5 corretores)     │
│                                                         │
│─────────────────────────────────────────────────────────│
│                                                         │
│ PROFESSIONAL      R$ 399/mês ← SWEET SPOT             │
│ - Imóveis ilimitados                                    │
│ - 10 usuários                                           │
│ - VivaReal + ZapImóveis (auto-publish)                │
│ - Avaliação ilimitada                                  │
│ - Financeiro completo (dashboard)                      │
│ - Split automático (95/5)                              │
│ - Relatórios PDF                                       │
│ - Suporte por email/WhatsApp                           │
│                                                         │
│ Margem líquida: 58% (após impostos)                    │
│ Ideal para: Imobiliárias médias (10-50 corretores)    │
│ Payback: <1 mês (1 imóvel extra = +R$ 3.000)         │
│                                                         │
│─────────────────────────────────────────────────────────│
│                                                         │
│ ENTERPRISE        R$ 999/mês                            │
│ - Tudo do Professional +                               │
│ - Open Banking (Itaú/Bradesco/Santander)              │
│ - Integração Nota Fiscal SEFAZ                        │
│ - DMOB integrado                                       │
│ - Suporte dedicado (tel + WhatsApp 24/7)              │
│ - SLA 99,9%                                            │
│ - Customizações (workflows, campos, etc)              │
│ - Integração via API (custom)                         │
│                                                         │
│ Margem líquida: 75% (após impostos)                    │
│ Ideal para: Franquias, redes de imóveis (50+ corretores)
│ Payback: <1 semana                                     │
│                                                         │
└────────────────────────────────────────────────────────┘

PROMOÇÃO INICIAL (Launch):
├─ Primeiros 30 dias GRÁTIS (todos os planos)
├─ 2 avaliações científicas bônus (sem limite)
└─ Suporte onboarding gratuito (1h de consultoria)
```

### **Por quê esses preços?**

1. **R$ 199 (Startup)**: Penetração de mercado
   - Imobiliárias pequenas começam aqui
   - Margem: 50% em scale

2. **R$ 449 (Professional)**: Sweet spot
   - Lucro imediato em 100+ clientes
   - Margem: 60-80%
   - Conversão fácil do Startup

3. **R$ 1.299 (Enterprise)**: Diferenciação
   - Grandes imobiliárias + Franchises
   - Margem: 95%
   - ROI em <1 mês (1 imóvel = R$ 3.000)

### **Alternativa Agressiva (se confiar no diferencial):**

```
Startup:  R$ 299/mês
Professional: R$ 699/mês  
Enterprise: R$ 1.999/mês

Margem: 60% + 72% + 85% (após impostos)

Racional: Avaliação científica é MONOPOLIO
          Pode cobrar premium desde o dia 1
          Baseado em valor entregue, não em custo

Risk: Pode reduzir adoção inicial
Reward: +65% de receita vs preços recomendados
```

---

## ⚠️ OBSERVAÇÕES CRÍTICAS

### **1. Supadata pode ser otimizado:**
- Cache de dados históricos = -50% custo
- Atualização 2x/semana (vs 1x/semana)
- Custo real: R$ 2,00/cliente (vs R$ 4,50)

### **2. Render será seu maior custo variável:**
- Escale vertical (mais RAM) antes de horizontal
- CDN em frente (Cloudflare): +50% performance
- Cache agressivo de regressões

### **3. Gemini pode ser substituído:**
- Self-hosted ML model (custo = R$ 0)
- Trade-off: acurácia cai 10-15%
- Decisão: pague Gemini pela qualidade (diferencial)

### **4. Churn é CRITICAL:**
- Cada 1% de churn = R$ 150k/ano perdido em escala
- Foco em onboarding (primeiros 7 dias)
- NPS > 50 é essencial

---

## 📊 RESUMO EXECUTIVO (COM IMPOSTOS 28,65%)

### Tabela de Viabilidade

| Volume | Custo/Cliente | Preço Recomendado | Receita Líquida | Margem Líquida | Status |
|--------|--------------|------------------|-----------------|--------|--------|
| 10 | R$ 387,90 | R$ 999 | R$ 714 | 84% | 🔴 Loss* |
| 100 | R$ 107,50 | R$ 399 | R$ 285 | 58% | 🟢 Profit |
| 500 | R$ 53,60 | R$ 399 | R$ 285 | 72% | 🟢 Profit |
| 1.000 | R$ 49,00 | R$ 399 | R$ 285 | 82% | 🟢 Profit |

*Volume 10: Loss devido a overhead fixo (salary + marketing). Cobrir com seed capital.

### Recomendação Principal

**USE PREÇOS:**
- **Startup: R$ 199/mês** (penetração)
- **Professional: R$ 399/mês** ← FOCO AQUI (break-even em 100 clientes)
- **Enterprise: R$ 999/mês** (margem 75%)

**Por quê?**
1. Break-even rápido (mês 4, ~50 clientes)
2. Margem saudável em 100 clientes (58%)
3. Alinhado com custo operacional real
4. Competitivo vs Jetimob (R$ 299) mas com diferencial
5. Aumentar depois quando tiver tração

**Projeção Year 1:**
- 500 clientes @ mix (60% Startup, 35% Professional, 5% Enterprise)
- Receita bruta: R$ 1,79M
- Receita líquida (pós-impostos): R$ 1,28M
- EBITDA: ~R$ 1,04M
- **Status: Série A ready** 🚀
