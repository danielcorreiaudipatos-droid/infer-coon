# 🔐 GitHub Secrets Setup - OnCreators Production Deploy

**Configure esses 4 secrets no GitHub para ativar deploy automático**

---

## 📋 Passo 1: Acesse Secrets do GitHub

1. Abra: https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions
2. Clique em "New repository secret"

---

## 🔵 Passo 2: VERCEL_TOKEN

**Onde pegar:**
1. Acesse: https://vercel.com/account/tokens
2. Clique "Create Token"
3. Nome: "GitHub Deploy"
4. COPIE o token

**No GitHub:**
- Nome: `VERCEL_TOKEN`
- Valor: [Cole o token]
- Clique "Add secret"

---

## 🔵 Passo 3: VERCEL_ORG_ID

**Onde pegar:**
1. Acesse: https://vercel.com/account/general
2. Procure por "Team ID" ou "Organization ID"
3. COPIE o valor

**No GitHub:**
- Nome: `VERCEL_ORG_ID`
- Valor: [Cole o ID]
- Clique "Add secret"

---

## 🔵 Passo 4: VERCEL_PROJECT_ID

**Onde pegar:**
1. Acesse: https://vercel.com/projects
2. Crie novo projeto: "oncreators"
3. Após criar, abra Settings
4. Procure por "Project ID"
5. COPIE o ID

**No GitHub:**
- Nome: `VERCEL_PROJECT_ID`
- Valor: [Cole o Project ID]
- Clique "Add secret"

---

## 🟢 Passo 5: RAILWAY_TOKEN

**Onde pegar:**
1. Acesse: https://railway.app/account/tokens
2. Clique "New Token"
3. Nome: "GitHub Deploy"
4. COPIE o token

**No GitHub:**
- Nome: `RAILWAY_TOKEN`
- Valor: [Cole o token]
- Clique "Add secret"

---

## ✅ Resumo dos Secrets Necessários

```
VERCEL_TOKEN        ← Token pessoal do Vercel
VERCEL_ORG_ID       ← ID da sua organização/conta Vercel
VERCEL_PROJECT_ID   ← ID do projeto "oncreators" no Vercel
RAILWAY_TOKEN       ← Token da API do Railway
```

---

## 🚀 Depois de Configurar

1. Todos os 4 secrets configurados ✅
2. Faça um commit: `git push origin main`
3. Vá para: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
4. Clique na action "🚀 Deploy to Production"
5. Veja o deploy acontecer em tempo real! 🎉

---

## 📊 O que Acontece Automaticamente

✅ Código é testado (90+ testes)  
✅ Backend é compilado (NestJS)  
✅ Frontend é compilado (React)  
✅ Frontend faz deploy para Vercel  
✅ Backend faz deploy para Railway  
✅ Database migrations rodam automaticamente  
✅ OnCreators fica LIVE! 🎬  

---

## ⏱️ Tempo Total

- Build: ~5 minutos
- Deploy: ~10 minutos
- Total: ~15-20 minutos para estar online

---

## 🆘 Precisa de Ajuda?

Se não conseguir encontrar algum valor:

**Vercel:**
- Token: https://vercel.com/account/tokens
- Org ID: https://vercel.com/account/general
- Project ID: Projeto → Settings → Project ID

**Railway:**
- Token: https://railway.app/account/tokens

---

## ✨ Pronto!

Uma vez configurado, **cada push para main dispara deploy automático**. 

OnCreators subirá automaticamente para produção! 🚀
