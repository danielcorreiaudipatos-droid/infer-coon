# 🚀 DEPLOYMENT GUIA COMPLETO — on.imob

## 📋 Índice

1. [Requisitos do Sistema](#requisitos)
2. [Configuração Local (Development)](#configuracao-local)
3. [Deployment em Produção](#deployment)
4. [Variáveis de Ambiente](#env-vars)
5. [Estrutura do Projeto](#estrutura)
6. [Próximos Passos](#proximos)

---

## Requisitos do Sistema {#requisitos}

### Hardware Recomendado (Produção)

```
CPU:     2+ cores
RAM:     4GB mínimo (8GB recomendado)
Storage: 20GB (SSD)
Bandw:   100Mbps+
```

### Software Necessário

```bash
# Python 3.11+
python --version  # >= 3.11

# pip (gerenciador de pacotes)
pip --version

# Git (para versionamento)
git --version

# PostgreSQL 14+ (recomendado para produção)
# SQLite (padrão em desenvolvimento)
```

---

## Configuração Local (Development) {#configuracao-local}

### 1. Clonar Repositório

```bash
git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git
cd infer-coon
```

### 2. Criar Ambiente Virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 4. Criar Arquivo `.env`

```bash
cp .env.example .env
```

Editar `.env` com suas configurações:

```env
# 🔐 Segurança
SECRET_KEY=sua_chave_secreta_super_segura_aqui
DEBUG=True

# 🗄️ Banco de Dados
DATABASE_URL=sqlite:///./on_imob.db

# 📧 Email (para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# 🤖 IA (Gemini)
GEMINI_API_KEY=sua_api_key_gemini

# 💬 WhatsApp (Meta API)
WHATSAPP_BUSINESS_ID=seu_business_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_VERIFY_TOKEN=seu_verify_token

# 💳 Stripe (Cartões)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=apy_example_key...

# 💰 Assas (PIX + Boleto + Split)
ASSAS_API_KEY=apy_...

# 🏦 Open Banking (configurar depois)
ITAU_CLIENT_ID=
ITAU_CLIENT_SECRET=
BRADESCO_CLIENT_ID=
BRADESCO_CLIENT_SECRET=
SANTANDER_CLIENT_ID=
SANTANDER_CLIENT_SECRET=

# 📍 VivaReal & ZapImóveis
VIVAREAL_TOKEN=
ZAPIMOVELS_TOKEN=
```

### 5. Rodar em Development

```bash
# Com FastAPI/Uvicorn
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Ou com Python direto
python -c "from backend.main import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8000)"
```

Acessar: `http://localhost:8000`

---

## Deployment em Produção {#deployment}

### Opção 1: Heroku (Mais Simples)

#### 1.1 Setup Heroku CLI

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login
```

#### 1.2 Criar App

```bash
heroku create on-imob-api
```

#### 1.3 Configurar Variáveis de Ambiente

```bash
heroku config:set SECRET_KEY=sua_chave_secreta
heroku config:set GEMINI_API_KEY=sua_api_key
heroku config:set STRIPE_SECRET_KEY=apy_example_key...
heroku config:set ASSAS_API_KEY=apy_...
# ... (todas as outras)
```

#### 1.4 Adicionar Procfile

```bash
# Arquivo: Procfile
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

#### 1.5 Deploy

```bash
git push heroku main
# ou
git push heroku claude/zealous-edison-cv62ld:main
```

#### 1.6 Database

```bash
# Provisionar PostgreSQL (free tier depreciado, usar jawsdb ou similar)
heroku addons:create jawsdb
```

### Opção 2: DigitalOcean App Platform

#### 2.1 Conectar Repositório

1. Ir para: https://cloud.digitalocean.com/apps
2. Clicar "Create App"
3. Conectar GitHub (autorizar access)
4. Selecionar repo: `infer-coon`

#### 2.2 Configuração

```yaml
# Arquivo: app.yaml (no repo)
name: on-imob
services:
- name: api
  github:
    repo: danielcorreiaudipatos-droid/infer-coon
    branch: claude/zealous-edison-cv62ld
  build_command: pip install -r requirements.txt
  run_command: uvicorn backend.main:app --host 0.0.0.0 --port 8080
  http_port: 8080
  envs:
  - key: SECRET_KEY
    value: ${SECRET_KEY}
  - key: GEMINI_API_KEY
    value: ${GEMINI_API_KEY}
  # ... outras variáveis
databases:
- name: postgres
  engine: PG
  version: "14"
```

#### 2.3 Deploy

Fazer push para main, DO faz deploy automático.

### Opção 3: AWS (Mais Robusto)

#### 3.1 Setup

```bash
# Instalar AWS CLI
pip install awscli

# Configurar credenciais
aws configure
```

#### 3.2 Deploy com Elastic Beanstalk

```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init -p python-3.11 on-imob

# Criar environment
eb create on-imob-prod

# Deploy
eb deploy

# Ver logs
eb logs
```

#### 3.3 RDS Database

```bash
# Criar PostgreSQL no RDS
# Via AWS Console: https://console.aws.amazon.com/rds/

# Atualizar .ebextensions/db.config
```

### Opção 4: Docker + Servidor Linux (Mais Controle)

#### 4.1 Criar Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 4.2 Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/on_imob
      SECRET_KEY: ${SECRET_KEY}
      # ... outras vars
    depends_on:
      - db
    
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: on_imob_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: on_imob_db
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

#### 4.3 Deploy

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Ver logs
docker-compose logs -f api
```

---

## Variáveis de Ambiente {#env-vars}

### Essenciais (Obrigatórias)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `SECRET_KEY` | `abc123xyz` | Chave JWT/CSRF (gerar: `python -c "import secrets; print(secrets.token_urlsafe(32))"`) |
| `DATABASE_URL` | `postgresql://...` | String de conexão ao banco |
| `DEBUG` | `False` | Desativar debug em produção |

### APIs Terceirizadas

| Variável | Tipo | Onde Gerar |
|----------|------|-----------|
| `GEMINI_API_KEY` | Google AI | https://makersuite.google.com/app/apikey |
| `STRIPE_SECRET_KEY` | Pagamento Cartão | https://dashboard.stripe.com/apikeys |
| `ASSAS_API_KEY` | PIX/Boleto/Split | https://www.assas.com/ |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp | https://www.meta.com/business/tools/meta-business-suite/ |

### Open Banking (Configurar Depois)

```env
# Itaú
ITAU_CLIENT_ID=seu_client_id
ITAU_CLIENT_SECRET=seu_secret
ITAU_AUTH_URL=https://auth.itau.com.br/oauth2/authorize

# Bradesco
BRADESCO_CLIENT_ID=seu_client_id
BRADESCO_CLIENT_SECRET=seu_secret

# Santander
SANTANDER_CLIENT_ID=seu_client_id
SANTANDER_CLIENT_SECRET=seu_secret
```

---

## Estrutura do Projeto {#estrutura}

```
on.imob/
├── backend/
│   ├── main.py                 # FastAPI app principal
│   ├── auth_advanced.py        # Login + Branding
│   ├── auth_endpoints.py       # Endpoints auth
│   ├── open_banking.py         # Open Banking logic
│   ├── open_banking_endpoints.py # Open Banking endpoints
│   ├── whatsapp_bot.py         # WhatsApp bot
│   ├── payment_gateway.py      # Pagamentos
│   ├── split_payment_assas.py  # Split Assas
│   ├── financial_advanced.py   # Financeiro
│   ├── site_generator.py       # Site auto-gerado
│   ├── integracao_vivareal.py  # VivaReal
│   ├── integracao_zapimov.py   # ZapImóveis
│   └── ...
├── frontend/
│   ├── landing.html            # Landing page
│   ├── login.html              # Login
│   ├── cadastro.html           # Cadastro
│   ├── settings.html           # Configurações
│   └── ...
├── requirements.txt            # Dependências Python
├── .env.example                # Exemplo de .env
├── Dockerfile                  # Docker
├── docker-compose.yml          # Docker Compose
├── Procfile                    # Heroku
├── app.yaml                    # DigitalOcean
└── DEPLOYMENT.md               # Este arquivo
```

---

## Health Check

### Testar API

```bash
# Teste simples
curl http://localhost:8000/

# Verificar status
curl http://localhost:8000/health

# API ativa?
curl -X GET http://localhost:8000/api/auth/status
```

---

## Logs e Monitoramento

### Heroku

```bash
heroku logs --tail
```

### DigitalOcean

```bash
doctl apps logs list
doctl apps logs get --app-id <id>
```

### Docker

```bash
docker logs -f on-imob_api_1
```

### Arquivo Log

```bash
tail -f /var/log/on-imob/app.log
```

---

## Performance e Scaling

### Otimizações

```python
# gunicorn (produção)
gunicorn -w 4 -b 0.0.0.0:8000 backend.main:app

# Cache com Redis
pip install redis
```

### CDN para Arquivos Estáticos

```
- Cloudflare (recomendado)
- AWS CloudFront
- DigitalOcean Spaces
```

---

## Segurança

### SSL/HTTPS

```bash
# Let's Encrypt (gratuito)
sudo apt install certbot

certbot certonly --standalone -d seu-dominio.com
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### CORS

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Próximos Passos {#proximos}

- [ ] Configurar domínio DNS
- [ ] Ativar SSL/HTTPS
- [ ] Configurar Open Banking (Itaú/Bradesco/Santander)
- [ ] Integrar Nota Fiscal (SEFAZ)
- [ ] Implementar DMOB
- [ ] Setup backups automáticos
- [ ] Monitoramento com Sentry/DataDog
- [ ] CI/CD com GitHub Actions

---

## Suporte

📧 Email: suporte@on.imob.com  
🔗 Docs: https://docs.on.imob.com  
🐛 Issues: https://github.com/danielcorreiaudipatos-droid/infer-coon/issues
