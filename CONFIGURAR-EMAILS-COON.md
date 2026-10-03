# 📧 CONFIGURAR 3 EMAILS COM coon.com.br

## Objetivo
Criar 3 emails profissionais usando seu domínio coon.com.br:
- on.imobi@coon.com.br (suporte)
- vendas@coon.com.br (vendas)
- financeiro@coon.com.br (financeiro)

---

## 🔧 OPÇÃO 1: Google Workspace (Recomendado)

### Passo 1: Comprar Google Workspace

```
1. Vai para workspace.google.com
2. Clica "Comece agora"
3. Digita seu domínio: coon.com.br
4. Seleciona plano:
   ├─ Business Starter: R$ 69/mês (1 usuário)
   ├─ Business Standard: R$ 140/mês (5 usuários)
   └─ Professional: 3 emails = Business Starter é suficiente
5. Paga e ativa
```

### Passo 2: Criar 3 Usuários

```
No painel de administração Google Workspace:

USUÁRIO 1: on.imobi (Suporte)
├─ Nome: on.imobi
├─ Email: on.imobi@coon.com.br
├─ Senha: [gera automaticamente]
└─ Salva

USUÁRIO 2: vendas (Vendas)
├─ Nome: vendas
├─ Email: vendas@coon.com.br
├─ Senha: [gera automaticamente]
└─ Salva

USUÁRIO 3: financeiro (Financeiro)
├─ Nome: financeiro
├─ Email: financeiro@coon.com.br
├─ Senha: [gera automaticamente]
└─ Salva
```

### Passo 3: Acessar Emails

```
Você (e seu time) acessam:
├─ on.imobi@coon.com.br (qualquer navegador)
├─ vendas@coon.com.br
├─ financeiro@coon.com.br
└─ Gmail web ou app do celular

Cada um tem sua própria caixa de entrada,
mas você é admin e pode acessar todos.
```

### Vantagens Google Workspace
✅ Email profissional (@coon.com.br)
✅ Gmail + Drive + Docs + Calendar
✅ Sincroniza com celular
✅ Backup automático
✅ Segurança nível Google

---

## 🔧 OPÇÃO 2: Email no Servidor (Se tiver cPanel)

### Verificar se tem cPanel

```
1. Vai para seu provedor de hospedagem
   (GoDaddy, Locaweb, Hostinger, etc)
2. Entra no painel de controle (cPanel)
3. Procura por "Email Accounts" ou "Contas de Email"
4. Se existir, pode criar email diretamente
```

### Criar Email no cPanel

```
1. Entra em cPanel > "Email Accounts"
2. Clica "Create"
3. Cria conta 1:
   ├─ Email: on.imobi
   ├─ Domínio: coon.com.br
   ├─ Senha: [forte]
   └─ Quota: 5GB
4. Repete para vendas@ e financeiro@
```

### Acessar Email

```
Vai para: mail.coon.com.br
├─ Email: on.imobi@coon.com.br
├─ Senha: [sua senha]
└─ Abre Webmail (Roundcube ou Horde)
```

### Ou sincronizar com Gmail

```
Se quer usar Gmail mesmo assim:

1. Abre Gmail pessoal (seu Gmail)
2. Settings > Accounts > "Add another email address"
3. Adiciona on.imobi@coon.com.br
4. Configura IMAP:
   ├─ IMAP server: mail.coon.com.br
   ├─ Port: 993 (SSL)
   └─ Senha: [sua senha cPanel]
5. Agora tudo que chegar em on.imobi@coon.com.br
   aparece no seu Gmail pessoal
```

---

## ⚡ OPÇÃO 3: Forwarding Rápido (Mais Fácil)

### Se você quer TUDO em um único Gmail

```
1. Vai no seu provedor (painel do domínio)
2. Procura "Email Forwarding" ou "Redirecionamento"
3. Cria forwarding:
   ├─ on.imobi@coon.com.br → seu_gmail@gmail.com
   ├─ vendas@coon.com.br → seu_gmail@gmail.com
   └─ financeiro@coon.com.br → seu_gmail@gmail.com
4. Pronto!

Todos os emails chegam no seu Gmail.
Você responde como se fosse do coon.com.br
(basta mudar o "De:" ao enviar).
```

### Como responder como on.imobi@coon.com.br

```
No Gmail:

1. Novo email
2. Clica no "De:" (ao lado de Enviar)
3. Adiciona:
   ├─ on.imobi@coon.com.br
   ├─ vendas@coon.com.br
   └─ financeiro@coon.com.br
4. Seleciona qual você quer usar
5. Envia

Email sai como se fosse daquele endereço,
mas resposta entra no seu Gmail pessoal.
```

---

## 🎯 RECOMENDAÇÃO FINAL

### Para Operação Profissional: Google Workspace
```
✅ Melhor opção
✅ Email + Drive + Docs + Calendar
✅ Apareça profissional
✅ Custo: R$ 69/mês (vale cada centavo)
└─ Tempo: 1 hora setup
```

### Para Começar Rápido: Forwarding
```
✅ Funciona em 5 minutos
✅ Sem custo adicional
✅ Tudo no seu Gmail
❌ Menos profissional (setup de forwarding)
└─ Você responde como se fosse daquele email
```

### Para Intermediário: cPanel Email
```
✅ Se já tem servidor
✅ Funciona bem
✅ Pode sincronizar com Gmail
❌ Interface menos amigável
└─ Depends no seu provedor
```

---

## 📋 PASSO-A-PASSO QUICK START

### Google Workspace (Recomendado)

```
9:00am  - Vai para workspace.google.com
9:05am  - Coloca domínio coon.com.br
9:10am  - Escolhe plano Business Starter
9:15am  - Verifica domínio (pode levar 1-2h)
10:00am - Cria 3 usuários:
          ├─ on.imobi@coon.com.br
          ├─ vendas@coon.com.br
          └─ financeiro@coon.com.br
11:00am - Testa: faz login em cada um
11:15am - Configura em .env:
          ├─ SUPPORT_EMAIL = on.imobi@coon.com.br
          ├─ SALES_EMAIL = vendas@coon.com.br
          └─ BILLING_EMAIL = financeiro@coon.com.br
11:30am - ✅ PRONTO
```

### Forwarding (Rápido)

```
9:00am  - Entra no painel do domínio
9:05am  - Procura "Email Forwarding"
9:10am  - Cria 3 forwarding:
          ├─ on.imobi@coon.com.br → seu_gmail
          ├─ vendas@coon.com.br → seu_gmail
          └─ financeiro@coon.com.br → seu_gmail
9:15am  - Testa: envia email para on.imobi@coon.com.br
9:20am  - Configura em .env (mesmo acima)
9:25am  - ✅ PRONTO (5 minutos!)
```

---

## ✅ VERIFICAÇÃO FINAL

```
Depois de setup, testa:

1. Envia email para on.imobi@coon.com.br
2. Você recebe em seu email?
3. Você consegue responder como on.imobi@coon.com.br?
4. Email aparece como "De: on.imobi@coon.com.br"?

Se tudo OK: ✅ PRONTO PARA VENDER
```

---

## 🚀 QUAL ESCOLHER?

```
Precisa de:           Escolhe:
────────────────────────────────────
Profissionalismo     → Google Workspace
Rápido              → Forwarding
Já tem servidor     → cPanel
```

---

**EU RECOMENDO: Google Workspace**
- Custo: R$ 69/mês
- Tempo: 1-2 horas
- Resultado: Profissional 100%
- Vale a pena!

Vamos começar? 🚀
