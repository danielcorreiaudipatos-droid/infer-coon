#!/bin/bash
# 🚀 DEPLOY VERCEL - Script Pronto

echo "==============================================="
echo "🚀 DEPLOYING ADS INTELIGENTE TO VERCEL"
echo "==============================================="

# 1. Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado"
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI encontrado"

# 2. Login Vercel (primeira vez)
echo ""
echo "🔐 Fazendo login no Vercel..."
vercel login

# 3. Deploy
echo ""
echo "📤 Iniciando deploy..."
vercel --prod

# 4. Configurar domínio (se tiver comprado)
echo ""
echo "🌍 Quer configurar domínio customizado?"
read -p "Digite seu domínio (ex: ads-inteligente.com.br) ou pressione ENTER para pular: " domain

if [ ! -z "$domain" ]; then
    echo ""
    echo "⚙️  Configurando domínio $domain"
    echo "Siga os passos no painel do Vercel:"
    echo "1. Vá em https://vercel.com/dashboard"
    echo "2. Selecione seu projeto"
    echo "3. Settings > Domains"
    echo "4. Adicione: $domain"
    echo "5. Configure DNS no seu provider"
    echo ""
    echo "📌 Registros DNS necessários:"
    vercel domains ls
fi

echo ""
echo "✅ DEPLOY COMPLETO!"
echo ""
echo "🎯 Seu site está em: https://infer-coon.vercel.app"
echo ""
echo "📝 Próximos passos:"
echo "1. Testar landing page no navegador"
echo "2. Configurar email automation (Mailchimp)"
echo "3. Integrar WhatsApp (Twilio)"
echo "4. Começar campanhas social media"
echo ""
