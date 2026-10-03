# 🚀 PLANO DE EXECUÇÃO - COMEÇANDO AGORA (22 dias)

**Data**: Oct 3, 2026 (NOW!)  
**Meta**: Production ready by Oct 25  
**Team**: 5 developers  
**Status**: ✅ INICIANDO AGORA

---

## 📅 SEMANA 1 - CRÍTICOS (Oct 3-7)

### Segunda 03/10 - Kickoff + Google OAuth

**Morning (09:00 UTC)**:
```
Team Meeting (30 min):
├─ Assign tasks
├─ Set up tracking
├─ Daily standup schedule (10:00 UTC cada dia)
└─ Deploy to staging setup
```

**Dev 1 & 2 (Google OAuth - 8 horas)**:
```typescript
ARQUIVO: src/auth/google-auth.component.tsx
├─ Componente React com Google Login
├─ Estilo dark mode (conforme design)
├─ Error handling + loading states
├─ localStorage de JWT token

ARQUIVO: src/auth/google-auth.service.ts (NestJS)
├─ Google OAuth2Client
├─ Token verification
├─ User create/update logic
├─ JWT generation

ARQUIVO: src/auth/auth.controller.ts
├─ POST /api/auth/google endpoint
├─ Request validation
├─ Response formatting

ARQUIVO: .env configuration
├─ GOOGLE_CLIENT_ID
├─ GOOGLE_CLIENT_SECRET
├─ JWT_SECRET

Testes:
├─ Manual test com Google account
├─ Verificar JWT token gravação
├─ Verificar redirect a dashboard
```

**Dev 3 (Database Migration - 4 horas)**:
```sql
ARQUIVO: prisma/schema.prisma
├─ Adicionar campo googleId em User
├─ Adicionar campo authMethod
├─ Adicionar campo apps (array de apps)
├─ Criar tabela user_consents

ARQUIVO: prisma/migrations/
├─ prisma migrate dev --name add_google_auth
├─ Testar rollback
└─ Testar rollup
```

**Dev 4 & 5 (Terms/Privacy Setup - 6 horas)**:
```
ARQUIVO: public/terms/pt-BR.html
├─ Termos de Serviço (copy de TERMOS-DEVERES-ACEITES-COMPLIANCE.md)
├─ Formatado em HTML
├─ CSS responsivo
└─ Links internos

ARQUIVO: public/privacy/pt-BR.html
├─ Privacy Policy (copy acima)
├─ Formatado em HTML
└─ Seções collapsable

ARQUIVO: public/terms/en-US.html (tradução)
ARQUIVO: public/privacy/en-US.html (tradução)

ARQUIVO: src/components/auth-consent.component.tsx
├─ 3 checkboxes (terms, privacy, cookies)
├─ Links para modals (termos popup)
├─ Disabled button até todos checked
└─ Log consentimento
```

**End of Day**:
```
[ ] Google OAuth funcionando em staging
[ ] Banco de dados migrado com user_consents
[ ] Terms/Privacy/Cookies UI pronto
[ ] Deploy test em staging
└─ Relatório: OK/BLOCKER
```

---

### Terça 04/10 - Compliance + KYC

**Dev 1 & 2 (Consent Logging - 6 horas)**:
```typescript
ARQUIVO: src/services/consent.service.ts
├─ recordConsent(userId, type, version, ipAddress, userAgent)
├─ getConsentHistory(userId)
├─ revokeConsent(userId, type)
├─ exportConsentData(userId) - GDPR/LGPD

ARQUIVO: src/database/schemas/consent.schema.ts
├─ Tabela user_consents schema
├─ Indexes para queries rápidas
├─ Retention policies (3 anos)

Testes:
├─ Test recordConsent()
├─ Test getConsentHistory()
├─ Test exportConsentData()
└─ Test GDPR deletion
```

