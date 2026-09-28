<#
.SYNOPSIS
    Script de Deploy 1-Click para Hetzner Cloud (Windows PowerShell)
    Holding COON Soluções Tecnológicas (www.coon.com.br)
.DESCRIPTION
    Empacota o projeto limpo, envia via SCP para o servidor Hetzner,
    configura o ambiente, systemd, Nginx, SSL e inicializa a aplicação.
.EXAMPLE
    .\deploy\deploy.ps1 -ServerIp 159.69.x.x
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIp,

    [Parameter(Mandatory=$false)]
    [string]$User = "root",

    [Parameter(Mandatory=$false)]
    [string]$SshKey = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY 1-CLICK COON • HETZNER CLOUD" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

if (-not $ServerIp) {
    $ServerIp = Read-Host "Digite o IP do Servidor Hetzner (ex: 159.69.123.45)"
}

if (-not $ServerIp) {
    Write-Host "❌ Erro: O endereço IP do servidor é obrigatório." -ForegroundColor Red
    exit 1
}

$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName
$BundlePath = Join-Path $env:TEMP "coon_bundle_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

Write-Host "`n📦 [1/4] Empacotando arquivos do projeto em: $BundlePath..." -ForegroundColor Yellow

$ExcludeList = @(".venv", "__pycache__", ".git", ".pytest_cache", ".idea", ".vscode")

# Criar lista de arquivos para empacotar
$FilesToZip = Get-ChildItem -Path $ProjectRoot -Recurse | Where-Object {
    $item = $_
    $skip = $false
    foreach ($ex in $ExcludeList) {
        if ($item.FullName -like "*\$ex*" -or $item.FullName -like "*/$ex*") {
            $skip = $true
            break
        }
    }
    -not $skip
}

# Criar arquivo temporário para compressão
Compress-Archive -Path $FilesToZip.FullName -DestinationPath $BundlePath -Force

Write-Host "✅ Pacote gerado com sucesso!" -ForegroundColor Green

Write-Host "`n📡 [2/4] Enviando arquivos para $User@$ServerIp..." -ForegroundColor Yellow
$ScpCmd = "scp"
$SshCmd = "ssh"
$KeyArg = if ($SshKey) { "-i `"$SshKey`"" } else { "" }

# Enviar pacote para /tmp
$Dest = "${User}@${ServerIp}:/tmp/coon_bundle.zip"
if ($SshKey) {
    & scp -i $SshKey $BundlePath $Dest
} else {
    & scp $BundlePath $Dest
}

Write-Host "`n⚙️ [3/4] Instalando dependências e configurando Nginx/Systemd na Hetzner..." -ForegroundColor Yellow

$RemoteScript = @"
set -e
apt update && apt install -y unzip curl
mkdir -p /var/www/infer-coon
unzip -o /tmp/coon_bundle.zip -d /var/www/infer-coon
rm -f /tmp/coon_bundle.zip
cd /var/www/infer-coon
chmod +x deploy/*.sh
bash deploy/setup_hetzner.sh

# Configurar cron para backup diario as 03h00 da manha
(crontab -l 2>/dev/null | grep -v 'backup_db.sh' ; echo "0 3 * * * /bin/bash /var/www/infer-coon/deploy/backup_db.sh >> /var/log/coon_backup.log 2>&1") | crontab -
"@

if ($SshKey) {
    & ssh -i $SshKey "${User}@${ServerIp}" $RemoteScript
} else {
    & ssh "${User}@${ServerIp}" $RemoteScript
}

Write-Host "`n🔍 [4/4] Testando saúde do servidor..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $TestUrl = "http://${ServerIp}/api/admin/metrics"
    $Response = Invoke-RestMethod -Uri $TestUrl -TimeoutSec 10
    Write-Host "✅ Servidor Operacional! Status: $($Response.system_status)" -ForegroundColor Green
    Write-Host "   MRR Consolidado: $($Response.mrr_formatted)" -ForegroundColor Cyan
    Write-Host "   Apps Ativos: $($Response.active_apps_count)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Servidor inicializado. Verifique status no servidor com: ssh $User@$ServerIp 'systemctl status coon'" -ForegroundColor Yellow
}

# Limpeza
Remove-Item -Path $BundlePath -Force -ErrorAction SilentlyContinue

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "Acesse o seu servidor em: http://${ServerIp}" -ForegroundColor Green
Write-Host "Após apontar o DNS coon.com.br, execute no servidor:" -ForegroundColor White
Write-Host "certbot --nginx -d coon.com.br -d www.coon.com.br -d ad.coon.com.br -d growth.coon.com.br -d cob.coon.com.br -d imob.coon.com.br -d check.coon.com.br -d infer.coon.com.br" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
