# 🚀 QUICK START — Deployment on.imob

## ⚡ Opção Mais Rápida: Docker (5 minutos)

### Passo 1: Clonar e Configurar

```bash
git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git
cd infer-coon
git checkout claude/zealous-edison-cv62ld

# Copiar configurações
cp .env.example .env
```

### Passo 2: Editar .env

```bash
# Edite os valores principais:
# - SECRET_KEY (importante!)
# - DATABASE_URL (usar PostgreSQL em produção)
# - GEMINI_API_KEY
# - STRIPE_SECRET_KEY
# - ASSAS_API_KEY
# - etc...
```

### Passo 3: Deploy com Docker

```bash
# Dar permissão ao script
chmod +x deploy.sh

# Executar
./deploy.sh docker
```

**✅ Pronto!** Acesse: `http://localhost:8000`

---

## 🟢 Heroku (Simplíssimo)

### Pré-requisitos

```bash
# 1. Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Criar conta gratuita
# https://www.heroku.com

# 3. Login
heroku login
```

### Deploy

```bash
./deploy.sh heroku
```

**URL:** `https://on-imob-api.herokuapp.com`

---

## 🏗️ AWS (Mais robusto)

### Pré-requisitos

```bash
# 1. Conta AWS
# https://aws.amazon.com

# 2. AWS CLI
pip install awscli
aws configure

# 3. EB CLI
pip install awsebcli
```

### Deploy

```bash
./deploy.sh aws
```

---

## 🌊 DigitalOcean (Meio termo)

### Pré-requisitos

```bash
# 1. Conta DigitalOcean
# https://www.digitalocean.com

# 2. doctl CLI
# https://docs.digitalocean.com/reference/doctl/
```

### Deploy

```bash
./deploy.sh digitalocean
```

---

## 🧪 Testar Localmente (Dev)

```bash
# Sem Docker
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Rodar
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Acesse: http://localhost:8000
```

---

## ✅ Health Check

```bash
# Testar se está rodando
curl http://localhost:8000/health

# Resposta esperada:
# {"status": "ok"}
```

---

## 📊 Monitorar

### Docker

```bash
# Ver logs
docker-compose logs -f api

# Ver status
docker-compose ps

# Parar
docker-compose down
```

### Heroku

```bash
# Logs em tempo real
heroku logs -a on-imob-api -t

# Status
heroku ps -a on-imob-api
```

### AWS

```bash
# Logs
eb logs

# Status
eb status
```

---

## 🔐 Variáveis Essenciais

Mínimo necessário no `.env`:

```env
# Obrigatórias
SECRET_KEY=sua_chave_secreta_super_segura
DATABASE_URL=postgresql://user:pass@db:5432/on_imob
DEBUG=False

# APIs
GEMINI_API_KEY=sua_api_key
STRIPE_SECRET_KEY=sk_live_xxxxx
ASSAS_API_KEY=apy_xxxxx
WHATSAPP_ACCESS_TOKEN=seu_token

# Bancos (Open Banking)
ITAU_CLIENT_ID=seu_id
ITAU_CLIENT_SECRET=seu_secret
```

---

## 🐛 Solução de Problemas

### Docker: "Port 8000 already in use"

```bash
# Mudar porta em docker-compose.yml
# ports:
#   - "8001:8000"  # <-- mude para 8001
```

### Heroku: "Push rejected"

```bash
# Verificar credenciais
heroku auth:whoami

# Re-login
heroku logout
heroku login
```

### Variável de ambiente não reconhecida

```bash
# Verificar se está em .env
cat .env | grep MINHA_VAR

# Se em Docker, atualizar docker-compose.yml
# Se em Heroku, rodar:
heroku config:set MINHA_VAR=valor
```

---

## 📞 Suporte

- 📖 Docs: https://docs.on.imob.com
- 📧 Email: suporte@on.imob.com
- 🐛 Issues: https://github.com/danielcorreiaudipatos-droid/infer-coon/issues

---

## 🎯 Resumo de Tempo

| Plataforma | Tempo | Dificuldade | Custo |
|-----------|-------|-----------|-------|
| Docker | 5 min | ⭐ | R$0 (local) |
| Heroku | 10 min | ⭐ | R$7/mês+ |
| AWS | 20 min | ⭐⭐⭐ | R$10/mês+ |
| DigitalOcean | 15 min | ⭐⭐ | R$5/mês+ |

**Recomendação:** Comece com Docker (grátis), depois migre para Heroku (mais fácil) ou AWS (mais poderoso).
