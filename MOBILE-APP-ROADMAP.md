# 📱 MOBILE APP ROADMAP — on.imob iOS + Android

Plano de implementação dos apps móveis para completar o ecossistema.

---

## 🎯 Visão Geral

**Objetivo:** Criar apps iOS e Android nativos/híbridos que complementem a plataforma web.

**Timeline:** 4-6 semanas (após validação dos 75 testes)

**Tecnologia Recomendada:** React Native (código compartilhado 80% iOS + Android)

---

## 📋 Fase 1: MVP (4 semanas)

### App Imobiliário (para corretores)

**Funcionalidades:**

1. **Login & Dashboard**
   - [ ] Autenticação com JWT
   - [ ] Dashboard com KPIs
   - [ ] Notificações push

2. **Gestão de Imóveis**
   - [ ] Listar imóveis
   - [ ] Fotos (camera + galeria)
   - [ ] Editar descrição rápido
   - [ ] Status (Ativo/Inativo/Vendido)

3. **Leads & Contatos**
   - [ ] Histórico de leads WhatsApp
   - [ ] Filtro por status (Novo/Qualificado/Descartado)
   - [ ] Quick call/WhatsApp
   - [ ] Agenda de visitas

4. **Financeiro Simplificado**
   - [ ] Saldo do mês
   - [ ] Últimos pagamentos recebidos
   - [ ] Gráfico de receita (últimos 30 dias)
   - [ ] PIX rápido para proprietários

5. **Notificações**
   - [ ] Novo lead recebido
   - [ ] Pagamento confirmado
   - [ ] Visita agendada
   - [ ] Repasse disponível

---

### App Proprietário (para proprietários/locadores)

**Funcionalidades:**

1. **Login & Saldo**
   - [ ] Autenticação
   - [ ] Saldo disponível
   - [ ] Histórico de repassos

2. **Meus Imóveis**
   - [ ] Listar imóveis alugados
   - [ ] Aluguéis recebidos (timeline)
   - [ ] Visualizar site do imóvel

3. **Financeiro**
   - [ ] Receber repasse (PIX automático)
   - [ ] Comprovante em PDF
   - [ ] Extrato 12 meses

4. **Suporte**
   - [ ] Chat com imobiliária
   - [ ] FAQ
   - [ ] Contato

---

### App Cliente/Inquilino (para potenciais clientes)

**Funcionalidades:**

1. **Busca de Imóveis**
   - [ ] Lista de imóveis disponíveis
   - [ ] Filtros (tipo, preço, localização)
   - [ ] Mapa (Google Maps)
   - [ ] Fotos + vídeos

2. **Detalhes do Imóvel**
   - [ ] Descrição completa
   - [ ] Plantas
   - [ ] Avaliação científica (nossa grande diferença!)
   - [ ] Localização + vizinhança

3. **Agendamento**
   - [ ] Agendar visita
   - [ ] Chat com corretor
   - [ ] Compartilhar com família

4. **Favoritos**
   - [ ] Salvar imóvel
   - [ ] Comparar múltiplos
   - [ ] Alertas de novo similar

---

## 🛠️ Tech Stack Recomendado

### React Native

```json
{
  "framework": "React Native",
  "typescript": true,
  "state_management": "Redux",
  "navigation": "React Navigation",
  "ui_library": "React Native Paper",
  "http_client": "axios",
  "push_notifications": "Firebase Cloud Messaging",
  "maps": "react-native-maps",
  "camera": "react-native-camera-kit",
  "database": "AsyncStorage + SQLite"
}
```

### Backend Integration

- [ ] API REST já pronta (FastAPI)
- [ ] WebSocket para notificações push
- [ ] Firebase Cloud Messaging (FCM)
- [ ] Image upload (AWS S3 ou similar)

---

## 📦 Arquitetura

```
on-imob-mobile/
├── apps/
│   ├── imovel/               # App Imobiliário
│   ├── proprietario/         # App Proprietário
│   └── cliente/              # App Cliente/Inquilino
├── shared/
│   ├── components/           # UI componentes reutilizáveis
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API calls
│   ├── store/                # Redux state
│   └── types/                # TypeScript types
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── config/
    ├── api.ts                # API base URL + configs
    ├── firebase.ts           # Firebase config
    └── theme.ts              # Design system
```

---

## 🎨 Design System

**Cores (on.imob):**
- Primária: #667eea
- Secundária: #764ba2
- Sucesso: #4caf50
- Aviso: #ff9800
- Erro: #f44336

**Tipografia:**
- Heading: Segoe UI Bold
- Body: Segoe UI Regular
- Code: Courier New

**Componentes Base:**
- Button (primário, secundário, texto)
- Input (text, email, password, número)
- Card
- Modal
- Alert
- Badge
- Loader

---

## 📱 Telas Principais

### App Imobiliário

