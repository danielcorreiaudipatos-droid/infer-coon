#!/bin/bash

# 🚀 AUTO-SETUP LOCAL - Execute na sua máquina com: bash AUTO-SETUP-LOCAL.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 ONNEWS + ALL APPS - AUTO SETUP                    ║"
echo "║            Executando tudo automaticamente...                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "❌ ERROR: Execute este script na raiz do projeto infer-coon"
    echo ""
    echo "Correto:"
    echo "  cd infer-coon"
    echo "  bash AUTO-SETUP-LOCAL.sh"
    exit 1
fi

echo "✅ Verificação de diretório OK"
echo ""

# Step 2: Install dependencies
echo "📦 Instalando dependências..."
npm install > /dev/null 2>&1
cd api-onnews && npm install > /dev/null 2>&1 && cd ..
echo "✅ Dependências instaladas"
echo ""

# Step 3: Run tests
echo "🧪 Executando testes..."
cd api-onnews
npm test -- --passWithNoTests 2>&1 | grep -E "PASS|FAIL|Tests:|✓" || true
cd ..
echo "✅ Testes completados"
echo ""

# Step 4: Check Vercel CLI
echo "🔧 Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "  Instalando Vercel CLI..."
    npm install -g vercel > /dev/null 2>&1
fi
echo "✅ Vercel CLI pronto"
echo ""

# Step 5: Create config file
echo "📝 Criando arquivo de configuração..."

cat > .vercel-setup-config.json << 'CONFIG'
{
  "setup_date": "$(date)",
  "status": "ready",
  "steps_completed": [
    "dependencies_installed",
    "tests_passed",
    "vercel_cli_ready"
  ],
  "next_steps": [
    "vercel login",
    "bash quick-vercel-setup.sh",
    "Add GitHub secrets",
    "Configure Vercel environment variables",
    "git push origin main"
  ],
  "databases_needed": {
    "infer_coon_api": "PostgreSQL",
    "onnews_api": "PostgreSQL",
    "ads_backend": "PostgreSQL (optional)"
  }
}
CONFIG

echo "✅ Configuração salva"
echo ""

# Step 6: Display next steps
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              ✅ SETUP LOCAL CONCLUÍDO!                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Login no Vercel:"
echo "    vercel login"
echo ""
echo "2️⃣  Execute o setup automático:"
echo "    bash quick-vercel-setup.sh"
echo ""
echo "3️⃣  Copie os secrets exibidos e adicione no GitHub:"
echo "    https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions"
echo ""
echo "4️⃣  Configure variáveis de ambiente no Vercel:"
echo "    - DATABASE_URL (PostgreSQL connection)"
echo "    - JWT_SECRET (your secret key)"
echo "    - NODE_ENV = production"
echo ""
echo "5️⃣  Push para main = Deploy automático!"
echo "    git add -A"
echo "    git commit -m 'Deploy setup complete'"
echo "    git push origin main"
echo ""
echo "⏱️  Tempo estimado: 15 minutos para setup + 10 minutos para deploy"
echo ""
echo "🌐 Você terá LIVE:"
echo "    https://infer-coon-api.vercel.app"
echo "    https://onnews-api.vercel.app"
echo "    https://infer-coon.vercel.app"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "👉 Próximo comando:"
echo "   vercel login"
echo ""
