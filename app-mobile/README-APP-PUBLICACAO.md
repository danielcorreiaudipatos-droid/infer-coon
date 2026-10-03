# 📱 on.imob — App Mobile (Android + iOS)

## 🎯 O que é?

App wrapper que embute o on.imob (sistema web FastAPI + JavaScript) como aplicativo nativo para Android e iOS.

**Usuário baixa na Play Store/App Store → Abre o app → Usa o on.imob completo dentro do app**

---

## 🚀 Arquitetura

```
┌─────────────────────────────────────────────┐
│ User baixa: Play Store / App Store          │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ App Nativo (Capacitor)                      │
│ ├─ Android (APK → Play Store)              │
│ └─ iOS (IPA → App Store)                   │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ on.imob System (Embedado)                   │
│ ├─ Frontend (HTML/CSS/JavaScript)          │
│ ├─ IA Assistant                            │
│ ├─ Dashboard                               │
│ ├─ Avaliação Automática                    │
│ └─ Todos os recursos on.imob               │
└─────────────────────────────────────────────┘
```

---

## 📋 Pré-requisitos

### Sistema
- **Node.js** ≥ 16.x
- **npm** ou **yarn**
- **Git**

### Para Android
- **Android Studio** (free)
- **Android SDK** ≥ Android 12 (API 31)
- **Gradle** (incluído no Android Studio)

### Para iOS
- **Xcode** (macOS apenas)
- **CocoaPods**
- **iOS 14+**
- **Apple Developer Account** (para publicar)

---

## 🔧 Setup Inicial

### 1. Instalar dependências

```bash
cd app-mobile
npm install
```

### 2. Instalar Capacitor

```bash
npm install @capacitor/cli @capacitor/core --save-dev
npx cap init
```

### 3. Adicionar plataformas

```bash
# Android
npx cap add android

# iOS
npx cap add ios
```

---

## 🏗️ Build

### Construir frontend

```bash
npm run build
```

Isso gera a pasta `public/` com o sistema on.imob pronto.

### Sync com Android/iOS

```bash
# Copiar arquivos para Android/iOS
npx cap sync

# Ou fazer build completo
npm run build:capacitor
```

---

## 📱 Android

### 1. Abrir Android Studio

```bash
npm run cap:open:android
```

Ou abra manualmente:
```bash
open android/
# (no Android Studio)
```

### 2. Build APK

**Debug (para testes):**
```bash
cd android
./gradlew assembleDebug
cd ..
```

Resultado: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release (para Play Store):**
```bash
cd android
./gradlew assembleRelease
cd ..
```

Resultado: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Publicar na Play Store

1. Criar conta Developer: https://play.google.com/console
2. Criar novo aplicativo
3. Preparar:
   - Ícone 512x512px
   - Screenshots (5+ imagens)
   - Descrição
   - Categoria: "Produtividade" ou "Business"
4. Upload de `app-release.apk`
5. Configurar preço (grátis ou pago)
6. Submeter para revisão (~24-48h)

**Custo:** $25 (taxa única)

---

## 🍎 iOS

### 1. Abrir Xcode

```bash
npm run cap:open:ios
```

Ou manualmente:
```bash
open ios/App/App.xcworkspace/
```

### 2. Configurar signing

1. Xcode → Signing & Capabilities
2. Team: Selecionar Apple Developer Account
3. Bundle Identifier: `com.onimob.app`

### 3. Build para App Store

```bash
cd ios
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath ~/Desktop/App.xcarchive \
  archive
cd ..
```

### 4. Publicar na App Store

1. Criar conta Developer: https://developer.apple.com (pagável)
2. Criar App ID em App Store Connect
3. Preparar:
   - Ícone 1024x1024px
   - Screenshots (2+ resoluções)
   - Descrição
   - Palavras-chave
4. Upload via Xcode/Transporter
5. Submeter para revisão (~24-48h)

**Custo:** $99/ano (Apple Developer Program)

---

## 🔐 Segurança & Features

### Capacitor oferece acesso a:

```javascript
// Câmera
import { Camera, CameraResultType } from '@capacitor/camera';

// GPS/Localização
import { Geolocation } from '@capacitor/geolocation';

// Notificações push
import { PushNotifications } from '@capacitor/push-notifications';

// Armazenamento local
import { Storage } from '@capacitor/storage';

// Compartilhar (WhatsApp, email, etc)
import { Share } from '@capacitor/share';

// Informações do dispositivo
import { Device } from '@capacitor/device';
```

Todos esses funcionam no app!

---

## 🎯 Exemplo: Usar Câmera no on.imob

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

async function tirarFotoImovel() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  
  // image.webPath contém a foto
  // Enviar para backend
  await fetch('/api/onimob/imoveis/foto', {
    method: 'POST',
    body: FormData com image
  });
}
```

---

## 📊 Tamanho do App

| Componente | Tamanho |
|-----------|---------|
| Android (APK) | ~40-60 MB |
| iOS (IPA) | ~50-70 MB |
| on.imob Assets | ~5-10 MB |
| Total | ~50-80 MB |

**Espaço em disco para instalar:** ~100 MB (android) / ~150 MB (iOS)

---

## 🔄 Atualizações

### Quando atualizar o app:

1. **Mudanças no frontend (HTML/CSS/JS):**
   ```bash
   npm run build:capacitor
   # Re-build APK/IPA → New version no Play Store/App Store
   ```

2. **Mudanças no backend (API):**
   - App acessa `https://seu-servidor.com`
   - Não precisa re-build do app
   - Atualizações automáticas

---

## 🚀 Roadmap de Publicação

### Semana 1: Setup
- [ ] Criar contas (Play Store + App Store)
- [ ] Preparar ícones/screenshots
- [ ] Setup Capacitor

### Semana 2: Build
- [ ] Android APK build & teste
- [ ] iOS IPA build & teste
- [ ] Testes em dispositivos reais

### Semana 3: Publicação
- [ ] Submit Play Store
- [ ] Submit App Store
- [ ] Aguardar aprovação

### Semana 4: Launch
- [ ] Ativa nas lojas
- [ ] Monitor de reviews/crashes
- [ ] Suporte ao usuário

---

## 📞 Suporte

**Capacitor Docs:** https://capacitorjs.com/docs  
**Android Docs:** https://developer.android.com/docs  
**iOS Docs:** https://developer.apple.com/documentation/

---

## 💰 Custos

| Item | Custo | Frequência |
|------|-------|-----------|
| Play Store | $25 | Uma vez |
| App Store | $99 | Anual |
| Servidor (backend) | Variável | Mensal |
| **Total primeiro ano** | ~$124 + servidor | - |

---

**on.imob — Agora também no seu celular! 📱**
