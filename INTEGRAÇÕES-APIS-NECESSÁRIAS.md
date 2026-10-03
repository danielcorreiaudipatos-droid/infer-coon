# 🔗 RELATÓRIO DE INTEGRAÇÕES & APIs - O QUE CADASTRAR

**Status**: Lista completa para implementação  
**Prioridade**: Críticas vs Nice-to-have  
**Timeline**: Configurar HOJE/AMANHÃ antes de dev

---

## 🔴 CRÍTICAS (Sem estas = NÃO FUNCIONA)

### 1. Google OAuth - ONZAP, ONLOVE, ONMAIL, WALLET

**O que fazer**:
```
1. Ir para: https://console.cloud.google.com
2. Criar novo projeto "infer-coon"
3. Ativar APIs:
   ├─ Google+ API
   ├─ OAuth 2.0
   └─ User credentials

4. Criar OAuth credentials:
   ├─ Application type: Web application
   ├─ Authorized redirect URIs:
   │  ├─ http://localhost:3000/api/auth/google/callback
   │  ├─ https://staging.infer-coon.com/api/auth/google/callback
   │  └─ https://infer-coon.com/api/auth/google/callback
   ├─ Copy: Client ID
   └─ Copy: Client Secret

5. Salvar em .env:
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=yyy
```

**Custo**: GRÁTIS

---

### 2. Assas (Pagamentos/Payouts) - ONLOVE, WALLET, ONZAP

**O que fazer**:
```
1. Ir para: https://assas.com
2. Criar conta (precisa documentação):
   ├─ CPF/CNPJ
   ├─ Endereço
   ├─ Dados bancários
   └─ Aceitar termos

3. Após aprovação (24-48h):
   ├─ Ir para Settings → API
   ├─ Copy: API Key
   ├─ Copy: Webhook secret
   └─ Enable webhooks

4. Salvar em .env:
   ASSAS_API_KEY=xxx
   ASSAS_WEBHOOK_SECRET=yyy
   ASSAS_SANDBOX=false (production)

5. Configurar webhooks:
   ├─ POST endpoint: https://infer-coon.com/api/webhooks/assas
   ├─ Eventos: customer.created, transfer.created, transfer.updated
   └─ Auth: use ASSAS_WEBHOOK_SECRET
```

**Custo**: 2.5% de cada transação (padrão Brasil)

**Documentação**: https://docs.assas.com

---

### 3. SendGrid (Email Sending) - ONMAIL

**O que fazer**:
```
1. Ir para: https://sendgrid.com
2. Criar conta:
   ├─ Email
   ├─ Senha
   ├─ Empresa
   └─ Volume esperado (escolher "2. Criar conta")

3. Após confirmação de email:
   ├─ Ir para Settings → API Keys
   ├─ Create API Key
   ├─ Copiar chave (Full Access)
   └─ Salvar

4. Setup sender authentication:
   ├─ Ir para Settings → Sender Authentication
   ├─ Adicionar domínio: email.infer-coon.com
   ├─ Adicionar SPF record no DNS
   ├─ Adicionar DKIM record no DNS
   ├─ Validar

5. Configure webhooks:
   ├─ Settings → Mail Send
   ├─ Event Webhook:
   │  ├─ URL: https://infer-coon.com/api/webhooks/sendgrid
   │  ├─ Events: delivered, open, click, bounce, unsubscribe
   │  └─ Salvar

6. Salvar em .env:
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@email.infer-coon.com
```

**Custo**: Grátis até 100/dia, depois $29/mês

**Alternativa**: Brevo (mais barato para Brasil)

---

### 4. Stripe (Cartão de Crédito) - ONZAP, ONLOVE, WALLET (opcional)

**O que fazer**:
```
1. Ir para: https://stripe.com/br
2. Criar conta (precisa dados):
   ├─ CPF/CNPJ
   ├─ Dados bancários
   ├─ Endereço
   └─ Aceitar termos

3. Após aprovação:
   ├─ Ir para Dashboard → Developers → API Keys
   ├─ Copy: Publishable key
   ├─ Copy: Secret key
   └─ Salvar em .env

4. Configure webhooks:
   ├─ Ir para Webhooks
   ├─ URL: https://infer-coon.com/api/webhooks/stripe
   ├─ Events: payment_intent.succeeded, charge.refunded
   └─ Copy signing secret para .env

5. Salvar em .env:
   STRIPE_PUBLIC_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_yyy
   STRIPE_WEBHOOK_SECRET=zzz
```

