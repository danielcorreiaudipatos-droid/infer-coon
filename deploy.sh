#!/bin/bash

# 🚀 on.imob Deployment Script
# Uso: ./deploy.sh [heroku|docker|aws|digitalocean]

set -e

DEPLOY_TYPE=${1:-docker}
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "═══════════════════════════════════════════════════════════"
echo "🚀 on.imob Deployment ($DEPLOY_TYPE) — $TIMESTAMP"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Branch: $BRANCH"
echo "Commit: $COMMIT"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar branch
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "claude/zealous-edison-cv62ld" ]; then
    echo -e "${RED}❌ Erro: Deploy só é permitido a partir de 'main' ou 'claude/zealous-edison-cv62ld'${NC}"
    exit 1
fi

# Validar .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Erro: .env não encontrado${NC}"
    echo "Copie .env.example e configure suas variáveis:"
    echo "  cp .env.example .env"
    exit 1
fi

echo -e "${YELLOW}✓ Verificações pré-deploy${NC}"
echo ""

# Função para deploy com Docker
deploy_docker() {
    echo "📦 Building Docker image..."
    docker build -t on-imob:$COMMIT .

    echo "🐳 Iniciando Docker Compose..."
    docker-compose up -d

    echo "⏳ Aguardando inicialização..."
    sleep 10

    echo "🏥 Health check..."
    curl -f http://localhost:8000/health || {
        echo -e "${RED}❌ Health check falhou${NC}"
        exit 1
    }

    echo -e "${GREEN}✅ Deploy Docker concluído!${NC}"
    echo ""
    echo "Acesse: http://localhost:8000"
}

# Função para deploy com Heroku
deploy_heroku() {
    echo "🦄 Deploying para Heroku..."

    if ! command -v heroku &> /dev/null; then
        echo -e "${RED}❌ Heroku CLI não encontrado${NC}"
        echo "Instale em: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi

    # Login
    heroku login

    # Criar app se não existir
    if ! heroku apps:info -a on-imob-api &>/dev/null; then
        echo "Criando app Heroku..."
        heroku apps:create on-imob-api
    fi

    # Configurar variáveis de ambiente
    echo "📝 Configurando variáveis de ambiente..."
    source .env
    heroku config:set -a on-imob-api \
        SECRET_KEY="$SECRET_KEY" \
        GEMINI_API_KEY="$GEMINI_API_KEY" \
        STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
        ASSAS_API_KEY="$ASSAS_API_KEY" \
        WHATSAPP_ACCESS_TOKEN="$WHATSAPP_ACCESS_TOKEN" \
        DATABASE_URL="$DATABASE_URL"

    # Provisionar PostgreSQL
    heroku addons:create heroku-postgresql:standard-0 -a on-imob-api || true

    # Push
    echo "🚀 Enviando código..."
    git push heroku $BRANCH:main

    # URL
    APP_URL=$(heroku apps:info -a on-imob-api --json | grep -o '"web_url":"[^"]*' | cut -d'"' -f4)

    echo -e "${GREEN}✅ Deploy Heroku concluído!${NC}"
    echo ""
    echo "URL: $APP_URL"
    echo "Logs: heroku logs -a on-imob-api -t"
}

# Função para deploy com DigitalOcean
deploy_digitalocean() {
    echo "🌊 Deploying para DigitalOcean..."

    if ! command -v doctl &> /dev/null; then
        echo -e "${RED}❌ doctl CLI não encontrado${NC}"
        echo "Instale em: https://docs.digitalocean.com/reference/doctl/"
        exit 1
    fi

    echo "Implementação manual necessária"
    echo "Siga: https://docs.digitalocean.com/products/app-platform/getting-started/"
    exit 0
}

# Função para deploy com AWS
deploy_aws() {
    echo "☁️ Deploying para AWS..."

    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não encontrado${NC}"
        echo "Instale em: https://aws.amazon.com/cli/"
        exit 1
    fi

    echo "Implementação manual necessária"
    echo "Use Elastic Beanstalk:"
    echo "  1. eb init -p python-3.11 on-imob"
    echo "  2. eb create on-imob-prod"
    echo "  3. eb deploy"
    exit 0
}

# Executar deploy baseado no tipo
case $DEPLOY_TYPE in
    docker)
        deploy_docker
        ;;
    heroku)
        deploy_heroku
        ;;
    digitalocean|do)
        deploy_digitalocean
        ;;
    aws)
        deploy_aws
        ;;
    *)
        echo -e "${RED}❌ Tipo de deploy desconhecido: $DEPLOY_TYPE${NC}"
        echo ""
        echo "Opções válidas:"
        echo "  ./deploy.sh docker         — Deploy com Docker Compose"
        echo "  ./deploy.sh heroku         — Deploy para Heroku"
        echo "  ./deploy.sh digitalocean   — Deploy para DigitalOcean"
        echo "  ./deploy.sh aws            — Deploy para AWS Elastic Beanstalk"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Deploy concluído com sucesso!"
echo "═══════════════════════════════════════════════════════════"
