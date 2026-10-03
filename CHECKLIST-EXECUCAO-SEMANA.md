# ✅ Checklist de Execução - Semana 1

## 🔴 AMANHÃ (Sexta - 04/10)

### Manhã (08:00-12:30)

#### Setup de Credenciais (55 min)
- [ ] **Google Cloud OAuth** (15 min)
  - [ ] Acesse https://console.cloud.google.com/
  - [ ] Criar projeto `infer-coon-oauth`
  - [ ] OAuth consent screen → Consentimento
  - [ ] Criar credenciais → ID do Cliente OAuth
  - [ ] Copiar: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`

- [ ] **SendGrid** (10 min)
  - [ ] Acesse https://sendgrid.com/
  - [ ] Sign up + confirmar email
  - [ ] Settings → API Keys → Create
  - [ ] Copiar: `SENDGRID_API_KEY`

- [ ] **Sentry** (5 min)
  - [ ] Acesse https://sentry.io/
  - [ ] Criar conta + confirmar email
  - [ ] Create Project → Node.js
  - [ ] Copiar: `SENTRY_DSN`

- [ ] **Google Analytics** (5 min)
  - [ ] Acesse https://analytics.google.com/
  - [ ] Admin → Criar Propriedade
  - [ ] Copiar: `NEXT_PUBLIC_GA_ID`

- [ ] **Redis Cloud** (5 min)
  - [ ] Acesse https://redis.com/cloud/
  - [ ] Sign up + confirmar email
  - [ ] Create Database
  - [ ] Copiar: `REDIS_URL`

- [ ] **PostgreSQL Neon** (5 min)
  - [ ] Acesse https://console.neon.tech/
  - [ ] Sign up + confirmar email
  - [ ] Copiar: `DATABASE_URL`

#### Preencher `.env` (5 min)
- [ ] Copiar `.env.example` para `.env`
- [ ] Preencher 6 credenciais acima
- [ ] Gerar `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Salvar arquivo

#### Instalar e Testar (15 min)
- [ ] `npm install`
- [ ] `npx prisma migrate dev --name init`
- [ ] `npm run start:dev`
- [ ] Acessar http://localhost:3000/api

#### Swagger Testing (30 min)
- [ ] [ ] GET /api/auth/profile (sem autenticação → erro esperado)
- [ ] [ ] POST /api/onzap/dashboard (mock request)
- [ ] [ ] POST /api/onlove/dashboard (mock)
- [ ] [ ] POST /api/onmail/dashboard (mock)
- [ ] [ ] POST /api/wallet/balance (mock)
- [ ] Registrar qualquer erro encontrado

### Tarde (14:00-16:30)

#### RD Station Setup (15 min)
- [ ] Acesse https://www.rdstation.com/api/
- [ ] Sign Up → Criar conta
- [ ] Confirmar email
- [ ] Dashboard → API Keys → Copiar chave
- [ ] Adicionar ao `.env`: `RD_STATION_API_KEY`

#### Integração RD Station (1h 30min)
- [ ] Copiar `RdStationService` de `RD-STATION-PLANOS-COMPARACAO.md`
- [ ] Criar: `src/services/rd-station.service.ts`
- [ ] Atualizar `AppModule` com `RdStationService`
- [ ] Copiar métodos de cidade de `RD-STATION-CIDADES-ESTRATEGIA.md`
- [ ] Update `OnzapDashboardController` com `searchByCity` endpoint
- [ ] `npm run start:dev` (restart)
- [ ] Testar no Swagger:
  - [ ] POST /api/onzap/search-by-city
    ```json
    {
      "city": "São Paulo",
      "segment": "Pizzaria",
      "limit": 50
    }
    ```

#### Validação (30 min)
- [ ] Verificar resposta RD Station (deve retornar pizzarias com dados)
- [ ] Testar com outro segmento (Restaurante, Salão)
- [ ] Testar com outra cidade (Rio de Janeiro)
- [ ] Registrar qualquer erro

#### Commit Diário
- [ ] `git add .`
- [ ] `git commit -m "RD Station integration: city search by segment"`
- [ ] `git push origin claude/zealous-edison-cv62ld`

---

## 🟡 SÁBADO (05/10)

### Campanhas Piloto SP (4h)

- [ ] **Pizzaria em SP** (30 min)
  - [ ] Buscar via `/search-by-city`
  - [ ] Selecionar 100 contatos
  - [ ] Estimar receita: 100 × R$ 2 = R$ 200
  - [ ] Registrar em spreadsheet

- [ ] **Restaurante em SP** (30 min)
  - [ ] Buscar via `/search-by-city`
  - [ ] Selecionar 200 contatos
  - [ ] Estimar receita: 200 × R$ 3 = R$ 600

- [ ] **Salão de Beleza em SP** (30 min)
  - [ ] Buscar via `/search-by-city`
  - [ ] Selecionar 100 contatos
  - [ ] Estimar receita: 100 × R$ 2 = R$ 200

