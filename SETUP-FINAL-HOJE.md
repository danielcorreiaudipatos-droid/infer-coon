# 🚀 SETUP FINAL — O QUE FAZER HOJE

## ⏰ Timeline: TODAY (Hoje)

```
9am:   Email setup (Gmail → on.imobi@coon.com.br)
11am:  Stripe setup (receber pagamentos)
1pm:   Domínio setup (apontar DNS)
3pm:   Testes finais
5pm:   PRONTO para vender
```

---

## 📧 EMAIL SETUP (Seu Gmail + Aliases)

### Opção 1: Gmail Forwarding (Mais Simples)

```
SEU EMAIL:
├─ Pessoal: fcengenharia2015@gmail.com
└─ Para negócio: criar alias no Gmail

PASSO 1: Ir para Gmail Settings
├─ Clique seu perfil (canto superior direito)
├─ "Manage your Google Account"
├─ Aba "Personal info"
├─ Clique "Email address"
└─ "Add email address"

PASSO 2: Adicionar alias
├─ Novo email: on.imobi@coon.com.br (se tiver domínio)
├─ OU: on.imobi.coon@gmail.com (se usar Gmail)
└─ Confirmar

PASSO 3: Usar alias ao enviar
├─ Abrir novo email em Gmail
├─ Clique "De:" (ao lado de Enviar)
├─ Selecione on.imobi@coon.com.br
└─ Envie como esse endereço

RESULTADO:
└─ Email sai como "on.imobi@coon.com.br"
└─ Resposta entra em fcengenharia2015@gmail.com
```

### Opção 2: Usar Gmail Diretamente (Fácil)

```
Email de negócio: on.imobi.coon@gmail.com
├─ Criar conta Google nova (2 min)
├─ Usar para assinar emails de negócio
├─ Deixar forwarding para seu Gmail pessoal
└─ PRONTO em 5 minutos

COMO FAZER:
1. Vai para gmail.com
2. Clique "Criar conta"
3. Nome: "on.imobi"
4. Email: on.imobi.coon@gmail.com
5. Senha: (use senha forte)
6. Confirma telefone
7. PRONTO

FORWARDING (opcional):
1. Entra na conta on.imobi.coon@gmail.com
2. Settings > Forwarding and POP/IMAP
3. Adiciona: fcengenharia2015@gmail.com
4. Confirma
5. Agora tudo que chegar vai para seu Gmail pessoal
```

---

## 💳 STRIPE SETUP (Receber Pagamentos)

### Passo 1: Criar Conta Stripe

```
1. Vai para stripe.com
2. Clica "Start now" (botão azul)
3. Email: on.imobi.coon@gmail.com
4. Nome: Seu Nome Completo
5. Cria senha forte
6. Confirma email
```

### Passo 2: Verificar Identidade

```
Stripe pede:
├─ Seu nome completo
├─ Data de nascimento
├─ Número de telefone
├─ Endereço
├─ CPF (se pessoa física) ou CNPJ (se empresa)
└─ Documento de identidade (foto RG/CNH)

Coloca tudo e clica "Verificar"
(demora 1-5 min)
```

### Passo 3: Configurar Pagamento

```
1. Entra no Dashboard Stripe
2. Va para "Conta > Configurações"
3. Clica "Contas bancárias"
4. Adiciona sua conta (banco, agência, conta, digito)
5. Stripe faz 2 depósitos pequenos (confirmação)
6. Depois você confirma com os valores
```

### Passo 4: Gerar API Keys

```
1. Va para "Developers > API Keys"
2. Copia a "Secret key" (a longa, comeca com sk_live_)
3. Copia a "Publishable key"
4. GUARDA ESSES VALORES (vão no .env)

CUIDADO: Secret key é confidencial!
Não commit no GitHub, não compartilha!
```

### Passo 5: Adicionar ao on.imob

```
Edita .env:
├─ STRIPE_SECRET_KEY = sk_live_xxxx
├─ STRIPE_PUBLIC_KEY = pk_live_xxxx
└─ STRIPE_WEBHOOK_SECRET = whsec_xxxx

Redeploy da app:
docker-compose restart backend
```

---

## 🌐 DOMÍNIO SETUP (on-imob.com)

### Opção 1: Comprar Novo Domínio

```
PROVEDOR: Namecheap, Godaddy, Registro.br

PASSO 1: Comprar
├─ Vai para namecheap.com
├─ Procura "on-imob.com"
├─ Clica "Add to cart"
├─ Checkout (paga ~ R$ 50-80/ano)
└─ Confirma

PASSO 2: Apontar para on.imob
├─ Entra no painel do domínio
├─ Vai para "DNS Settings"
├─ Adiciona registros (abaixo)
└─ Salva (demora 24-48h para propagar)
```

### DNS Records (Adiciona Esses)

```
TYPE    NAME                VALUE
──────────────────────────────────────
A       @                   Your Server IP
                            (pega de Render)

A       www                 Same IP

CNAME   mail                mail.google.com
        (se usar Google Workspace)

MX      @                   aspmx.l.google.com
        (se usar Gmail para email)

TXT     @                   v=spf1 include:
                            _spf.google.com ~all
```

### Passo 3: SSL Certificate

```
Render/Heroku já fornece SSL grátis
Você não precisa fazer nada!

on-imob.com terá certificado HTTPS automático
✅ Seguro para clientes
```

### Verificação (Esperar 24-48h)

```
Depois que DNS propagar, testa:
1. Abre on-imob.com no navegador
2. Deve aparecer seu site (com HTTPS)
3. Email on-imob@on-imob.com funciona
```