**Dev 3 (KYC/AML Basic - 5 horas)**:
```typescript
ARQUIVO: src/services/kyc.service.ts
├─ validateCPF(cpf) - com check digit
├─ validateRG(rg, state)
├─ validateEmail()
├─ calculateRiskScore()

ARQUIVO: src/controllers/kyc.controller.ts
├─ POST /api/kyc/verify-cpf
├─ POST /api/kyc/verify-rg
├─ GET /api/kyc/status/:userId
└─ POST /api/kyc/request-docs

Testes:
├─ Test CPF validation
├─ Test RG validation
└─ Test risk scoring
```

**Dev 4 (API Documentation - 4 horas)**:
```
ARQUIVO: docs/API-ENDPOINTS.md
├─ All endpoints documented
├─ Request/response examples
├─ Error codes
└─ Rate limits

ARQUIVO: docs/INTEGRATION-GUIDE.md
├─ How to integrate Google OAuth
├─ How to implement consent
├─ How to use KYC
```

**Dev 5 (Deployment Setup - 5 horas)**:
```
ARQUIVO: docker-compose.yml (update)
├─ PostgreSQL service
├─ Redis service (cache)
├─ API service
├─ Worker service

ARQUIVO: .github/workflows/deploy-staging.yml
├─ Run tests on PR
├─ Build Docker image
├─ Deploy to staging
├─ Run e2e tests

ARQUIVO: .env.staging
├─ All env vars
├─ Staging credentials
```

**End of Day**:
```
[ ] Consent logging 100% working
[ ] KYC validation working
[ ] API docs complete
[ ] CI/CD pipeline up
[ ] All critical tests passing
└─ Relatório: OK/BLOCKER
```

---

### Quarta 05/10 - ONMAIL + ONZAP Core

**Dev 1 & 2 (Email Sending - ONMAIL - 8 horas)**:
```typescript
ARQUIVO: src/services/email-sending.service.ts
├─ Integrar SendGrid/Brevo API
├─ Implementar email templates
├─ Rate limiting (10k/hour)
├─ Bounce handling
├─ Unsubscribe management

ARQUIVO: src/controllers/email-campaign.controller.ts
├─ POST /api/onmail/campaigns/send
├─ GET /api/onmail/campaigns/:id/status
├─ GET /api/onmail/analytics/:campaignId
└─ POST /api/onmail/unsubscribe

Integrations:
├─ SendGrid API key (env var)
├─ Webhook handling para bounces
├─ SPF/DKIM/DMARC validation
└─ Sender reputation monitoring

Testes:
├─ Test email sending
├─ Test bounce handling
├─ Test unsubscribe
└─ Test rate limiting
```

**Dev 3 & 4 (ONZAP - Rate Limiting + Spam Detection - 8 horas)**:
```typescript
ARQUIVO: src/services/rate-limiter.service.ts
├─ Redis-based rate limiting
├─ Per-user limits (100 msgs/min)
├─ Per-contact limits (10 msgs/min)
├─ Global limits (10k msgs/hour)

ARQUIVO: src/services/spam-detector.service.ts
├─ Detect spam patterns
├─ Block known phishing domains
├─ Detect bulk adds (>100 contacts at once)
├─ Escalate to human if score > 80

ARQUIVO: src/middleware/rate-limit.middleware.ts
├─ Check rates before processing
├─ Return 429 if exceeded
├─ Log violations

Testes:
├─ Test rate limiting
├─ Test spam detection
├─ Test escalation
```

**Dev 5 (Mobile App Base - 4 horas)**:
```
ARQUIVO: mobile/package.json
├─ React Native setup
├─ expo init
├─ typescript config
├─ eslint + prettier

ARQUIVO: mobile/app.tsx
├─ Navigation setup
├─ Auth screen
├─ Dashboard screen (placeholder)
└─ Styling (Tailwind via NativeWind)

ARQUIVO: mobile/screens/LoginScreen.tsx
├─ Google OAuth button
├─ Terms checkbox
└─ Login form
```

