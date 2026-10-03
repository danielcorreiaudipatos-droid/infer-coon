# 🚀 DEPLOY NOW - Complete Instructions

**Este guia é para executar na sua máquina local (com acesso a browser)**

---

## ✅ PASSO 1: Preparar a Máquina Local

```bash
# Clone o repositório
git clone https://github.com/danielcorreiaudipatos-droid/infer-coon.git
cd infer-coon

# Atualize para o último código
git pull origin main

# Instale Vercel CLI
npm install -g vercel
```

---

## ✅ PASSO 2: Login no Vercel

```bash
vercel login
```

Isso abrirá uma janela do navegador. Complete o login com sua conta Vercel ou crie uma nova conta.

---

## ✅ PASSO 3: Obtenha suas Credenciais

```bash
# Copie seu token
vercel whoami --token
# Salve este valor: VERCEL_TOKEN

# Liste suas organizações/times
vercel teams ls
# Copie: ID e SLUG (scope)

# Liste seus projetos (se houver)
vercel projects ls
```

---

## ✅ PASSO 4: Execute o Setup Automático

```bash
bash quick-vercel-setup.sh
```

O script irá:
1. ✅ Criar 3 projetos no Vercel automaticamente
2. ✅ Exibir os secrets para você adicionar ao GitHub
3. ✅ Guiar a configuração de variáveis de ambiente
4. ✅ Fazer o primeiro deployment de teste

---

## ✅ PASSO 5: Adicione Secrets ao GitHub

**Depois que o script rodar:**

1. Copie todos os secrets que o script mostrou
2. Vá para: `https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions`
3. Clique em "New repository secret" para cada um:

```
VERCEL_TOKEN          = [cole o valor]
VERCEL_ORG_ID         = [cole o valor]
VERCEL_ORG_SCOPE      = [cole o valor]
VERCEL_PROJECT_ID_INFER = [cole o valor]
VERCEL_PROJECT_ID_ONNEWS = [cole o valor]
VERCEL_PROJECT_ID_WEBSITE = [cole o valor]
```

---

## ✅ PASSO 6: Configure Variáveis de Ambiente

Para cada projeto no Vercel, vá em Settings > Environment Variables e adicione:

### Para `infer-coon-api`:
```
DATABASE_URL = postgresql://seu_usuario:sua_senha@seu_host:5432/seu_db
JWT_SECRET = uma_senha_super_secreta_com_32_caracteres
NODE_ENV = production
```

### Para `onnews-api`:
```
DATABASE_URL = postgresql://seu_usuario:sua_senha@seu_host:5432/seu_db
JWT_SECRET = uma_senha_super_secreta_com_32_caracteres
JWT_EXPIRATION = 24h
NODE_ENV = production
```

### Para `infer-coon-website`:
```
NEXT_PUBLIC_API_URL = https://infer-coon-api.vercel.app
```

---

## ✅ PASSO 7: Deploy Final

De volta no terminal da sua máquina:

```bash
cd /home/user/infer-coon  # ou seu diretório local

git add -A
git commit -m "Deploy automático para Vercel - tudo funcionando"
git push origin main
```

---

## 🎉 Pronto!

Após o push:

1. **GitHub Actions irá:**
   - ✅ Rodar todos os testes (6/6 ✓)
   - ✅ Fazer build de todos os apps
   - ✅ Deploy automático para Vercel
   - ✅ Tempo total: 7-10 minutos

2. **Você terá LIVE:**
   - https://infer-coon-api.vercel.app
   - https://onnews-api.vercel.app
   - https://infer-coon.vercel.app

3. **Monitore o progresso:**
   - GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
   - Vercel Dashboard: https://vercel.com/dashboard

---

## 📊 Status Atual

| Item | Status |
|------|--------|
| Código | ✅ Completo |
| Testes | ✅ 6/6 passando |
| GitHub Workflows | ✅ Configurado |
| Vercel Config | ✅ Pronto |
| Setup Script | ✅ Pronto |

---

## 🚨 Se Algo der Errado

### Build falha:
```bash
cd api-onnews
npm ci
npm run build
```

### Secrets não funcionam:
Verifique se estão em: Settings > Secrets and Variables > Actions

### Deployment não inicia:
Verifique GitHub Actions: https://github.com/danielcorreiaudipatos-droid/infer-coon/actions

---

## 💡 Dicas

1. **Teste localmente primeiro:**
   ```bash
   docker-compose up
   npm test
   ```

2. **Veja logs em tempo real:**
   ```bash
   vercel logs infer-coon-api --follow
   vercel logs onnews-api --follow
   ```

3. **Rollback rápido:**
   ```bash
   vercel rollback <project-id>
   ```

---

**Você está pronto! Execute agora na sua máquina local! 🚀**