---

## ✅ TESTE FINAL (Hoje, 4pm)

### Checklist

```
[ ] Email on.imobi@coon.com.br recebendo
[ ] Stripe keys configuradas no .env
[ ] PIX ativo (você tem chave PIX? Configura em .env)
[ ] Domínio apontando (ou vai apontar em 24h)
[ ] Landing page carregando (https://on-imob.com)
[ ] Login funciona
[ ] Importação de dados funciona
[ ] Avaliação científica funciona (teste com 1 imóvel)
[ ] Pagamento PIX funciona (teste com R$ 1)
```

### Se algo não funcionar

```
Problema: Stripe não autenticou
Solução: Pode levar 24-48h, testa amanhã

Problema: Domínio não aponta
Solução: DNS demora 24-48h, é normal

Problema: Email não recebe
Solução: Verifica IMAP/SMTP settings no Gmail

Nada disso é urgente (tudo para amanhã funciona).
```

---

## 📤 EMAILS JÁ CONFIGURADOS

### Email 1: Support (on.imobi.suporte@gmail.com)

```
Para: Clientes com dúvidas técnicas
Responde em: <2 horas
Assinatura:

---
Time de Suporte
on.imob
📧 on.imobi.suporte@gmail.com
📱 WhatsApp: [seu numero]
🕐 Seg-Sex, 9am-6pm
```

### Email 2: Sales (on.imobi.vendas@gmail.com)

```
Para: Prospects que querem demo/info
Responde em: <1 hora
Assinatura:

---
Time de Vendas
on.imob
📧 on.imobi.vendas@gmail.com
🔗 Calendly: [seu link de agendamento]
🕐 Seg-Sex, 9am-6pm
```

### Email 3: Billing (on.imobi.financeiro@gmail.com)

```
Para: Clientes com dúvidas de pagamento
Responde em: <24 horas
Assinatura:

---
Time Financeiro
on.imob
📧 on.imobi.financeiro@gmail.com
💳 Aceitamos: PIX, Boleto, Cartão
🕐 Seg-Sex, 9am-6pm
```

---

## 🔧 CONFIGURAR EMAILS EM .env

```
# Email Setup
SUPPORT_EMAIL = on.imobi.suporte@gmail.com
SALES_EMAIL = on.imobi.vendas@gmail.com
BILLING_EMAIL = on.imobi.financeiro@gmail.com
SMTP_SERVER = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [seu gmail]
SMTP_PASSWORD = [senha app google]

# Stripe
STRIPE_SECRET_KEY = sk_live_xxxx
STRIPE_PUBLIC_KEY = pk_live_xxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxx

# PIX
PIX_KEY = [sua chave pix]

# Domínio
DOMAIN = on-imob.com
```

---

## 🚀 ORDEM DE EXECUÇÃO (HOJE)

```
9:00am  - Começa: Email setup (5 min)
9:05am  - Stripe: Criar conta (5 min)
9:15am  - Stripe: Verificar identidade (aguarda 5 min)
9:30am  - Stripe: Adicionar banco (5 min)
10:00am - Stripe: Gerar API keys (2 min)
10:10am - Atualizar .env (5 min)
10:15am - Redeploy backend (5 min)
10:25am - Domínio: Comprar (5 min)
10:35am - Domínio: Apontar DNS (5 min)
11:00am - PAUSA ☕
2:00pm  - Testes (checklist acima)
3:00pm  - Ajustes finais (se necessário)
5:00pm  - ✅ PRONTO PARA VENDER
```

---

## 📝 CHECKLIST FINAL

```
EMAILS:
[ ] on.imobi.suporte@gmail.com (criada)
[ ] on.imobi.vendas@gmail.com (criada)
[ ] on.imobi.financeiro@gmail.com (criada)
[ ] Forwarding para seu Gmail (opcional mas recomendado)

STRIPE:
[ ] Conta criada
[ ] Identidade verificada
[ ] Banco adicionado
[ ] API keys geradas
[ ] Keys no .env
[ ] Backend redeployed

DOMÍNIO:
[ ] Comprado (on-imob.com ou similar)
[ ] DNS apontando para servidor
[ ] HTTPS funcionando
[ ] Email funciona

TESTES:
[ ] Site carrega
[ ] Login funciona
[ ] Avaliação gera PDF
[ ] Pagamento PIX funciona
[ ] Email de confirmação chega

RESULTADO: ✅ PRONTO PARA PRIMEIRA VENDA
```

---

## 📞 PROBLEMAS COMUNS & SOLUÇÕES

**P: Stripe demora para verificar?**
```
R: Normal. Pode levar até 24-48h.
   Enquanto isso, usa PIX/Boleto (sem Stripe).
   Stripe é só para cartão.
```

**P: Domínio não aponta?**
```
R: DNS demora 24-48h para propagar.
   Enquanto isso, usa domínio temporário.
   Render fornece: on-imob-app.render.com
```

**P: Email não recebe?**
```
R: Verifica SPAM folder.
   Se não chegar, verifica SMTP settings.
   Gmail pode bloquear se usar senha normal.
   Usa "Senha de Aplicativo" (Google Security).
```

**P: Tudo pronto mas não vende?**
```
R: Primeiro dia é sempre mais lento.
   Começa: chamadas + emails + LinkedIn.
   Depois: anúncios (Google Ads + LinkedIn Ads).
```

---

**HOJE: Setup final (2-3 horas de trabalho)**
**AMANHÃ: Primeira venda (comece a vender!)**

Bora? 🚀
