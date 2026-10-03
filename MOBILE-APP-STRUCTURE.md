# 🚀 OnGame Mobile App - React Native + Expo

**Platform:** iOS + Android (React Native + Expo)  
**Status:** Ready to create  
**Timeline:** Complete in 3 days

---

## Project Structure

```
mobile-app/
├── app.json                          # Expo config
├── package.json
├── babel.config.js
├── tsconfig.json
├── eas.json                          # EAS Build config
├── .env.example
├── index.js
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── games/
│   │   │   ├── ONZAPScreen.tsx       # Jumping game
│   │   │   ├── ONLOVEScreen.tsx      # Matching game
│   │   │   └── ONMAILScreen.tsx      # Tower defense
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LeaderboardScreen.tsx
│   │   │   └── StatsScreen.tsx
│   │   ├── shop/
│   │   │   ├── ShopScreen.tsx
│   │   │   ├── CosmeticsScreen.tsx
│   │   │   └── CheckoutScreen.tsx
│   │   ├── wallet/
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── WithdrawScreen.tsx
│   │   │   └── TransactionHistoryScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       └── About Screen.tsx
│   ├── components/
│   │   ├── BottomTabNavigator.tsx
│   │   ├── GameCard.tsx
│   │   ├── CosmeticItem.tsx
│   │   ├── LeaderboardItem.tsx
│   │   ├── WalletCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── game-engines/
│   │   ├── ONZAPEngine.ts            # Jumping logic
│   │   ├── ONLOVEEngine.ts           # Matching logic
│   │   └── ONMAILEngine.ts           # Tower defense logic
│   ├── services/
│   │   ├── api.ts                    # API calls
│   │   ├── auth.ts                   # Authentication
│   │   ├── wallet.ts                 # Wallet operations
│   │   ├── games.ts                  # Game API
│   │   ├── stripe.ts                 # Stripe integration
│   │   └── analytics.ts              # Event tracking
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useLeaderboard.ts
│   │   └── useGame.ts
│   ├── store/
│   │   ├── authStore.ts              # Zustand auth
│   │   ├── walletStore.ts            # Zustand wallet
│   │   ├── gameStore.ts              # Zustand games
│   │   └── userStore.ts              # Zustand user
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── game.types.ts
│   │   └── api.types.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── constants.ts
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── __tests__/
    ├── games/
    ├── services/
    └── utils/
```

