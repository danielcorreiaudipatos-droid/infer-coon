# 📱 Distribuição Direta do Site + Play Store/App Store

## 🎯 Estratégia em 2 Fases

```
FASE 1: Download direto do site (RÁPIDO)
  ↓
  Usuário acessa: www.onimob.com/app
  Clica: "Baixar Android" ou "Baixar iOS"
  Download direto do servidor on.imob
  Instala no celular
  ✅ Sem precisar de Play Store/App Store
  ⏱️ Pronto em 2-3 semanas
  
  ↓↓↓ (após 1-2 meses de feedback de usuários)
  
FASE 2: Publicar nas lojas oficiais
  ↓
  App já testado por 100+ usuários
  Melhorias incorporadas
  Publicar Play Store + App Store
  ✅ Aumenta confiança (app oficial)
  ⏱️ Mais 1-2 semanas
```

---

## 📥 FASE 1: Download Direto do Site

### 1.1 Página de Download (HTML)

Criar página em: `www.onimob.com/app`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>on.imob — App Download</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .downloads {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 2rem;
        }
        .btn {
            padding: 1.5rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: block;
        }
        .btn:hover {
            background: #f0f0f0;
            transform: scale(1.05);
        }
        .info {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 2rem;
            font-size: 0.9rem;
        }
        .version {
            color: rgba(255,255,255,0.7);
            margin-top: 1rem;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 on.imob App</h1>
        <p>Gestão imobiliária inteligente com IA</p>
        
        <div class="downloads">
            <a href="/downloads/onimob-android.apk" class="btn">
                🤖 Android<br>
                <small>APK 60 MB</small>
            </a>
            <a href="/downloads/onimob-ios.ipa" class="btn">
                🍎 iOS<br>
                <small>IPA 70 MB</small>
            </a>
        </div>
        
        <div class="info">
            <h3>ℹ️ Como Instalar</h3>
            <p><strong>Android:</strong> Após baixar, abra o arquivo APK e permita instalação de "fontes desconhecidas" nas configurações</p>
            <p><strong>iOS:</strong> Use Altstore ou TestFlight para instalar (requer conta Apple)</p>
        </div>
        
        <div class="info">
            <h3>✨ Features</h3>
            <ul style="text-align: left;">
                <li>🤖 IA Gemini integrada (voz + chat)</li>
                <li>📊 Dashboard unificado</li>
                <li>💰 Avaliação automática (NBR 14.653)</li>
                <li>🌍 Multi-idioma (pt/en/es)</li>
                <li>📱 Câmera + GPS + Notificações</li>
                <li>⚡ Funciona online e offline</li>
            </ul>
        </div>
        
        <div class="version">
            v1.0.0 — Beta Release<br>
            Última atualização: 2 de outubro de 2026<br>
            <a href="mailto:suporte@onimob.com" style="color: white;">Reportar problema</a>
        </div>
    </div>
</body>
</html>
```

### 1.2 Hosting dos Arquivos APK/IPA

**Opção 1: Direto no servidor on.imob**
```
www.onimob.com/
├── /downloads/
│   ├── onimob-android.apk (60 MB)
│   ├── onimob-android-v1.0.1.apk (backup)
│   ├── onimob-ios.ipa (70 MB)
│   └── CHANGELOG.md (notas de versão)
└── /app/ (página de download)
```

**Opção 2: Usar CDN para distribuição rápida**
```
Cloudflare / AWS CloudFront

www.onimob.com/app → CloudFlare
                   → Cache global
                   → Downloads rápidos mundo inteiro
```

### 1.3 Segurança: Arquivo Sem "Fonte Desconhecida"

**Android (APK):**
```
⚠️ AVISO: "Instalar de fontes desconhecidas"
SOLUÇÃO: Assinar APK com certificado digital
```

**Como assinar APK:**
```bash
# 1. Gerar chave (uma única vez)
keytool -genkey -v -keystore onimob-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias onimob-key

# 2. Assinar APK
jarsigner -verbose -sigalg SHA1withRSA \
  -digestalg SHA1 -keystore onimob-key.jks \
  app-release.apk onimob-key

# 3. Zipalign (otimizar)
zipalign -v 4 app-release.apk onimob-signed.apk
```

**Resultado:** APK assinado = mais confiança do usuário

**iOS (IPA):**
```
Distribuir via Apple TestFlight (melhor que IPA direto)
- Usuário clica link TestFlight
- Abre automaticamente Apple Testflight
- Instala em 1 clique
- Zero "fonte desconhecida"
```

---

## 📊 FASE 1: Página de Status + Atualizações

### Criar página de versão:

```
www.onimob.com/app/versoes

v1.0.2 (2 out 2026)
✅ Bug fix: câmera em alguns Android
✅ Melhoria: performance IA
📥 Baixar: APK | IPA

v1.0.1 (1 out 2026)
✅ Integração WhatsApp
✅ Notificações push
📥 Baixar: APK | IPA

v1.0.0 (25 set 2026)
✅ Versão inicial beta
📥 Baixar: APK | IPA
```

---

## 🎯 FASE 2: Play Store + App Store

### 2.1 Quando fazer a transição?

```
FASE 1 (Distribuição direta): 4 semanas
↓
Métricas de sucesso:
- ✅ 100+ downloads
- ✅ 4.5+ estrelas (avaliação)
- ✅ Zero crashes críticos
- ✅ Feedback positivo de 10+ usuários

DECISÃO: Prosseguir para Play Store/App Store?
- SIM → FASE 2 (publicação oficial)
- NÃO → Continuar com distribuição direta
```

### 2.2 Publicar Play Store

```bash
# 1. Build APK signed (já feito na Fase 1)
npm run android:build-release

# 2. Criar conta Play Console
# URL: https://play.google.com/console
# Custo: $25 (paga uma vez)

# 3. Preparar materiais
# ├── Ícone 512x512px
# ├── Screenshots (5 imagens)
# ├── Descrição (~300 chars)
# ├── Categoria: Produtividade
# └── Política privacidade (link)

# 4. Upload APK signed
# No console → "Lançamentos" → Upload APK

# 5. Submeter para revisão
# Google aprova em 24-48h

# 6. Resultado
# ✅ App aparece na Play Store
# 🔗 Link: play.google.com/store/apps/details?id=com.onimob.app
```

### 2.3 Publicar App Store (iOS)

```bash
# 1. Build IPA signed
npm run ios:build-release

# 2. Criar conta App Store Connect
# URL: https://appstoreconnect.apple.com
# Custo: $99/ano (Apple Developer)

# 3. Preparar materiais (similares Play Store)
# ├── Ícone 1024x1024px
# ├── Screenshots (para 2+ devices)
# ├── Descrição (~300 chars)
# ├── Categoria: Productivity
# └── Versão mínima iOS: 14+

# 4. Upload via Xcode/Transporter
# Xcode → Product → Archive → Distribute

# 5. Submeter para revisão
# Apple aprova em 24-48h (ou rejeita + feedback)

# 6. Resultado
# ✅ App aparece na App Store
# 🔗 Link: apps.apple.com/br/app/on-imob/id123456789
```

---

## 📈 ROADMAP DISTRIBUIÇÃO

### Semana 1-2: Build + Teste
- [ ] Build APK + IPA via Capacitor
- [ ] Testar em 5 dispositivos reais
- [ ] Assinar APK com certificado
- [ ] Setup TestFlight para iOS

### Semana 3: Deploy Fase 1
- [ ] Criar página `/app/`
- [ ] Fazer upload APK/IPA no servidor
- [ ] Configurar CDN (Cloudflare)
- [ ] Testar downloads
- [ ] Enviar link para primeiros beta testers

### Semana 4: Marketing Beta
- [ ] Convidar 50 usuários para testar
- [ ] Coletar feedback
- [ ] Monitorar crashes/bugs
- [ ] Lançar v1.0.1 com fixes

### Semana 5-6: Fase 2 (Se go-to-market)
- [ ] Criar contas Play Console + App Store Connect
- [ ] Preparar materiais (screenshots, descrição)
- [ ] Submit Play Store
- [ ] Submit App Store
- [ ] Aguardar aprovação

### Semana 7: Publicação Oficial
- [ ] ✅ App na Play Store
- [ ] ✅ App na App Store
- [ ] 🎉 Lançamento oficial

---

## 💰 CUSTOS DISTRIBUIÇÃO

| Item | Custo | Quando |
|------|-------|--------|
| Certificado APK | $0 | Já gerado |
| CDN (Cloudflare) | $0-20/mês | Fase 1 |
| Play Console | $25 | Uma vez (Fase 2) |
| App Store Developer | $99 | Anual (Fase 2) |
| **Total Fase 1** | **$0** | Já! |
| **Total Fase 2** | **$124** | Depois |

---

## 📱 PÁGINAS DO SITE

Criar essas páginas em on.imob.com:

```
/app → Download direto (APK + IPA + instrções)
/app/versoes → Histórico versões
/app/suporte → FAQ troubleshooting
/app/changelog → Notas de versão
/app/politica-privacidade → Privacidade (obrigatório)
```

---

## 🔄 Ciclo de Atualização (Fase 1)

```
Usuário baixa app (semana 1)
    ↓
Usa por 1 semana, encontra bugs
    ↓
Reporta no Slack/email/form
    ↓
Desenvolvedor corrige (1-2 dias)
    ↓
Build nova versão (v1.0.1)
    ↓
Upload no servidor (/downloads/v1.0.1.apk)
    ↓
Usuário recebe notificação: "Nova versão disponível"
    ↓
Clica link, baixa nova versão
    ↓
Ciclo repete
```

**Vantagem:** Atualizações rápidas (não precisa de aprovação Play Store)

---

## 🎉 RESULTADO FINAL

**Semana 1-3: Distribuição direta do site**
```
www.onimob.com/app
├── 📥 Baixar Android
├── 📥 Baixar iOS (TestFlight)
└── ℹ️ Instruções

✅ App em mãos de usuários RÁPIDO
✅ Sem esperar aprovação Play Store
✅ Controle total de atualizações
```

**Semana 5+: Play Store + App Store**
```
🎯 App aparece nas lojas oficiais
✅ Maior confiança de usuários
✅ Mais descoberta (busca nas lojas)
✅ Monetização profissional
```

---

**on.imob: App pronto para download em 3 semanas! 🚀**
