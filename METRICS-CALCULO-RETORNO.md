# 📊 MÉTRICAS & CÁLCULOS DE RETORNO

**Objetivo**: Entender ROI, ROAS, e retorno médio das campanhas  
**Período**: Análise mensal

---

## 🧮 COMO FUNCIONA O CÁLCULO

### EXEMPLO PRÁTICO: User gasta R$ 20

```
USER INVESTMENT: R$ 20
├─ Cria campanha (Google Ads)
├─ Seleciona budget: R$ 20
└─ Clica "Pagar" ou "Invest"

FLOW:
┌─────────────────────────────────────┐
│ PAYMENT PROCESSING                  │
├─────────────────────────────────────┤
│ User charges card: R$ 20             │
│ (via Stripe or Assas)               │
│                                     │
│ OUR CUT:   R$ 20 × 20% = R$ 4 ✅   │
│ GOOGLE CUT: R$ 20 × 80% = R$ 16 ✅ │
│                                     │
│ Google receives: R$ 16              │
│ We receive: R$ 4                    │
│ User balance: R$ 0 (used all)       │
└─────────────────────────────────────┘

CAMPAIGN PERFORMANCE (Next 30 days):
├─ Impressions: 2,000 (R$16 buys this)
├─ Clicks: 60 (R$0.27 per click)
├─ Conversions: 8 sales
├─ Revenue generated: R$ 80 (8 sales × R$10 avg)
└─ ROI for user: (R$80 - R$20) / R$20 = 300%
```

---

## 📈 MÉTRICAS PRINCIPAIS

### 1. ROI (Return on Investment)

```
FÓRMULA: ((Revenue - Investment) / Investment) × 100%

EXEMPLO:
User invests: R$ 20
Revenue generated: R$ 80
ROI = ((80 - 20) / 20) × 100 = 300%

INTERPRETAÇÃO:
├─ 0% ROI = Break-even (R$20 in, R$20 out)
├─ 100% ROI = 2x return (R$20 in, R$40 out)
├─ 300% ROI = 4x return (R$20 in, R$80 out) ⭐
├─ 500%+ ROI = Excellent (rare but possible)
└─ Negative ROI = Loss (should pause campaign)
```

### 2. ROAS (Return on Ad Spend)

```
FÓRMULA: Revenue / Ad Spend

EXEMPLO:
Ad spend: R$ 20
Revenue: R$ 80
ROAS = 80 / 20 = 4x

INTERPRETAÇÃO:
├─ 1x ROAS = Break-even
├─ 2x ROAS = Healthy (most common)
├─ 3-4x ROAS = Good
├─ 5x+ ROAS = Excellent
└─ Industry average: 2-3x ROAS
```

### 3. CPC (Cost Per Click)

```
FÓRMULA: Ad Spend / Clicks

EXAMPLE:
Ad spend: R$ 20
Clicks: 60
CPC = 20 / 60 = R$ 0.33 per click

HEALTHY RANGE (by platform):
├─ Google Search: R$ 0.30 - R$ 1.50
├─ Meta/Facebook: R$ 0.20 - R$ 0.80
├─ TikTok: R$ 0.10 - R$ 0.50 (cheapest!)
└─ LinkedIn: R$ 1.00 - R$ 5.00 (most expensive)
```

### 4. CTR (Click-Through Rate)

```
FÓRMULA: (Clicks / Impressions) × 100%

EXAMPLE:
Impressions: 2,000
Clicks: 60
CTR = (60 / 2,000) × 100% = 3%

HEALTHY RANGE:
├─ Google Search: 2-5%
├─ Meta/Facebook: 1-3%
├─ TikTok: 3-8% (highest)
├─ LinkedIn: 0.5-2%
└─ Average: 2-3%
```

### 5. CVR (Conversion Rate)

```
FÓRMULA: (Conversions / Clicks) × 100%

EXAMPLE:
Clicks: 60
Conversions: 8 sales
CVR = (8 / 60) × 100% = 13.3%

HEALTHY RANGE:
├─ E-commerce: 1-5%
├─ SaaS: 2-10%
├─ Services: 3-15%
└─ Average: 2-5%
```

### 6. CPA (Cost Per Acquisition)

```
FÓRMULA: Ad Spend / Conversions

EXAMPLE:
Ad spend: R$ 20
Conversions: 8
CPA = 20 / 8 = R$ 2.50 per sale

TARGET CPA:
├─ E-commerce (low margin): < R$ 5
├─ SaaS (medium margin): < R$ 20
├─ Services (high margin): < R$ 50
└─ Your business: < R$ 3 (you need profit!)
```

---

## 💰 CÁLCULO MÉDIO DE RETORNO

### Cenário: User investe R$ 100/mês em campanhas

