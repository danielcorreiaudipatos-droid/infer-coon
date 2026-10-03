# 🎨 Design System & UX - Games Platform

## 1. Paleta de Cores (Sistema COON)

```
PRIMARY COLORS:
├─ Roxo Coon:      #7C3AED (Vibrant Purple)
├─ Laranja Destaque: #FF6B35 (Energy Orange)
├─ Verde Sucesso:  #10B981 (Success Green)
└─ Cinza Escuro:   #1F2937 (Dark Gray)

SECONDARY:
├─ Azul Água:      #0EA5E9 (Sky Blue)
├─ Rosa Quente:    #EC4899 (Hot Pink)
├─ Amarelo:        #FBBF24 (Gold)
└─ Vermelho:       #EF4444 (Error Red)

BACKGROUNDS:
├─ Dark Mode:      #0F172A (Deep Navy)
├─ Light Mode:     #F8FAFC (Off White)
├─ Card Dark:      #1E293B (Slate)
└─ Card Light:     #FFFFFF (White)

GRADIENTS:
├─ Hero:           Linear(#7C3AED → #FF6B35)
├─ Button:         Linear(#7C3AED → #EC4899)
└─ Background:     Linear(#0F172A → #1F2937)
```

---

## 2. Estrutura de Telas

### A. LANDING PAGE
```
┌──────────────────────────────────────┐
│ [LOGO COON]  [Home] [Games] [Studio] │ ← Navbar Fixa
├──────────────────────────────────────┤
│                                      │
│        ╔═══════════════════════╗    │
│        ║ GAMES PLATFORM        ║    │ ← Hero Section
│        ║ Crie, Jogue, Ganhe    ║    │   (Com gradiente)
│        ║ [Começar Agora]       ║    │
│        ╚═══════════════════════╝    │
│                                      │
├──────────────────────────────────────┤
│ FEATURED GAMES (Cards com hover)    │
│ ┌─────────┬─────────┬─────────┐   │
│ │ ONZAP   │ ONLOVE  │ ONMAIL  │   │
│ │ [Play]  │ [Play]  │ [Play]  │   │
│ └─────────┴─────────┴─────────┘   │
│                                      │
├──────────────────────────────────────┤
│ STUDIO SECTION                       │
│ "Crie Seus Próprios Jogos"           │
│ [Acessar Studio] ← Botão CTA        │
│                                      │
├──────────────────────────────────────┤
│ STATS (3 Quadrados tipo Doge)       │
│ ┌──────┬──────┬──────┐             │
│ │100k+ │R$10M │500k+ │             │
│ │Users │Year1 │Games │             │
│ └──────┴──────┴──────┘             │
│                                      │
├──────────────────────────────────────┤
│ FOOTER                               │
│ © 2026 COON Games                    │
└──────────────────────────────────────┘
```

### B. LOGIN PAGE
```
┌──────────────────────────────────────┐
│ [LOGO COON] Pequeno no canto        │
├──────────────────────────────────────┤
│                                      │
│      FAZER LOGIN                     │
│      ─────────────                   │
│                                      │
│      [Email: __________]             │
│      [Senha: __________]             │
│                                      │
│      [ENTRAR] (Roxo Coon)           │
│                                      │
│      ─────── ou ───────              │
│                                      │
│      [Continue com Google] (Branco) │
│                                      │
│      Não tem conta? [Criar conta]   │
│                                      │
└──────────────────────────────────────┘
```

### C. CADASTRO PAGE
```
┌──────────────────────────────────────┐
│ [LOGO COON] Pequeno                  │
├──────────────────────────────────────┤
│                                      │
│      CRIAR CONTA                     │
│      ──────────────                  │
│                                      │
│      [Nome: __________]              │
│      [Email: __________]             │
│      [Senha: __________]             │
│      [Confirmar: __________]         │
│                                      │
│      ☐ Aceito os Termos              │
│                                      │
│      [CRIAR CONTA] (Gradiente)       │
│                                      │
│      ─────── ou ───────              │
│                                      │
│      [Continue com Google] (Branco)  │
│                                      │
│      Já tem conta? [Fazer login]    │
│                                      │
└──────────────────────────────────────┘
```

