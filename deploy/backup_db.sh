#!/bin/bash
# ========================================================
# BACKUP CRIPTOGRAFADO ANTI-RANSOMWARE - COON (HETZNER)
# ========================================================

set -e

BACKUP_DIR="/var/backups/coon"
SOURCE_DB="/var/www/infer-coon/backend/infercoon_auth.db"
DATE_TAG=$(date +%Y%m%d_%H%M%S)
BACKUP_RAW="${BACKUP_DIR}/coon_auth_${DATE_TAG}.db"
ENCRYPTION_KEY="${COON_BACKUP_KEY:-CoonHoldingSecurity2026MasterBackupKey!}"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

if [ -f "${SOURCE_DB}" ]; then
    echo "📦 [1/3] Realizando snapshot online consistente (SQLite WAL safe)..."
    sqlite3 "${SOURCE_DB}" ".backup '${BACKUP_RAW}'"

    echo "🗜️ [2/3] Comprimindo snapshot..."
    gzip -f "${BACKUP_RAW}"

    echo "🔐 [3/3] Criptografando backup com AES-256-CBC (Inviolável)..."
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "${BACKUP_RAW}.gz" -out "${BACKUP_RAW}.db.gz.enc" -pass pass:"${ENCRYPTION_KEY}"
    
    # Remove arquivo sem criptografia para impedir leitura por invasores
    rm -f "${BACKUP_RAW}.gz"
    chmod 600 "${BACKUP_RAW}.db.gz.enc"

    echo "✅ Backup blindado e criptografado com sucesso: ${BACKUP_RAW}.db.gz.enc"

    # Rotacionar backups antigos: manter apenas os ultimos 30 dias
    find "${BACKUP_DIR}" -name "coon_auth_*.db.gz.enc" -mtime +30 -delete
    echo "🧹 Backups com mais de 30 dias removidos."
else
    echo "⚠️ Arquivo de banco de dados nao encontrado em ${SOURCE_DB}"
fi
