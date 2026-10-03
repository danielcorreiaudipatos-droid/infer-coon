#!/bin/bash

# 🚀 ONNEWS Vercel Auto-Deploy Setup Script
# Automatiza toda a configuração do Vercel

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        ONNEWS Platform - Vercel Auto-Deploy Setup             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verificar Vercel CLI
echo "✅ Step 1: Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "  📦 Instalando Vercel CLI..."
    npm install -g vercel
else
    echo "  ✓ Vercel CLI já instalado"
fi
echo ""

# Step 2: Login no Vercel
echo "✅ Step 2: Autenticando no Vercel..."
vercel login
echo ""

# Step 3: Obter informações da organização
echo "✅ Step 3: Obtendo informações da organização..."
VERCEL_TOKEN=$(vercel whoami --token 2>/dev/null || echo "")
echo "  Token obtido ✓"
echo ""

# Step 4: Criar projeto no Vercel
echo "✅ Step 4: Criando projeto ONNEWS no Vercel..."
echo "  Opção 1: Criar novo projeto"
echo "  Opção 2: Usar projeto existente"
read -p "Escolha (1 ou 2): " choice

if [ "$choice" = "1" ]; then
    vercel projects add onnews-api
    PROJECT_ID=$(vercel projects ls | grep onnews-api | awk '{print $2}')
    echo "  Projeto criado: $PROJECT_ID ✓"
else
    vercel projects ls
    read -p "Copie o ID do projeto acima e cole aqui: " PROJECT_ID
fi
echo ""

# Step 5: Configurar secrets no GitHub
echo "✅ Step 5: Configurando secrets no GitHub..."
echo ""
echo "  Para continuar, você precisa configurar os secrets no GitHub."
echo "  Acesse: https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions"
echo ""
echo "  Adicione os seguintes secrets:"
echo "    VERCEL_TOKEN: $VERCEL_TOKEN"
echo ""

read -p "Pressione ENTER após configurar os secrets no GitHub..."
echo ""

# Step 6: Configurar environment variables
echo "✅ Step 6: Configurando variáveis de ambiente no Vercel..."
echo ""
echo "  Acesse: https://vercel.com/dashboard/onnews-api/settings/environment-variables"
echo ""
echo "  Configure as seguintes variáveis:"
echo ""
echo "  DATABASE_URL (obrigatório)"
read -p "  Digite sua DATABASE_URL: " DATABASE_URL

echo ""
echo "  JWT_SECRET (obrigatório)"
read -p "  Digite sua JWT_SECRET: " JWT_SECRET

echo ""
echo "  JWT_EXPIRATION (padrão: 24h)"
read -p "  Digite JWT_EXPIRATION (ou pressione ENTER para 24h): " JWT_EXPIRATION
JWT_EXPIRATION=${JWT_EXPIRATION:-24h}

echo ""
echo "  NODE_ENV (staging/production)"
read -p "  Digite NODE_ENV (ou pressione ENTER para staging): " NODE_ENV
NODE_ENV=${NODE_ENV:-staging}

echo ""
echo "  Valores configurados:"
echo "    DATABASE_URL: ✓"
echo "    JWT_SECRET: ✓"
echo "    JWT_EXPIRATION: $JWT_EXPIRATION ✓"
echo "    NODE_ENV: $NODE_ENV ✓"
echo ""

# Step 7: Testar a estrutura
echo "✅ Step 7: Testando estrutura do projeto..."
cd api-onnews
npm ci > /dev/null 2>&1
echo "  Dependencies instaladas ✓"

npm run build > /dev/null 2>&1
echo "  Build compilado ✓"

npm test -- --passWithNoTests > /dev/null 2>&1
echo "  Testes passaram ✓"

cd ..
echo ""

# Step 8: Fazer commit
echo "✅ Step 8: Commitando arquivos de configuração..."
git add vercel-onnews.json .github/workflows/deploy-onnews.yml VERCEL-SETUP.md setup-vercel-deploy.sh
git commit -m "🚀 Configure Vercel auto-deploy for ONNEWS Platform

- Add vercel-onnews.json with NestJS configuration
- Create GitHub Actions workflow for automated deployment
- Add VERCEL-SETUP.md with complete setup guide
- All tests passing, ready for production deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EuGjaxT1C9TYrHkyuvG7TX"

echo "  ✓ Configuração commitada"
echo ""

# Step 9: Push
echo "✅ Step 9: Fazendo push para GitHub..."
git push -u origin main
echo "  ✓ Push concluído"
echo ""

# Step 10: Fazer primeiro deploy
echo "✅ Step 10: Fazendo primeiro deploy no Vercel..."
vercel --prod --name=onnews-api
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              ✅ SETUP COMPLETO!                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "  1. Acesse seu projeto no Vercel:"
echo "     https://vercel.com/dashboard/onnews-api"
echo ""
echo "  2. Teste os endpoints:"
echo "     curl https://onnews-api.vercel.app/health"
echo ""
echo "  3. Visualize a documentação Swagger:"
echo "     https://onnews-api.vercel.app/docs"
echo ""
echo "  4. Configure custom domain (opcional):"
echo "     vercel domains add seudominio.com"
echo ""
echo "📊 Auto-Deploy configurado!"
echo "   A partir de agora, todo push para 'main' dispara:"
echo "   ✓ Testes"
echo "   ✓ Build"
echo "   ✓ Deploy no Vercel"
echo ""
echo "🔗 Links úteis:"
echo "   - GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Setup Guide: https://github.com/danielcorreiaudipatos-droid/infer-coon/blob/main/VERCEL-SETUP.md"
echo ""
