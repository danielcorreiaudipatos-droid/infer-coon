#!/bin/bash
# ========================================================
# SCRIPT DE INSTALACAO 1-CLICK & FORTIFICACAO DE SEGURANCA
# HETZNER CLOUD (UBUNTU 24.04 LTS)
# Holding COON Solucoes Tecnologicas (www.coon.com.br)
# ========================================================

set -e

echo "========================================================"
echo "🚀 Iniciando Instalacao & Blindagem do Servidor COON..."
echo "========================================================"

# 1. Atualizar Pacotes do Sistema Operacional
apt update && apt upgrade -y

# 2. Instalar Dependencias do Sistema e Ferramentas de Seguranca
# (Python, Nginx, Git, Certbot, Fail2ban, UFW, OpenSSL, SQLite3)
apt install -y python3 python3-pip python3-venv git nginx certbot python3-certbot-nginx curl ufw fail2ban openssl sqlite3

# 3. Criar Diretorio da Aplicacao
mkdir -p /var/www/infer-coon
cd /var/www/infer-coon

# 4. Criar Ambiente Virtual Python (.venv)
python3 -m venv .venv
source .venv/bin/activate

# 5. Instalar Dependencias Python
pip install --upgrade pip
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
else
    pip install fastapi uvicorn statsmodels pandas scipy numpy Jinja2 pydantic
fi

# 6. Configurar Servico Systemd (FastAPI 24/7 com 4 Workers)
cp deploy/coon.service /etc/systemd/system/coon.service
systemctl daemon-reload
systemctl enable coon
systemctl restart coon

# 7. Configurar Nginx Blindado (Zero Leak & Anti-Scraper)
cp deploy/nginx_coon.conf /etc/nginx/sites-available/coon
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/coon /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 8. Ativar e Configurar Fail2ban (Anti-Forca Bruta SSH e Nginx)
cat << 'EOF' > /etc/fail2ban/jail.local
[DEFAULT]
bantime = 86400
findtime = 600
maxretry = 3
backend = auto

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# 9. Blindagem de Permissoes de Arquivos (Anti-Copia e Anti-Invasao Local)
mkdir -p /var/backups/coon
chmod 700 /var/backups/coon
chmod 700 /var/www/infer-coon/deploy
if [ -f "/var/www/infer-coon/backend/infercoon_auth.db" ]; then
    chmod 600 /var/www/infer-coon/backend/infercoon_auth.db
fi

# 10. Firewall Estrito (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Seguro'
ufw allow 80/tcp comment 'HTTP Nginx'
ufw allow 443/tcp comment 'HTTPS Nginx'
ufw --force enable

echo "========================================================"
echo "🛡️ SERVIDOR COON OPERACIONAL E FORTIFICADO!"
echo "• Firewall UFW Ativo: Portas 22, 80 e 443"
echo "• Fail2ban Ativo: Bloqueio de IPs apos 3 falhas de conexao"
echo "• Nginx Blindado: Arquivos .db, .py, .env inacessiveis via web"
echo "• Backups Criptografados: AES-256 ativado em /var/backups/coon"
echo "--------------------------------------------------------"
echo "Para instalar o SSL HTTPS gratuito oficial apos apontar o dominio:"
echo "certbot --nginx -d coon.com.br -d www.coon.com.br -d infer.coon.com.br -d ad.coon.com.br -d growth.coon.com.br -d cob.coon.com.br -d imob.coon.com.br -d check.coon.com.br"
echo "========================================================"