**Custo**: 2.9% + R$ 0.30 por transação

---

### 5. Redis (Cache + Rate Limiting) - TODO

**Opções**:
```
A. Redis Cloud (melhor):
   ├─ Ir para: https://redis.com/cloud
   ├─ Free tier: 30MB grátis
   ├─ Criar database
   ├─ Copy: connection string
   └─ REDIS_URL=redis://xxx:password@host:port

B. Local (dev apenas):
   ├─ Instalar: brew install redis
   ├─ Rodar: redis-server
   └─ REDIS_URL=redis://localhost:6379

Usar para:
├─ Rate limiting (10 reqs/min per user)
├─ Cache de sessões
├─ Cache de dados frequentes
└─ Job queue (se precisar)
```

**Custo**: Grátis (free tier Redis Cloud)

---

### 6. PostgreSQL - DATABASE

**Opções**:
```
A. Neon (melhor para Brasil):
   ├─ Ir para: https://neon.tech
   ├─ Free tier: 5GB storage
   ├─ Criar projeto
   ├─ Copy connection string
   └─ DATABASE_URL=postgres://user:pass@host:port/db

B. Render (alternativa):
   ├─ https://render.com
   ├─ Free tier disponível
   └─ DATABASE_URL=postgres://...

C. Local (dev):
   ├─ Instalar PostgreSQL
   ├─ Criar database: createdb infer-coon-dev
   └─ DATABASE_URL=postgres://localhost/infer-coon-dev
```

**Custo**: Grátis (free tier adequado para MVP)

---

## 🟡 IMPORTANTES (+60% funcionalidade)

### 7. Twilio (SMS/WhatsApp) - ONZAP

**O que fazer**:
```
1. Ir para: https://twilio.com
2. Criar conta (precisa cartão):
   ├─ Email
   ├─ Telefone (para 2FA)
   ├─ Cartão de crédito (validação apenas)
   └─ Confirmar

3. Setup WhatsApp Business Account:
   ├─ Request no Twilio Dashboard
   ├─ Aprovar pelo Meta Business Manager
   ├─ Process: 24-48 horas
   └─ Pode levar até 7 dias

4. Copy credentials:
   ├─ Account SID
   ├─ Auth Token
   ├─ WhatsApp Business Account ID
   └─ Salvar em .env

5. Configure webhooks:
   ├─ Messaging → Webhooks
   ├─ When a message comes in: https://infer-coon.com/api/webhooks/twilio
   └─ Salvar

Salvar em .env:
├─ TWILIO_ACCOUNT_SID=AC...
├─ TWILIO_AUTH_TOKEN=...
├─ TWILIO_WHATSAPP_SID=...
└─ TWILIO_WEBHOOK_AUTH_TOKEN=...
```

**Custo**: Pré-pago, ~R$ 0.05-0.10 por mensagem

**Alternativa**: WhatsApp Cloud API (direto com Meta)

---

### 8. Sentry (Error Tracking) - TODO

**O que fazer**:
```
1. Ir para: https://sentry.io
2. Criar conta
3. Criar novo projeto (NestJS)
4. Copy DSN
5. Instalar: npm install @sentry/nestjs
6. Integrar em main.ts

Salvar em .env:
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

**Custo**: Grátis até 5k eventos/mês

---

### 9. Google Analytics (User Tracking) - TODO

**O que fazer**:
```
1. Ir para: https://analytics.google.com
2. Create new property
3. Copy Measurement ID
4. Instalar npm: @react-oauth/google
5. Integrar em app

Salvar em .env:
NEXT_PUBLIC_GA_ID=G-XXXXXXX
```

**Custo**: GRÁTIS

---

### 10. Datadog (Monitoring) - Optional

**Para produção**:
```
Ir para: https://datadoghq.com
├─ Application Performance Monitoring
├─ Real User Monitoring
├─ Log Management
└─ Infrastructure Monitoring