**End of Day**:
```
[ ] Email sending 100% working (test campaign sent)
[ ] Rate limiting + spam detection working
[ ] Mobile app base structure ready
[ ] All tests passing
└─ Relatório: OK/BLOCKER
```

---

### Quinta 06/10 - ONLOVE Payments + WALLET KYC

**Dev 1 & 2 (ONLOVE Payment Integration - 8 horas)**:
```typescript
ARQUIVO: src/services/assas.service.ts
├─ Integrar Assas API
├─ createPayout(userId, amount)
├─ getPayout(payoutId)
├─ trackPayoutStatus()
├─ webhookHandler()

ARQUIVO: src/controllers/onlove-payout.controller.ts
├─ GET /api/onlove/earnings/:creatorId
├─ GET /api/onlove/payouts/:creatorId
├─ POST /api/onlove/payout/request
├─ POST /api/onlove/payout/confirm

ARQUIVO: prisma/schema.prisma (update)
├─ Payout table
├─ Creator earnings tracking

Integrations:
├─ Assas API key + webhook
├─ CPF validation
├─ Bank account validation
├─ Payout processing

Testes:
├─ Test payout creation
├─ Test webhook handling
├─ Test payout status tracking
```

**Dev 3 & 4 (WALLET - KYC + Assas - 8 horas)**:
```typescript
ARQUIVO: src/services/wallet-kyc.service.ts
├─ KYC verification workflow
├─ Document validation (CPF, RG)
├─ Address verification
├─ Bank account verification
├─ Risk assessment

ARQUIVO: src/controllers/wallet-kyc.controller.ts
├─ POST /api/wallet/kyc/start
├─ POST /api/wallet/kyc/submit
├─ GET /api/wallet/kyc/status
├─ GET /api/wallet/kyc/documents

ARQUIVO: src/services/wallet-assas.service.ts
├─ Create customer in Assas
├─ Create recipient
├─ Create transfers
├─ Webhook handling

Integrations:
├─ Assas customer API
├─ Assas recipient API
├─ CPF validation against gov.br (if available)
└─ Anti-fraud checks

Testes:
├─ Test KYC flow
├─ Test Assas integration
├─ Test transfer creation
```

**Dev 5 (Mobile - Auth + Dashboard Start - 4 horas)**:
```
ARQUIVO: mobile/screens/DashboardScreen.tsx
├─ Basic layout
├─ Bottom tab navigation
├─ Metrics placeholders
└─ Styling

ARQUIVO: mobile/services/api-client.ts
├─ Axios instance
├─ Auth interceptors
├─ Error handling

ARQUIVO: mobile/hooks/useAuth.ts
├─ Login logic
├─ Token management
├─ Logout logic
```

**End of Day**:
```
[ ] ONLOVE payouts working (test payout created)
[ ] WALLET KYC working
[ ] Assas webhooks receiving
[ ] Mobile login screen working
[ ] All tests passing
└─ Relatório: OK/BLOCKER
```

---

### Sexta 07/10 - Testing + Staging Deploy

**All Devs (Testing + Integration - 8 horas)**:
```
Dev 1 & 2: E2E Tests
├─ Google login flow
├─ Consent recording
├─ ONMAIL send campaign
└─ ONLOVE payout request

Dev 3: API Tests
├─ All endpoints
├─ Error cases
├─ Rate limiting
└─ KYC validation

Dev 4: Mobile Tests
├─ Login flow
├─ Navigation
├─ API calls
└─ Error handling

Dev 5: Performance Tests
├─ Load testing (100 concurrent users)
├─ Database queries
├─ Cache effectiveness
└─ Memory usage

Security Tests (All):
├─ SQL injection attempts
├─ XSS attempts
├─ CSRF protection
├─ JWT validation
```

**Staging Deploy**:
```bash
# Friday 17:00 UTC
git merge dev → main
npm run build
docker build .
docker push to registry
deploy to staging.infer-coon.com

Smoke Tests:
├─ Login works
├─ Send email works
├─ Payout request works
├─ Mobile app works
├─ All APIs respond
```

