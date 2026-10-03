# Setup de Credenciais - Guia Passo a Passo

## 1. Google Cloud OAuth (15 min) 🔵

### O que é?
Google OAuth permite que usuários façam login com a conta Google. É como o botão "Login com Google" que você vê em vários sites.

### Passo a Passo:

1. Acesse: https://console.cloud.google.com/
2. Clique em "Criar Projeto" no topo
3. Digite nome: `infer-coon-oauth`
4. Espere criar (leva 1-2 minutos)
5. Procure por "OAuth consent screen" na barra de busca
6. Clique em "Consentimento OAuth"
7. Escolha "Externo" e clique "Criar"
8. Preencha:
   - **Nome do app:** Infer Coon
   - **Email do suporte:** seu@email.com
9. Clique em "Salvar e Continuar"
10. Em "Escopos", adicione:
    - `email`
    - `profile`
    - `openid`
11. Clique "Salvar e Continuar"
12. Agora vá em "Credenciais" (na esquerda)
13. Clique "Criar Credenciais" → "ID do Cliente OAuth"
14. Escolha "Aplicação da Web"
15. Preencha:
    - **Nome:** infer-coon-web
    - **Origens autorizadas:** http://localhost:3000
    - **URIs de redirecionamento:** http://localhost:3000/api/auth/callback/google
16. Clique "Criar"
17. Você verá uma janela com:
    - `GOOGLE_CLIENT_ID` (copie isto)
    - `GOOGLE_CLIENT_SECRET` (copie isto)

### Adicione ao `.env`:
```
GOOGLE_CLIENT_ID=seu_id_aqui
GOOGLE_CLIENT_SECRET=seu_secret_aqui
```

---

## 2. SendGrid (Email Marketing) - 10 min 📧

### O que é?
SendGrid é um serviço que envia emails em massa. Quando ONMAIL precisa enviar uma campanha para 2.500 subscribers, SendGrid faz isso.

### Passo a Passo:

1. Acesse: https://sendgrid.com/
2. Clique "Sign Up" (criar conta)
3. Preencha dados básicos:
   - Email
   - Senha
   - Empresa: Infer Coon
4. Confirme email (verifique inbox)
5. Depois de logado, vá em "Settings" → "API Keys" (esquerda)
6. Clique "Create API Key"
7. Digite nome: `infer-coon`
8. Permissões: Selecione "Full Access"
9. Clique "Create & Copy"
10. Copie a chave (parece com: `SG.xxxxxxxxxxxxxxxxxxxxx`)

### Adicione ao `.env`:
```
SENDGRID_API_KEY=SG.xxxx
SENDGRID_FROM_EMAIL=noreply@suaempresa.com
```

---

## 3. Sentry (Error Tracking / Monitoramento) - 5 min 🚨

### O que é?
Sentry monitora erros da aplicação. Se algo quebrar no servidor, Sentry envia um alerta e mostra o erro exato que ocorreu.

### Passo a Passo:

1. Acesse: https://sentry.io/
2. Clique "Start for free"
3. Crie conta com email
4. Confirme email
5. Depois de logado, clique "Projects" (esquerda)
6. Clique "Create Project"
7. Escolha: "Node.js"
8. Nome do projeto: `infer-coon`
9. Clique "Create Project"
10. Você verá a página de integração
11. Procure pela linha que começa com `dsn`
12. Ela parece com: `https://xxxxx@xxxxx.ingest.sentry.io/123456`
13. Copie toda essa URL

### Adicione ao `.env`:
```
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456
```

---

## 4. Google Analytics (Rastreamento de Usuários) - 5 min 📊

### O que é?
Google Analytics mostra quantos usuários visitam seu site, de onde vêm, quanto tempo ficam, etc.

### Passo a Passo:

1. Acesse: https://analytics.google.com/
2. Clique "Administração" (ícone engrenagem embaixo esquerda)
3. Clique "Criar Propriedade"
4. Preencha:
   - **Nome:** Infer Coon
   - **Fuso Horário:** America/Sao_Paulo
   - **Moeda:** BRL
5. Clique "Criar Propriedade"
6. Clique "Criar Stream da Web"
7. Preencha:
   - **URL do site:** http://localhost:3000
   - **Nome do stream:** infer-coon
