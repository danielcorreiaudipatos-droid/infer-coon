# 📱 OnGame Mobile App - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API URL and Stripe key

# 3. Start development server
npm start

# 4. Run on device
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

## Build for App Stores

### iOS

```bash
# Create EAS Build project
eas build-submit --platform ios

# Or build locally with Xcode
npm run build:ios
```

### Android

```bash
# Build APK or AAB
npm run build:android

# Submit to Play Store
npm run submit:android
```

## Project Structure

- `/src/screens` - All screen components
- `/src/components` - Reusable UI components
- `/src/services` - API and external services
- `/src/store` - Zustand state management
- `/src/game-engines` - Game logic (ONZAP, ONLOVE, ONMAIL)
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript types
- `/src/theme` - Design tokens (colors, spacing, typography)

## Key Features

✅ React Native + Expo  
✅ TypeScript  
✅ Zustand state management  
✅ React Navigation  
✅ Stripe payment integration  
✅ 3 fully playable games  
✅ Real-time leaderboards  
✅ Wallet integration  
✅ Cosmetics shop  

## Testing

```bash
npm test                 # Run unit tests
npm run lint            # Run linter
npm run type-check      # Check TypeScript
```

## Deployment

```bash
# Production build
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Support

For issues or questions, contact: dev@ongame.com

---

**Version:** 1.0.0  
**Last Updated:** 2026-10-03
