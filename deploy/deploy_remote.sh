#!/bin/bash
# ========================================================
# SCRIPT DE DEPLOY REMOTO 1-CLICK - HETZNER CLOUD (BASH)
# Holding COON Soluções Tecnológicas (www.coon.com.br)
# ========================================================

set -e

SERVER_IP="$1"
SSH_USER="${2:-root}"

if [ -z "$SERVER_IP" ]; then
    read -p "Digite o IP do Servidor Hetzner: " SERVER_IP
fi

if [ -z "$SERVER_IP" ]; then
    echo "❌ Erro: O endereço IP do servidor é obrigatório."
    exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_PATH="/tmp/coon_bundle_$(date +%s).tar.gz"

echo "========================================================"
echo "🚀 DEPLOY 1-CLICK COON • HETZNER CLOUD"
echo "========================================================"

echo "📦 [1/4] Empacotando arquivos do projeto em: ${BUNDLE_PATH}..."
tar --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    -czf "${BUNDLE_PATH}" -C "${PROJECT_ROOT}" .

echo "📡 [2/4] Enviando arquivos para ${SSH_USER}@${SERVER_IP}..."
scp "${BUNDLE_PATH}" "${SSH_USER}@${SERVER_IP}:/tmp/coon_bundle.tar.gz"
rm -f "${BUNDLE_PATH}"

echo "⚙️ [3/4] Instalando dependências e configurando Nginx/Systemd na Hetzner..."
ssh "${SSH_USER}@${SERVER_IP}" 'bash -s' << 'EOF'
set -e
mkdir -p /var/www/infer-coon
tar -xzf /tmp/coon_bundle.tar.gz -C /var/www/infer-coon
rm -f /tmp/coon_bundle.tar.gz
cd /var/www/infer-coon
chmod +x deploy/*.sh
bash deploy/setup_hetzner.sh

# Configurar cron para backup diario as 03h00 da manha
(crontab -l 2>/dev/null | grep -v 'backup_db.sh' ; echo "0 3 * * * /bin/bash /var/www/infer-coon/deploy/backup_db.sh >> /var/log/coon_backup.log 2>&1") | crontab -
EOF

echo "🔍 [4/4] Testando saúde do servidor..."
sleep 3
curl -s "http://${SERVER_IP}/api/admin/metrics" || true

echo "========================================================"
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "Acesse o seu servidor em: http://${SERVER_IP}"
echo "========================================================"
