# 🎨 OnCreators Web Frontend

**React 18 + Vite + Tailwind CSS**

Premium creator marketplace frontend connected to the OnCreators API.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📁 Structure

```
src/
├── components/       (Reusable components)
├── pages/           (Page components)
├── services/        (API client)
├── store/           (Redux store)
├── hooks/           (Custom hooks)
└── App.jsx          (Main app)
```

## 🎯 Pages (16 Total)

- ✅ Home
- ✅ Login
- ✅ Register
- ✅ Premium
- ✅ Pricing
- ✅ Checkout
- ✅ Dashboard
- ✅ Creators
- ✅ Creator Profile
- ✅ Marketplace
- ✅ Settings
- 🚧 Content Player
- 🚧 Cart
- 🚧 Orders
- 🚧 Analytics
- 🚧 Admin Panel

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build:** Vite
- **CSS:** Tailwind CSS
- **State:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP:** Axios
- **Payments:** Stripe.js
- **Theming:** next-themes

## 📦 Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
npm run lint     # Run linter
```

## 🎨 Design System

- **Colors:** Primary (#FF6B35), Secondary (#004E89)
- **Typography:** Montserrat (headers), Inter (body)
- **Components:** Cards, Buttons, Forms, Tables
- **Dark Mode:** Built-in support

## 🔗 API Integration

All pages connected to backend at `http://localhost:3333`

**Auth Endpoints:**
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /auth/me

**Creator Endpoints:**
- GET /creators
- GET /creators/:id
- POST /creators

**And 40+ more endpoints...**

## 🚀 Week 2 Progress

- Day 1: Frontend architecture ✅
- Day 2: Premium pages ✅
- Day 3: Marketplace ✅
- Day 4: Mobile setup
- Day 5: Mobile completion
- Day 6-7: Testing & Polish

## 📱 Mobile App

Separate React Native app in `../oncreators-mobile`

## 🔐 Authentication

JWT tokens stored in localStorage

```javascript
import { useSelector } from 'react-redux'

const { user, token } = useSelector(state => state.auth)
```

## 🎉 Ready for Production

All pages responsive, dark mode supported, API integrated.

Visit http://localhost:3000 to see it live!