8. Clique "Criar Stream"
9. Você verá o **ID de Medição** (parece com `G-XXXXXXXXXX`)
10. Copie este ID

### Adicione ao `.env`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 5. Redis Cloud (Cache / Sessões) - 5 min ⚡

### O que é?
Redis é um banco de dados muito rápido que armazena dados em memória. Usamos para:
- Cache de dashboards (salva dados por 5 min)
- Rate limiting (controlar quantas mensagens podem ser enviadas)
- Sessões de usuário

### Passo a Passo:

1. Acesse: https://redis.com/cloud/
2. Clique "Try Free" ou "Sign Up"
3. Crie conta (ou use Google/GitHub)
4. Confirme email
5. Depois de logado, clique "Database"
6. Clique "Create a Database"
7. Preencha:
   - **Database Name:** infer-coon
   - **Region:** São Paulo (ou nearest)
   - **Type:** Fixed (gratuito)
8. Clique "Create"
9. Espere criar (2-3 minutos)
10. Clique no database que foi criado
11. Na aba "Configuration", procure por:
    - `Public endpoint` (parece com: `redis-12345.c12.us-east-1-2.ec2.cloud.redislabs.com:12345`)
12. Clique no ícone "copy" para copiar

### Adicione ao `.env`:
```
REDIS_URL=redis://:password@host:port
```

Ou separe em:
```
REDIS_HOST=redis-12345.c12.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=xxxxx (se houver)
```

---

## 6. PostgreSQL Neon (Banco de Dados) - 5 min 🗄️

### O que é?
PostgreSQL é um banco de dados tradicional. Armazena:
- Usuários (email, nome, CPF)
- Transações de wallet
- Subscribers de email
- Campanhas
- Histórico de mensagens WhatsApp

### Passo a Passo:

1. Acesse: https://console.neon.tech/
2. Clique "Sign Up"
3. Crie conta (recomendo Google ou GitHub para mais rápido)
4. Depois de logado, você verá um projeto "quickstart"
5. Clique em cima dele
6. No painel, procure por:
   - **Connection string** ou **Connection details**
7. Você verá algo como:
   ```
   postgresql://user:password@ep-cool-lake-a1b2c3d4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
8. Copie toda esta string

### Adicione ao `.env`:
```
DATABASE_URL=postgresql://user:password@ep-cool-lake-a1b2c3d4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## Resumo Final - Seu `.env` deve ficar assim:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@suaempresa.com

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Redis Cache
REDIS_URL=redis://:password@host:port

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# App Config
JWT_SECRET=sua-chave-super-secreta-aqui-32-caracteres
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

---

## Próximos Passos

Depois de preencher o `.env`:

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco de dados
npx prisma migrate dev --name init

# 3. Iniciar servidor
npm run start:dev
```

Você verá:
```
🚀 Infer Coon Server Started
🌐 URL: http://localhost:3000
📚 Swagger Docs: http://localhost:3000/api
✅ Ready for execution!
```

Pronto! Todos os 4 dashboards (ONZAP, ONLOVE, ONMAIL, WALLET) com 20 endpoints estarão rodando.

---

## Troubleshooting

**"Redis connection refused"**
- Verifique se `REDIS_URL` está correto
- Tente: `redis-cli -u "seu_url" ping` (deve retornar "PONG")

**"Database connection failed"**
- Verifique se `DATABASE_URL` está correto
- Tente adicionar seu IP à whitelist do Neon (em settings)

**"Google OAuth invalid_client"**
- Verifique se as URIs de redirecionamento no Google Cloud estão exatas
- Certifique-se de que IDs estão corretos (sem espaços)

**"SendGrid API key invalid"**
- Gere uma nova chave
- Certifique-se de que começa com `SG.`

---

## Tempo Total Estimado
- Google Cloud OAuth: 15 min
- SendGrid: 10 min
- Sentry: 5 min
- Google Analytics: 5 min
- Redis Cloud: 5 min
- PostgreSQL Neon: 5 min
- Preenchimento `.env` e testes: 10 min

**TOTAL: ~55 minutos** (inclui confirmações de email e espera de criação)