### D. DASHBOARD PRINCIPAL (Após Login)
```
┌──────────────────────────────────────┐
│ [LOGO COON] [Games] [Studio] [Profile]│ ← Navbar
├──────────────────────────────────────┤
│                                      │
│ Olá, João! 👋                       │
│ Saldo: R$ 100,00 [+ Carregar]      │
│                                      │
│ MEUS JOGOS                          │
│ ┌─────────┬─────────┬─────────┐   │
│ │ ONZAP   │ ONLOVE  │ ONMAIL  │   │
│ │[Play]   │[Play]   │[Play]   │   │
│ │Score:500│Score:50 │Score:20 │   │
│ └─────────┴─────────┴─────────┘   │
│                                      │
│ STATS (Quadrados)                   │
│ ┌──────┬──────┬──────┐             │
│ │150pts│5 🏆  │3Skins│             │
│ │Total │Badges│Unlock│             │
│ └──────┴──────┴──────┘             │
│                                      │
│ LOJA DE COSMETICS                   │
│ ┌─────────┬─────────┬─────────┐   │
│ │Skin 1   │Skin 2   │Skin 3   │   │
│ │R$ 4,99  │R$ 4,99  │R$ 9,99  │   │
│ │[Comprar]│[Comprar]│[Comprar]│   │
│ └─────────┴─────────┴─────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### E. STUDIO (Game Builder)
```
┌──────────────────────────────────────┐
│ [LOGO COON] [Dashboard] [Games]      │ ← Navbar
├──────────────────────────────────────┤
│                                      │
│ STUDIO - CREATE YOUR GAME           │
│ ════════════════════════════         │
│                                      │
│ [NEW GAME] [MY GAMES] [MARKETPLACE] │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Game Name: [_____________]       │ │
│ │ Template: [Flappy Bird ▼]        │ │
│ │                                  │ │
│ │ MECHANICS:                       │ │
│ │ ☑ Jump    ☑ Obstacles           │ │
│ │ ☑ Scoring ☑ Leaderboard         │ │
│ │                                  │ │
│ │ COLORS:                          │ │
│ │ [🟪][🟥][🟦][Add Color]          │ │
│ │                                  │ │
│ │ [✨ Generate with AI] [Create]   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ PREVIEW (Live):                      │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │    Your Game Preview Here        │ │
│ │    ▶ PLAY LIVE                   │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [PUBLISH (R$ 4,99)] [SAVE DRAFT]    │
│                                      │
└──────────────────────────────────────┘
```

---

## 3. Componentes & Efeitos

### Navbar (Fixa no Topo)
```typescript
export const Navbar = () => (
  <nav className="sticky top-0 bg-gradient-to-r from-purple-600 to-orange-600 shadow-lg">
    <div className="flex justify-between items-center px-6 py-4">
      {/* Logo COON */}
      <div className="text-2xl font-bold text-white">
        🎮 COON Games
      </div>
      
      {/* Menu */}
      <div className="hidden md:flex gap-8">
        <a href="/" className="text-white hover:text-yellow-300 transition">Home</a>
        <a href="/games" className="text-white hover:text-yellow-300 transition">Games</a>
        <a href="/studio" className="text-white hover:text-yellow-300 transition">Studio</a>
      </div>
      
      {/* User Profile */}
      <div className="flex gap-4">
        <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:scale-105 transition">
          Perfil
        </button>
      </div>
    </div>
  </nav>
);
```

### Card com Hover Effect
```typescript
export const GameCard = ({ game }) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    
    {/* Content */}
    <div className="relative z-10 p-6 text-white">
      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
      <p className="text-sm opacity-90 mb-4">{game.description}</p>
      
      {/* Button with Animation */}
      <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100 transition-all">
        ▶ Play Now
      </button>
    </div>
  </div>
);
```

### Stats Box (Tipo Doge)
```typescript
export const StatsBox = ({ icon, value, label }) => (
  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm opacity-80">{label}</div>
  </div>
);
```

### CTA Button (Call to Action)
```typescript
export const CTAButton = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="relative overflow-hidden group px-8 py-4 rounded-lg font-bold text-white text-lg"
  >
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 group-hover:scale-110 transition-transform" />
    
    {/* Shine Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
    
    {/* Text */}
    <span className="relative">{children}</span>
  </button>
);
```

---

## 4. Efeitos & Animações

### Hero Section Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.5); }
  50% { box-shadow: 0 0 40px rgba(124, 58, 237, 1); }
}

.hero-title {
  animation: float 3s ease-in-out infinite;
}

.hero-button {
  animation: glow 2s ease-in-out infinite;
}
```

