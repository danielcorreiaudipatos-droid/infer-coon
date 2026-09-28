# 🚀 Guia Rápido de Deploy na Hetzner Cloud • COON Soluções Tecnológicas

Este guia orienta a subida em produção de todo o ecossistema da **COON** (`coon.com.br`) na infraestrutura **Hetzner Cloud** em menos de 5 minutos, com custo de apenas **€ 3,79 a € 7,00/mês (~R$ 24 a R$ 44/mês)** e desempenho de disco NVMe dedicado (+1.000 MB/s).

---

## 📋 Passo 1: Criar a Máquina na Hetzner Cloud
1. Acesse o console da Hetzner: [console.hetzner.cloud](https://console.hetzner.cloud)
2. Clique em **"Add Server"** (Adicionar Servidor):
   * **Localização**: Ashburn (EUA) ou Nuremberg/Falkenstein (Alemanha). *Dica: Ashburn tem latência de ~110ms para o Brasil e excelente custo-benefício.*
   * **Imagem**: **Ubuntu 24.04 LTS** (padrão mais moderno e seguro).
   * **Tipo de Servidor**:
     * **CX22** (2 vCPU, 4 GB RAM, 40 GB NVMe) $\rightarrow$ **€ 3,79/mês** (Perfeito para início com até 1.000 clientes simultâneos).
     * ou **CPX21** (3 vCPU, 4 GB RAM, 80 GB NVMe) $\rightarrow$ **€ 7,05/mês** (Recomendado se for armazenar centenas de fotos de vistorias).
   * **Chave SSH**: Adicione sua chave pública SSH (ou defina para receber a senha de root por email).
   * **Nome do Servidor**: `coon-master-prod`
3. Clique em **"Create & Buy Now"**. Em 10 segundos o servidor estará ligado e você receberá o **endereço IP público** (ex: `159.69.123.45`).

---

## ⚡ Passo 2: Executar o Deploy 1-Click no seu Computador

### No Windows (PowerShell):
Abra o PowerShell na pasta do projeto e execute:
```powershell
.\deploy\deploy.ps1 -ServerIp SEU_IP_HETZNER
```
*(Se você não passar o IP, o script pedirá para você digitar no terminal).*

### No Linux / Mac:
```bash
bash deploy/deploy_remote.sh SEU_IP_HETZNER
```

### O que o script faz sozinho:
1. Empacota todo o código e assets limpos (sem `.venv` ou caches).
2. Envia para o servidor Hetzner em `/var/www/infer-coon`.
3. Atualiza os pacotes do Ubuntu, instala Python 3, Nginx, UFW, Git e Certbot.
4. Cria o ambiente virtual `.venv` e instala todos os pacotes do `requirements.txt`.
5. Configura o serviço de inicialização automática **`coon.service`** via Systemd (reinicia sozinho se a máquina reiniciar).
6. Configura o proxy reverso Nginx com compressão Gzip e suporte a uploads de 64MB.
7. Configura a rotina de **backup automático diário** do banco SQLite WAL às 03:00 da manhã.
8. Realiza teste de saúde automático na API.

---

## 🌐 Passo 3: Apontar o Domínio no Registro.br ou Cloudflare
Crie os seguintes registros DNS do tipo **A** apontando para o **IP do Servidor Hetzner**:

| Tipo | Nome / Subdomínio | Destino / IP |
| :---: | :--- | :---: |
| **A** | `@` (ou `coon.com.br`) | `SEU_IP_HETZNER` |
| **A** | `www` | `SEU_IP_HETZNER` |
| **A** | `ad` | `SEU_IP_HETZNER` |
| **A** | `growth` | `SEU_IP_HETZNER` |
| **A** | `cob` | `SEU_IP_HETZNER` |
| **A** | `imob` | `SEU_IP_HETZNER` |
| **A** | `check` | `SEU_IP_HETZNER` |
| **A** | `infer` | `SEU_IP_HETZNER` |

*(Ou se preferir usar Wildcard, crie apenas um registro A com `*` apontando para o IP).*

---

## 🔒 Passo 4: Ativar o SSL HTTPS Gratuito (Certbot)
Após o DNS propagar (normalmente 5 a 15 minutos), conecte via SSH no servidor:
```bash
ssh root@SEU_IP_HETZNER
```
E rode o comando único:
```bash
certbot --nginx -d coon.com.br -d www.coon.com.br -d ad.coon.com.br -d growth.coon.com.br -d cob.coon.com.br -d imob.coon.com.br -d check.coon.com.br -d infer.coon.com.br
```
Selecione a opção de redirecionar HTTP para HTTPS automaticamente. Pronto! Todos os subdomínios estarão com o cadeado verde de segurança oficial.

---

## 🛡️ Gestão e Manutenção Útil
* **Verificar status da aplicação**: `systemctl status coon`
* **Reiniciar aplicação após atualizações**: `systemctl restart coon`
* **Ver logs em tempo real**: `journalctl -u coon -f`
* **Ver backups criptografados**: `ls -lh /var/backups/coon/`
* **Ver IPs banidos pelo Fail2ban**: `fail2ban-client status sshd`

---

## 🏰 FORTIFICAÇÃO DE SEGURANÇA MÁXIMA (ZERO RESGATE & ZERO CÓPIAS)

Para garantir que a **COON Soluções Tecnológicas** nunca sofra ataques de ransomware (pedidos de resgate) nem pirataria/vazamento de código e dados de clientes, implementamos 6 barreiras de segurança militar:

### 1. Zero Pedidos de Resgate (Anti-Ransomware)
1. **SSH Somente por Chave Criptográfica (Sem Senha)**:
   * No servidor Hetzner, desative logins por senha editando `/etc/ssh/sshd_config`:
     ```bash
     PasswordAuthentication no
     PermitRootLogin prohibit-password
     systemctl restart sshd
     ```
   * Sem a sua chave privada no computador do invasor, robôs e criminosos levam bilhões de anos para tentar qualquer força bruta.
2. **Fail2ban Ativo**:
   * O `fail2ban` monitora as portas de conexão. Qualquer IP que errar 3 tentativas é banido sumariamente no firewall do kernel por 24 horas.
3. **Backups Criptografados AES-256 (`deploy/backup_db.sh`)**:
   * O banco de dados é salvo e imediatamente criptografado via OpenSSL com algoritmo militar AES-256-CBC.
   * Mesmo que um invasor invadisse o servidor e roubasse a pasta de backups, os arquivos são bytes ilegíveis sem a chave mestra.
4. **Snapshots em Nível de Hypervisor da Hetzner**:
   * No console da Hetzner, ative a opção **"Backups"** do servidor (€0,70/mês). A Hetzner cria um snapshot completo do disco fora da máquina virtual. Ransomware não consegue criptografar snapshots do hypervisor.

### 2. Zero Cópias de Código e Vazamento de Dados (Anti-Pirataria)
1. **Bloqueio Inviolável no Nginx (Zero Leak)**:
   * O `nginx_coon.conf` bloqueia qualquer tentativa de download direto de arquivos `.db`, `.sqlite`, `.py`, `.env`, `.sh`, `.log`, `.git`, `.bak`.
   * Tentativas de acessar `http://coon.com.br/backend/infercoon_auth.db` ou `http://coon.com.br/.env` retornam erro `404 Not Found` imediato.
2. **Isolamento de Banco SQLite**:
   * O banco SQLite opera como arquivo local protegido com permissões Unix `chmod 600`.
   * Diferente do PostgreSQL/MySQL, o SQLite **não possui portas de rede abertas (zero port exposure)**. Não há como um hacker conectar um cliente SQL de fora.
3. **Painel Master Admin Blindado com Chave Mestra**:
   * O acesso ao `/admin` e às rotas de métricas/clientes exige a **Master Key** oficial da diretoria (`COON_MASTER_KEY`).
   * Curiosos que acessam a URL encontram a tela bloqueada por modal de segurança com verificação criptográfica.
4. **Firewall UFW Ativo**:
   * Apenas as portas estritamente necessárias (22 SSH, 80 HTTP, 443 HTTPS) estão abertas. O Uvicorn escuta apenas no loopback local `127.0.0.1:8000`.
5. **Anti-DDoS e Anti-Scraper**:
   * O Nginx limita requisições a 25 req/s por IP com bloqueio automático de scanners maliciosos (sqlmap, nikto, censys, etc.).

