#!/bin/bash

# 🚀 DEPLOYMENT MONITOR - Verifica se tudo está no ar após 15 minutos

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 ONNEWS DEPLOYMENT MONITOR - 15 min check            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
WAIT_TIME=900  # 15 minutes
CHECK_INTERVAL=10

echo "⏳ Aguardando 15 minutos antes de verificar os endpoints..."
echo ""

# Show countdown
for ((i = WAIT_TIME; i > 0; i -= CHECK_INTERVAL)); do
    minutes=$((i / 60))
    seconds=$((i % 60))
    printf "\r⏱️  Tempo restante: %02d:%02d" $minutes $seconds
    sleep $CHECK_INTERVAL
done

echo ""
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ Hora de verificar se tudo está no ar!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Define endpoints to check
declare -A ENDPOINTS=(
    ["Infer Coon API"]="https://infer-coon-api.vercel.app/health"
    ["ONNEWS API"]="https://onnews-api.vercel.app/health"
    ["Main Website"]="https://infer-coon.vercel.app"
    ["Swagger Docs"]="https://onnews-api.vercel.app/docs"
)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check each endpoint
echo "🔍 VERIFICANDO ENDPOINTS..."
echo ""

UP_COUNT=0
DOWN_COUNT=0

for app in "${!ENDPOINTS[@]}"; do
    url="${ENDPOINTS[$app]}"

    # Try to access the endpoint
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5)

    if [[ "$http_code" =~ ^[23][0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ $app${NC}"
        echo "   Status: $http_code"
        echo "   URL: $url"
        ((UP_COUNT++))
    else
        echo -e "${RED}❌ $app${NC}"
        echo "   Status: $http_code (esperado 200-399)"
        echo "   URL: $url"
        ((DOWN_COUNT++))
    fi
    echo ""
done

# Summary
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "✅ UP:   $UP_COUNT / 4"
echo "❌ DOWN: $DOWN_COUNT / 4"
echo ""

if [ $UP_COUNT -eq 4 ]; then
    echo -e "${GREEN}🎉 TUDO ESTÁ NO AR!${NC}"
    echo ""
    echo "Suas aplicações estão LIVE:"
    echo ""
    echo "  🔵 Infer Coon API"
    echo "     https://infer-coon-api.vercel.app/api"
    echo ""
    echo "  📺 ONNEWS API"
    echo "     https://onnews-api.vercel.app/docs"
    echo ""
    echo "  🌐 Main Website"
    echo "     https://infer-coon.vercel.app"
    echo ""
    echo "  🎮 OnGame disponível"
    echo "  💬 OnZap disponível"
    echo "  💑 OnLove disponível"
    echo "  📧 OnMail disponível"
    echo "  📰 OnNews disponível"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""

elif [ $UP_COUNT -ge 2 ]; then
    echo -e "${YELLOW}⚠️  PARCIALMENTE NO AR${NC}"
    echo ""
    echo "Alguns endpoints estão respondendo. Aguarde mais um pouco"
    echo "e verifique novamente."
    echo ""

else
    echo -e "${RED}❌ NADA NO AR AINDA${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "  • Deployment ainda em andamento"
    echo "  • Environment variables não configuradas"
    echo "  • Conexão com banco de dados"
    echo "  • Erro no build"
    echo ""
    echo "Verifique:"
    echo "  1. GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions"
    echo "  2. Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