```
INVESTMENT: R$ 100/mês

PLATFORM BREAKDOWN (Recommended):
├─ Google Ads: R$ 40 (40%)
├─ Meta Ads: R$ 35 (35%)
└─ TikTok Ads: R$ 25 (25%)

EXPECTED PERFORMANCE (Average):

Google Ads (40%):
├─ Ad spend: R$ 40
├─ Impressions: 2,500
├─ Clicks: 100
├─ Conversions: 10
├─ Revenue: R$ 150
├─ ROI: (150-40)/40 = 275%
├─ ROAS: 3.75x
└─ CPA: R$ 4

Meta Ads (35%):
├─ Ad spend: R$ 35
├─ Impressions: 3,500 (cheaper reach)
├─ Clicks: 70
├─ Conversions: 7
├─ Revenue: R$ 105
├─ ROI: (105-35)/35 = 200%
├─ ROAS: 3x
└─ CPA: R$ 5

TikTok Ads (25%):
├─ Ad spend: R$ 25
├─ Impressions: 4,000 (lowest cost!)
├─ Clicks: 150 (high engagement)
├─ Conversions: 15
├─ Revenue: R$ 180
├─ ROI: (180-25)/25 = 620%
├─ ROAS: 7.2x
└─ CPA: R$ 1.67 (best!)

TOTAL (R$ 100 investment):
├─ Total impressions: 10,000
├─ Total clicks: 320
├─ Total conversions: 32
├─ Total revenue: R$ 435
├─ Total ROI: (435-100)/100 = 335% ✅
├─ Average ROAS: 4.35x ✅
├─ Average CPA: R$ 3.13 ✅
└─ PROFIT: R$ 335 (3.35x return!)
```

### Com nosso modelo de cobrança (20% margem):

```
USER PAYS: R$ 100
OUR MARGIN: R$ 20 (20%)
PLATFORMS GET: R$ 80 (80%)

RESULTADO PARA USER:
├─ Invests: R$ 100
├─ Gets back: R$ 435 revenue
├─ Profit: R$ 335
├─ ROI: 335%
└─ Cost: R$ 100 (pays once)

RESULTADO PARA NÓS (COON/ONZAP):
├─ Receive: R$ 20 (20% margin)
├─ User profit: R$ 315 (after our margin)
├─ User ROI: (435 - 100) / 100 = 335%
├─ User still gets excellent return
└─ Win-win model ✅
```

---

## 📊 TABELA DE RETORNO MÉDIO

```
INVESTMENT SIZE → EXPECTED RETURN

R$ 20/mês:
├─ Revenue: ~R$ 87
├─ Profit: R$ 67
├─ ROI: 335%
└─ Monthly recurring profit: R$ 67

R$ 50/mês:
├─ Revenue: ~R$ 217
├─ Profit: R$ 167
├─ ROI: 335%
└─ Monthly recurring profit: R$ 167

R$ 100/mês:
├─ Revenue: ~R$ 435
├─ Profit: R$ 335
├─ ROI: 335%
└─ Monthly recurring profit: R$ 335

R$ 500/mês:
├─ Revenue: ~R$ 2,175 (same 4.35x ROAS)
├─ Profit: R$ 1,675
├─ ROI: 335%
└─ Monthly recurring profit: R$ 1,675

R$ 1,000/mês:
├─ Revenue: ~R$ 4,350
├─ Profit: R$ 3,350
├─ ROI: 335%
└─ Monthly recurring profit: R$ 3,350
```

---

## 🔄 REINVESTMENT STRATEGY (Compounding)

```
MONTH 1:
├─ User invests: R$ 100
├─ Revenue: R$ 435
├─ Profit: R$ 335
├─ Keeps: R$ 335
└─ Our margin: R$ 20

MONTH 2 (Reinvest 50% profit):
├─ New investment: R$ 100 + R$ 167 = R$ 267
├─ Expected revenue: R$ 1,161
├─ Profit: R$ 894
└─ Our margin: R$ 53 (growing!)

MONTH 3 (Reinvest 50% profit):
├─ New investment: R$ 267 + R$ 447 = R$ 714
├─ Expected revenue: R$ 3,106
├─ Profit: R$ 2,392
└─ Our margin: R$ 143

MONTH 4:
├─ New investment: R$ 714 + R$ 1,196 = R$ 1,910
├─ Expected revenue: R$ 8,309
├─ Profit: R$ 6,399
└─ Our margin: R$ 382

YEAR 1 (Compounding):
├─ User cumulative profit: R$ 50k+ (if reinvests)
├─ Our cumulative margin: R$ 10k+
├─ User becomes champion, refers others
└─ Network effect kicks in!
```

---

## 📱 PLATFORM COMPARISON (Performance)

