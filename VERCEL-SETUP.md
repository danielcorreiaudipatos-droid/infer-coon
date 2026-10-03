# 🚀 ONNEWS Vercel Auto-Deploy Setup

Complete setup guide para deploy automático do ONNEWS no Vercel.

## ✅ Step 1: Criar Projeto no Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login

# Criar novo projeto ONNEWS
vercel projects add onnews-api
```

## ✅ Step 2: Configurar Secrets no GitHub

Acesse: `https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions`

Adicione os seguintes secrets:

### Vercel Credentials:
```
VERCEL_TOKEN=<seu_vercel_token>
VERCEL_ORG_ID=<seu_org_id>
VERCEL_ORG_SCOPE=<seu_org_scope>
VERCEL_PROJECT_ID_ONNEWS=<seu_project_id>
```

### Como obter os valores:

**VERCEL_TOKEN:**
```bash
vercel login
vercel whoami --token
```

**VERCEL_ORG_ID e VERCEL_ORG_SCOPE:**
```bash
vercel teams ls
# Copie o ID e Scope da sua organização
```

**VERCEL_PROJECT_ID_ONNEWS:**
```bash
# Após criar o projeto
vercel projects ls
# Copie o ID do projeto ONNEWS
```

## ✅ Step 3: Configurar Environment Variables no Vercel

Acesse: `https://vercel.com/dashboard/onnews-api/settings/environment-variables`

Configure as seguintes variáveis:

### Staging:
```
DATABASE_URL = postgresql://user:password@db-staging.example.com:5432/onnews_db
JWT_SECRET = your_jwt_secret_staging
JWT_EXPIRATION = 24h
NODE_ENV = staging
```

### Production:
```
DATABASE_URL = postgresql://user:password@db-prod.example.com:5432/onnews_db
JWT_SECRET = your_jwt_secret_production
JWT_EXPIRATION = 24h
NODE_ENV = production
```

## ✅ Step 4: Preparar Repositório

```bash
# Verificar estrutura
cd /home/user/infer-coon

# Confirmar que temos os arquivos de configuração
ls -la vercel-onnews.json
ls -la .github/workflows/deploy-onnews.yml
```

## ✅ Step 5: Fazer Primeiro Deploy Manual

```bash
# Login no Vercel
vercel login

# Deploy staging
vercel --name=onnews-api-staging

# Deploy production
vercel --prod --name=onnews-api
```

## ✅ Step 6: Testar Auto-Deploy

Faça um push para main e o GitHub Actions automaticamente:
1. ✅ Roda os testes
2. ✅ Faz build do projeto
3. ✅ Deploya para Vercel

```bash
# Fazer uma mudança pequena
echo "# Updated $(date)" >> api-onnews/README.md

# Commit e push
git add api-onnews/README.md
git commit -m "Test auto-deploy"
git push origin main
```

## 📊 Monitorar Deployments

### GitHub Actions:
```
https://github.com/danielcorreiaudipatos-droid/infer-coon/actions
```

### Vercel Dashboard:
```
https://vercel.com/dashboard/onnews-api
```

## 🌐 URLs de Acesso

Após deploy, acesse:

- **API Base**: `https://onnews-api.vercel.app`
- **Swagger Docs**: `https://onnews-api.vercel.app/docs`
- **Health Check**: `https://onnews-api.vercel.app/health`
- **API Endpoints**: 
  - Auth: `https://onnews-api.vercel.app/api/auth/register`
  - Streams: `https://onnews-api.vercel.app/api/streams`
  - Wallet: `https://onnews-api.vercel.app/api/wallet`
  - Trading: `https://onnews-api.vercel.app/api/trading`

## 🔧 Troubleshooting

### Build fails com "Can't find module"
```bash
cd api-onnews
npm ci
npm run build
```

### Database connection error
- Verifique `DATABASE_URL` no Vercel
- Confirme que a IP do Vercel está whitelisted no banco

### Timeout no deploy
- Aumentar timeout: Settings > Function Execution Timeout (máx 60s)
- Ou otimizar build (ver etapas lentas)

### GitHub Actions não dispara
- Verifique os secrets em Settings > Secrets
- Confirme que VERCEL_TOKEN é válido
- Verifique permissões no repositório

## 📝 Pipeline de Deployment

```
Push para main
    ↓
GitHub Actions triggered
    ↓
npm test (api-onnews)
    ↓
npm run build (api-onnews)
    ↓
Deploy para Vercel
    ↓
Health check
    ↓
✅ Live em staging/prod
```

## 🎯 Próximos Passos

1. ✅ Criar projeto no Vercel
2. ✅ Configurar secrets no GitHub
3. ✅ Fazer primeiro deploy
4. ✅ Testar endpoints
5. ✅ Configurar custom domain (opcional)

```bash
# Para adicionar custom domain:
vercel domains add onnews-api.com
```

## 📚 Recursos Adicionais

- [Vercel NestJS Guide](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/environment-variables)

---

**Status**: ✅ Ready for Production
**Last Updated**: 2026-10-03