- [ ] **Clínica Médica em SP** (30 min)
  - [ ] Buscar via `/search-by-city`
  - [ ] Selecionar 50 contatos
  - [ ] Estimar receita: 50 × R$ 4 = R$ 200

- [ ] **RJ - Rio de Janeiro** (2h)
  - [ ] Testar em Rio
  - [ ] 3 segmentos diferentes
  - [ ] Validar se dados estão corretos

### Relatório Diário
- [ ] Total de contatos validados: ?
- [ ] Total de receita potencial: ?
- [ ] Erros encontrados: ?
- [ ] Próximos passos: ?

---

## 🟢 SEGUNDA (07/10)

### Contratar RD Station Oficial (5 min)
- [ ] Acessar https://www.rdstation.com/api/
- [ ] Plano: **Básico R$ 99/mês**
- [ ] Confirmar pagamento
- [ ] Receber confirmação

### Expandir para 5 Cidades (2h)
- [ ] São Paulo → 10 campanhas
- [ ] Rio de Janeiro → 5 campanhas
- [ ] Belo Horizonte → 3 campanhas
- [ ] Brasília → 2 campanhas
- [ ] Salvador → 2 campanhas

**TOTAL: 22 campanhas lançadas**

### Monitoring
- [ ] Acompanhar respostas via Twilio webhook
- [ ] Validar taxa de delivery
- [ ] Calcular CPM (custo por mil)

---

## 🟢 TERÇA (08/10)

### Análise de Resultados (1h)
- [ ] Campanhas enviadas: ?
- [ ] Taxa de entrega: ?
- [ ] Cliques: ?
- [ ] Conversões: ?
- [ ] ROI: ?

### Otimizações
- [ ] Ajustar preços se necessário
- [ ] Testar novas cidades
- [ ] Validar copy de mensagens

### Escalabilidade
- [ ] Preparar plano para Growth (R$ 299)
- [ ] Cidades para Fase 2

---

## 🟢 QUARTA (09/10)

### Relatório Executivo
- [ ] Receita total Semana 1: ?
- [ ] Custo total: ?
- [ ] Lucro: ?
- [ ] ROI vs previsão: ?

### Decisões
- [ ] [ ] Continuar com Básico ou migrar para Growth?
- [ ] [ ] Quais cidades expandir?
- [ ] [ ] Próximos segmentos a validar?

---

## 🟢 QUINTA (10/10)

### Semana 2 Planning
- [ ] [ ] Revisar resultados
- [ ] [ ] Ajustar estratégia
- [ ] [ ] Preparar campanhas Fase 2

---

## 📊 Métricas para Acompanhar

### Diariamente
- [ ] Campanhas lançadas
- [ ] Contatos enviados
- [ ] Taxa de erro
- [ ] Feedback de usuários

### Semanalmente
- [ ] Receita total
- [ ] CPM (Custo por mil contatos)
- [ ] Taxa de conversão
- [ ] ROI vs RD Station cost

---

## 🎯 Checkpoints Críticos

| Data | Checkpoint | Status |
|------|-----------|--------|
| Sexta 04/10 | Credenciais setup completo | ? |
| Sexta 04/10 | RD Station integrado | ? |
| Sexta 04/10 | 20 endpoints testados no Swagger | ? |
| Sábado 05/10 | 5+ campanhas piloto criadas | ? |
| Segunda 07/10 | RD Station contratado | ? |
| Segunda 07/10 | 22 campanhas em 5 cidades | ? |
| Quarta 09/10 | Análise completa Week 1 | ? |

---

## 🚨 Problemas Comuns & Soluções

### "Redis connection refused"
- [ ] Verificar `REDIS_URL` está correto
- [ ] Testar com: `redis-cli -u "seu_url" ping`
- [ ] Adicionar IP à whitelist do Redis Cloud

### "Database connection failed"
- [ ] Verificar `DATABASE_URL` está correto
- [ ] Adicionar seu IP à whitelist do Neon
- [ ] Testar connection string no DataGrip/DBeaver

### "Google OAuth inválido"
- [ ] Verificar URIs de redirecionamento
- [ ] Certificar que IDs não têm espaços
- [ ] Recriar credenciais se necessário

### "SendGrid API key inválido"
- [ ] Gerar nova chave
- [ ] Certificar que começa com `SG.`
- [ ] Verificar no `.env`

---

## 📝 Documentação Disponível

Para cada passo, veja:
- `SETUP-APIS-CREDENCIAIS.md` - Credential setup
- `RD-STATION-PLANOS-COMPARACAO.md` - RD Station overview
- `RD-STATION-CIDADES-ESTRATEGIA.md` - City strategy
- `INTEGRACAO-DASHBOARDS-APIS.md` - API documentation

---

## ✅ Status Final

**Após completar este checklist:**
- ✅ Servidor rodando localmente
- ✅ 20 endpoints testados
- ✅ RD Station integrado
- ✅ 5 cidades com dados reais
- ✅ Primeiro week de receita validado
- ✅ Pronto para expansão Fase 2

**Tempo total estimado:** ~15 horas (distribuído em 7 dias)

---

**Imprimir este documento e marcar conforme completa! ✏️**