### Game Card Hover
```css
.game-card {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.4);
}
```

### Stats Counter Animation
```typescript
const AnimatedCounter = ({ end }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.ceil(end / 100));
    }, 10);
    return () => clearInterval(interval);
  }, [end]);
  
  return <span>{Math.min(count, end)}</span>;
};
```

---

## 5. Layout Responsivo

### Mobile (< 768px)
```
Full width cards
Single column layout
Hamburger menu
Larger touch targets
```

### Tablet (768px - 1024px)
```
2 column cards
Side navigation
Optimized spacing
```

### Desktop (> 1024px)
```
3 column cards
Full navbar
Maximum showcase
```

---

## 6. Estrutura de Arquivos (Frontend)

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── GameCard.tsx
│   ├── StatsBox.tsx
│   ├── CTAButton.tsx
│   └── Footer.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── Dashboard.tsx
│   ├── GamePage.tsx
│   └── StudioPage.tsx
├── styles/
│   ├── globals.css
│   ├── animations.css
│   └── colors.css
├── hooks/
│   ├── useAuth.ts
│   ├── useWallet.ts
│   └── useGames.ts
└── App.tsx
```

---

## 7. Paleta de Cores em Código (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'coon': {
          50: '#F3E8FF',
          100: '#E9D5FF',
          500: '#7C3AED', // Purple Principal
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#581C87',
        },
        'coon-orange': '#FF6B35',
        'coon-green': '#10B981',
      },
      backgroundImage: {
        'gradient-coon': 'linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1F2937 100%)',
      },
    },
  },
};
```

---

## 8. User Flow (Como Funciona)

```
┌─────────────────────────────────────────────────┐
│ 1. USER CHEGA NA LANDING PAGE                   │
│    └─ Vê games e estilo COON                    │
│    └─ Clica "Começar Agora" ou "Fazer Login"  │
├─────────────────────────────────────────────────┤
│ 2. LOGIN/SIGNUP COM GOOGLE                      │
│    └─ Email autofill (Google)                   │
│    └─ Cria conta automaticamente                │
├─────────────────────────────────────────────────┤
│ 3. DASHBOARD PRINCIPAL                          │
│    └─ Vê saldo wallet                           │
│    └─ Vê seus games                             │
│    └─ Acessa Studio                             │
├─────────────────────────────────────────────────┤
│ 4. ESCOLHE UM GAME (ONZAP/ONLOVE/ONMAIL)       │
│    └─ Joga                                      │
│    └─ Vê cosmetics                              │
│    └─ Compra com wallet                         │
├─────────────────────────────────────────────────┤
│ 5. ACESSA STUDIO (Game Builder)                │
│    └─ Seleciona template                        │
│    └─ Customiza com IA                          │
│    └─ Publica por R$ 4,99                       │
└─────────────────────────────────────────────────┘
```

---

## ✅ Design Thinking Completo

**Pronto para EXECUTOR começar?** ✅

- Paleta de cores definida
- Layouts mockup'd
- Componentes planejados
- Efeitos especificados
- Responsividade coberta
- User flow mapeado

**EXECUTOR pode começar a codificar AGORA!** 🚀