Custo: ~$200/mês (pode usar Sentry grátis primeiro)
```

---

## 🟢 NICE-TO-HAVE (extras)

### 11. Hubspot CRM - ONZAP (para lead tracking)
### 12. Crisp Chat - Support (customer support)
### 13. Slack API - Notifications (notificações internas)
### 14. Mailgun - Email backup (se SendGrid falhar)
### 15. AWS S3 - File storage (logos, PDFs, etc)

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### HOJE (antes de começar dev):

```
[ ] Google OAuth
   ├─ Create project
   ├─ Enable APIs
   ├─ Create credentials
   └─ Add .env vars

[ ] Assas (Payment)
   ├─ Create account
   ├─ Verify documents (24-48h)
   ├─ Get API keys
   └─ Add .env vars

[ ] SendGrid (Email)
   ├─ Create account
   ├─ Setup sender authentication
   ├─ Configure webhooks
   └─ Add .env vars

[ ] Redis
   ├─ Create Redis Cloud account
   ├─ Create database
   └─ Add .env vars

[ ] PostgreSQL
   ├─ Setup database (Neon ou local)
   ├─ Create migrations
   └─ Add .env vars

[ ] Stripe (opcional, fazer depois)
```

### ANTES DO DEPLOY (Semana 3):

```
[ ] Sentry setup
[ ] Google Analytics
[ ] Datadog (se budget permite)
[ ] DNS records (SPF/DKIM/DMARC)
[ ] CORS configuration
[ ] Security headers
```

---

## 🔐 SEGURANÇA DE CHAVES

**NUNCA fazer**:
```
❌ Commitar .env para Git
❌ Compartilhar chaves em Slack/Email
❌ Usar mesmas chaves para prod + staging
❌ Deixar console.log() com dados sensíveis
```

**Fazer sempre**:
```
✅ Usar .env.local (não no git)
✅ Usar variáveis de ambiente no CI/CD
✅ Rotacionar chaves a cada 90 dias
✅ Usar secrets manager (GitHub Secrets)
✅ 2FA em todas contas de API
```

---

## 📊 TABELA DE INTEGRAÇÕES

| API | Prioridade | Custo | Status | Deadline |
|-----|-----------|--------|--------|----------|
| Google OAuth | 🔴 Crítica | Grátis | ⏳ Fazer hoje | Oct 3 |
| Assas | 🔴 Crítica | 2.5% | ⏳ Fazer hoje | Oct 3 |
| SendGrid | 🔴 Crítica | Grátis | ⏳ Fazer hoje | Oct 3 |
| Stripe | 🟡 Importante | 2.9%+R$0.30 | ⏳ Fazer semana 1 | Oct 7 |
| Redis | 🔴 Crítica | Grátis | ⏳ Fazer hoje | Oct 3 |
| PostgreSQL | 🔴 Crítica | Grátis | ⏳ Fazer hoje | Oct 3 |
| Twilio | 🟡 Importante | $0.05/msg | ⏳ Fazer semana 1 | Oct 7 |
| Sentry | 🟡 Importante | Grátis | ⏳ Fazer semana 2 | Oct 14 |
| Google Analytics | 🟢 Nice | Grátis | ⏳ Fazer semana 2 | Oct 14 |
| Datadog | 🟢 Nice | $200/mês | ⏳ Opção | Depois |

---

## 💡 DICAS

**Para startup**:
```
1. Usar grátis/free tiers (Sentry, Redis Cloud, Neon, SendGrid)
2. Não gastar com Datadog agora (use Sentry)
3. Twilio + Assas: critical path items (sem estes não vende)
4. Stripe pode esperar (Assas já faz cartão)
5. AWS S3 pode esperar (usar Assas ou local storage)
```

**Para escalabilidade**:
```
1. Setup CDN depois (Cloudflare)
2. Setup Load balancer depois (Render, Vercel)
3. Setup monitoring depois (Datadog/New Relic)
4. Setup caching depois (Redis, memcached)
```

---

**Status**: 🚀 READY  
**Total custo**: ~R$ 100-200/mês (free tiers)  
**Setup time**: 2-4 horas  
**Próximo**: Começar a implementar segunda-feira!