**End of Week Report**:
```
SEMANA 1 COMPLETED:
✅ Google OAuth (all 4 apps)
✅ Terms/Privacy/Consents
✅ KYC/AML basics
✅ Email sending ready
✅ ONLOVE payouts ready
✅ WALLET Assas integration
✅ Rate limiting + spam detection
✅ Mobile app base structure
✅ Full CI/CD pipeline
✅ Tests + documentation

METRICS:
├─ Code coverage: 75%+
├─ Test passing: 100%
├─ Staging uptime: 99.9%
├─ API response: <200ms
├─ Email delivery: 99.5%
└─ No critical bugs

NEXT WEEK: Features + Polish + Scale
```

---

## 📈 SEMANA 2 - FEATURES (Oct 8-14)

### Resumo Rápido (8 dias):

```
Monday-Wednesday:
├─ ONZAP: Mobile app UI (Android/iOS)
├─ ONLOVE: Gamification backend (points, levels, leaderboard)
├─ ONMAIL: GDPR compliance + templates
├─ WALLET: Fraud detection + chargebacks
└─ All: Performance optimization

Thursday-Friday:
├─ Load testing (1k concurrent)
├─ Security audit
├─ Bug fixes
├─ Documentation update
└─ Deploy to staging v2.0
```

---

## 🧪 SEMANA 3 - TESTING (Oct 15-21)

```
Full test suite:
├─ 500+ unit tests
├─ 100+ integration tests
├─ 50+ E2E tests
├─ Performance benchmarks
├─ Security penetration test
└─ OWASP Top 10 check

Beta testing:
├─ 100 beta users (friends, family)
├─ Feedback collection
├─ Bug triage
├─ Performance monitoring
└─ Churn analysis
```

---

## 🚀 SEMANA 4 - LAUNCH (Oct 22-25)

```
Monday-Tuesday:
├─ Final bug fixes
├─ Documentation polish
├─ User communication (email)
├─ Monitoring setup
└─ Incident response planning

Wednesday:
├─ Production deploy
├─ Healthcheck
├─ Monitor errors
└─ Support standing by

Thursday-Friday:
├─ Monitor real users
├─ Fix critical bugs
├─ Iterate on feedback
└─ Celebrate! 🎉
```

---

## 📊 GIT WORKFLOW

```bash
# Main branch workflow:
git checkout -b feature/google-oauth
# ... make changes ...
git commit -m "feat: Google OAuth for all apps"
git push origin feature/google-oauth
git pull-request

# After review:
git checkout main
git merge --no-ff feature/google-oauth
git tag v1.0.0-beta.1
git push origin main --tags

# Staging deploy:
git checkout staging
git merge main
npm run build:staging
docker build -t infer-coon:staging .
docker push ...
```

---

## 🎯 DAILY STANDUP (10:00 UTC)

```
Format: 5 min/person
├─ What done yesterday
├─ What doing today
├─ Blockers (if any)
└─ Help needed?

Escalate blockers to lead immediately
```

---

## ✅ SUCCESS CRITERIA

```
Oct 7 (End Week 1):
├─ All critical APIs working
├─ Google OAuth live
├─ 0 critical bugs
├─ 75%+ code coverage
└─ Staging deployed

Oct 14 (End Week 2):
├─ All features implemented
├─ Mobile apps done (MVP)
├─ Performance targets met
├─ Security audit passed
└─ 100 beta users testing

Oct 21 (End Week 3):
├─ All tests passing
├─ <1% critical bugs
├─ Performance optimized
├─ Documentation complete
└─ Team confident in launch

Oct 25 (Launch):
├─ Production live
├─ Users signing up
├─ Revenue flowing
├─ Uptime >99.5%
└─ Team celebrating
```

---

**Status**: 🚀 READY TO GO  
**Start Time**: NOW (Oct 3, 09:00 UTC)  
**Team Size**: 5 developers  
**Timeline**: 22 days  
**Goal**: Production ready with 7.9/10 quality