```
┌─────────────────────┐
│  Dashboard          │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ R$ 5.234,50     │ │ Saldo mês
│ │ 12 leads novos  │ │ Notificações
│ │ 3 visitas       │ │ Agenda
│ └─────────────────┘ │
│                     │
│ [Meus Imóveis]      │
│ [Leads]             │
│ [Financeiro]        │
│ [Perfil]            │
└─────────────────────┘
```

### Fluxo de Venda

```
1. Login
2. Dashboard (saldo, leads, visitas)
3. Ver Imóvel
   ├─ Fotos
   ├─ Descrição
   ├─ Alterar Preço
   └─ Publicar/Despublicar
4. Ver Leads
   ├─ Histórico WhatsApp
   ├─ Status
   └─ Agendar Visita
5. Financeiro
   ├─ Saldo
   ├─ Últimos Pagamentos
   └─ Gráfico
```

---

## 📊 Funcionalidades por App

| Feature | Imobiliário | Proprietário | Cliente |
|---------|------------|--------------|---------|
| Login | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| Listar Imóveis | ✅ | ✅ | ✅ |
| Editar Imóvel | ✅ | ❌ | ❌ |
| Fotos (camera) | ✅ | ❌ | ❌ |
| Leads | ✅ | ❌ | ❌ |
| Financeiro | ✅ | ✅ | ❌ |
| Chat | ✅ | ✅ | ✅ |
| Agendamento | ✅ | ❌ | ✅ |
| Avaliação Científica | ❌ | ❌ | ✅ |
| Favoritos | ❌ | ❌ | ✅ |
| Notificações | ✅ | ✅ | ✅ |

---

## 🔐 Segurança

- [ ] JWT tokens (renovação a cada 24h)
- [ ] Biometria (Face ID / Fingerprint)
- [ ] Encriptação de dados locais
- [ ] Permissões de câmera/galeria
- [ ] Validação de entrada
- [ ] Rate limiting (API)

---

## 🚀 Distribuição

### iOS

1. **Xcode Build**
   ```bash
   react-native build-ios
   ```

2. **App Store Connect**
   - Criar certificados
   - Configurar provisioning profiles
   - Submeter para review (3-5 dias)

3. **TestFlight**
   - Beta testing antes do launch

### Android

1. **Android Studio Build**
   ```bash
   react-native build-android --release
   ```

2. **Google Play Console**
   - Criar keystore signing
   - Configurar release tracks
   - Submeter para review (2-4 horas)

3. **Internal Testing**
   - Beta na Play Store antes do launch

---

## 📊 Métricas de Sucesso

Após lançamento, acompanhar:

- [ ] Downloads (iOS + Android)
- [ ] Daily Active Users (DAU)
- [ ] Monthly Active Users (MAU)
- [ ] Crash rate (< 0.1%)
- [ ] Latência média API (< 500ms)
- [ ] User retention (30 dias)
- [ ] App ratings (> 4.5 ⭐)

---

## 💰 Estimativa de Custo

| Item | Custo |
|------|-------|
| Dev (4 semanas, 1 dev) | R$ 8.000 - 12.000 |
| App Store Account | R$ 99/ano |
| Google Play Account | R$ 25 (único) |
| Firebase Quota | R$ 0 - 300/mês |
| Apple Developer | R$ 99/ano |
| **TOTAL** | **R$ 8.500 - 12.500 (inicial)** |

---

## ⏱️ Timeline Detalhada

### Semana 1
- [ ] Setup projeto React Native
- [ ] Configurar navegação
- [ ] Design system implementado
- [ ] Login funcionando

### Semana 2
- [ ] App Imobiliário: Dashboard + Imóveis
- [ ] Câmera e upload de fotos
- [ ] Notificações push

### Semana 3
- [ ] App Imobiliário: Leads + Financeiro
- [ ] App Proprietário: Estrutura
- [ ] WebSocket para push real-time

### Semana 4
- [ ] App Proprietário: Completo
- [ ] App Cliente: Estrutura + Busca
- [ ] Testes manuais

### Semana 5 (Opcional)
- [ ] App Cliente: Avaliação científica
- [ ] Otimizações
- [ ] Beta testing

### Semana 6 (Opcional)
- [ ] App Store Connect setup
- [ ] Google Play setup
- [ ] Submissão

---

## 🎯 Próximas Ações

1. **Após passar nos 75 testes:**
   - [ ] Reservar dev React Native
   - [ ] Setup ambiente
   - [ ] Começar Semana 1

2. **Paralelo:**
   - [ ] Desenhar wireframes
   - [ ] Definir paleta de cores
   - [ ] Preparar assets

3. **Antes do lançamento:**
   - [ ] Beta testing externo
   - [ ] Testes de carga
   - [ ] Security audit
   - [ ] Compliance (LGPD)

---

## 📞 Contato para Desenvolvimento

- Procurar dev React Native experiente
- Preço médio: R$ 2.000 - 3.000/semana
- Timeline: 4-6 semanas para MVP

---

**Avançar para mobile apps APÓS validar web completamente!**