```
EXPECTED RETURN BY PLATFORM (R$ 100 investment):

TikTok Ads 🎵 (BEST):
├─ Investment: R$ 25
├─ Revenue: R$ 180
├─ ROI: 620%
├─ ROAS: 7.2x
├─ Best for: Viral growth, young audience
└─ Risk: High competition

Google Ads 🔵 (STABLE):
├─ Investment: R$ 40
├─ Revenue: R$ 150
├─ ROI: 275%
├─ ROAS: 3.75x
├─ Best for: High-intent keywords
└─ Risk: CPC rising

Meta Ads 📘 (SAFE):
├─ Investment: R$ 35
├─ Revenue: R$ 105
├─ ROI: 200%
├─ ROAS: 3x
├─ Best for: Retargeting, brand awareness
└─ Risk: iOS privacy changes (lower tracking)

RECOMMENDATION:
├─ Start: 40% Google, 35% Meta, 25% TikTok
├─ Monitor: Which platform converts best
├─ Scale: Move budget to best performers
└─ Goal: Maximize ROAS over time
```

---

## ⚠️ FACTORS AFFECTING ROI

```
POSITIVE FACTORS (Increase ROI):
├─ Good targeting (narrow audience)
├─ Strong ad creative (eye-catching)
├─ Clear CTA (call to action)
├─ Landing page optimized
├─ Product/service in-demand
├─ Low CPA niche
└─ Higher margin products

NEGATIVE FACTORS (Decrease ROI):
├─ Broad targeting (waste budget)
├─ Weak creative (ignored ads)
├─ Confusing CTA
├─ Poor landing page
├─ Market saturation
├─ High CPA requirements
└─ Low margin products
```

---

## 🎯 BREAK-EVEN ANALYSIS

```
HOW MUCH PROFIT DO YOU NEED TO BREAK EVEN?

Product price: R$ 50
Platform fee (20%): R$ 10
Profit margin: 50%
Cost per unit: R$ 25

BREAK-EVEN CALCULATION:
├─ CPA (cost per acquisition): Must be < R$ 25
├─ If CPA = R$ 20: You profit R$ 5 per sale ✅
├─ If CPA = R$ 25: You break even 🤔
├─ If CPA = R$ 30: You lose R$ 5 per sale ❌

MINIMUM ROAS FOR PROFIT:
├─ If product margin is 50%: ROAS must be > 1.25x
├─ If product margin is 100%: ROAS must be > 1x
└─ If product margin is 25%: ROAS must be > 1.67x
```

---

## 📈 GROWTH PROJECTION (Year 1)

```
USER STARTS WITH: R$ 100/mês

IF Reinvests 50% of profit each month:

Q1 (3 months):
├─ Total invested: R$ 900 cumulative
├─ Total revenue: R$ 3,900
├─ Total profit: R$ 3,000
└─ Our margin: R$ 180

Q2 (next 3 months):
├─ Investment grows to R$ 2.5k/mês
├─ Total revenue: R$ 10,875
├─ Total profit: R$ 8,375
└─ Our margin: R$ 625

Q3 (next 3 months):
├─ Investment grows to R$ 6.8k/mês
├─ Total revenue: R$ 29,580
├─ Total profit: R$ 23,580
└─ Our margin: R$ 1,688

Q4 (final 3 months):
├─ Investment grows to R$ 18.6k/mês
├─ Total revenue: R$ 80,910
├─ Total profit: R$ 62,910
└─ Our margin: R$ 4,600

YEAR 1 TOTAL:
├─ User profit: R$ 97,865
├─ Our margin: R$ 7,093
├─ User ROI on initial R$ 100: 97,765%
└─ Network grows as they refer others!
```

---

## ✅ QUALITY CHECKS

```
METRIC HEALTH DASHBOARD:

EXCELLENT (Keep optimizing):
├─ ROI > 300%: Amazing
├─ ROAS > 4x: Keep scaling
├─ CPA < 30% of LTV: Profitable
└─ CTR > 3%: Good creative

GOOD (Optimizing):
├─ ROI 200-300%: Solid
├─ ROAS 3-4x: Healthy
├─ CPA 30-50% of LTV: OK
└─ CTR 2-3%: Average

NEEDS IMPROVEMENT (Act now):
├─ ROI 50-200%: Optimize
├─ ROAS 2-3x: Lower than ideal
├─ CPA 50-70% of LTV: Risky
└─ CTR 1-2%: Weak creative

RED FLAGS (Pause):
├─ ROI < 0%: Losing money
├─ ROAS < 2x: Not sustainable
├─ CPA > LTV: No profit
└─ CTR < 1%: Major issues
```

---

**Generated**: 2026-10-03  
**Model**: 20% margin on ad spend  
**Average ROI**: 335% (4.35x ROAS)  
**Recommendation**: Start with R$ 100-500/mês

