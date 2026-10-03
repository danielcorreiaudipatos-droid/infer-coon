# 💰 WALLET INTEGRATION - Todos os Aplicativos

**Objetivo**: Um wallet único que funciona em TUDO  
**Apps**: ONZAP, ONLOVE, COON, ONMAIL  
**Foco**: Estética, Funcionamento, Segurança, Precisão

---

## 🏗️ ARQUITETURA DO WALLET UNIFICADO

```
┌─────────────────────────────────────────────────────┐
│           UNIFIED WALLET SYSTEM                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [COON] ──────┐                                     │
│               │                                     │
│  [ONZAP] ─────┼──→ WALLET SERVICE ──→ DATABASE    │
│               │                                     │
│  [ONLOVE] ────┤                                     │
│               │                                     │
│  [ONMAIL] ────┘                                     │
│                                                     │
│  ✅ Single balance across all apps                  │
│  ✅ Real-time sync (WebSocket)                      │
│  ✅ Unified transactions                            │
│  ✅ Auto-debit integration                          │
│  ✅ Rewards system (shared)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 WALLET UI/UX - Design Specifications

### Visual Consistency Across Apps

```
HEADER WALLET WIDGET (appears in all apps):

┌────────────────────────────────────────┐
│ 💰 Wallet: R$ 350.50                   │ ← Always visible
│ ├─ Available: R$ 350                   │
│ ├─ Pending: R$ 150 (campaigns)         │
│ └─ [Deposit] [Withdraw] [History]      │
└────────────────────────────────────────┘

COLORS (Dark theme optimized):
├─ Primary: #00D084 (earnings green)
├─ Warning: #FF6B35 (low balance orange)
├─ Success: #00D084 (transaction green)
├─ Alert: #E74C3C (insufficient red)
└─ Background: #1A1A1A (dark)

FONTS:
├─ Balance: 24px bold (clear, large)
├─ Labels: 12px regular (subtle)
├─ Actions: 14px semibold (clickable)
└─ Family: Inter / Roboto (modern, clean)
```

### Animation & Interaction

```
WHEN BALANCE UPDATES:
├─ +R$ amount → Green flash (300ms)
├─ -R$ amount → Orange flash (200ms)
├─ Final state → Smooth slide (600ms)

WHEN USER CLICKS "DEPOSIT":
├─ Modal slides up (300ms)
├─ Smooth fade-in form (200ms)
├─ Loading spinner (if processing)
└─ Success toast (2s)

WHEN CAMPAIGN CHARGES:
├─ Balance updates in real-time
├─ Small notification badge
├─ Transaction appears in history immediately
└─ No page reload needed
```

---

## 🔗 INTEGRATION MATRIX

### COON ↔ Wallet

```
┌──────────────────────────────────────────┐
│ COON (Ad Management Platform)            │
├──────────────────────────────────────────┤
│                                          │
│ Auto-debit on:                           │
│ ├─ Subscription (R$ 199/mês)             │
│ ├─ Campaign creation (any amount)        │
│ └─ Add-ons (extra contacts, API)         │
│                                          │
│ Displays:                                │
│ ├─ Campaign spend total                  │
│ ├─ Wallet balance widget                 │
│ ├─ Quick deposit button                  │
│ └─ All transactions history              │
│                                          │
│ Integration Points:                      │
│ ├─ Dashboard → Wallet widget (top right) │
│ ├─ Create campaign → Auto-debit popup    │
│ ├─ Settings → Wallet management          │
│ └─ Profile → Transaction history         │
│                                          │
└──────────────────────────────────────────┘
```

### ONZAP ↔ Wallet

```
┌──────────────────────────────────────────┐
│ ONZAP (WhatsApp Sales Automation)        │
├──────────────────────────────────────────┤
│                                          │
│ Auto-debit on:                           │
│ ├─ Subscription (R$ 59-499/mês)          │
│ ├─ AI chat premium features              │
│ └─ Extra contacts/broadcasts             │
│                                          │
│ Displays:                                │
│ ├─ Wallet balance (header)               │
│ ├─ Campaign spend tracker                │
│ ├─ Quick actions (Deposit, Withdraw)     │
│ └─ Earnings from referrals               │
│                                          │
│ Integration Points:                      │
│ ├─ Chat screen → Wallet widget           │
│ ├─ Create campaign → Wallet auto-debit   │
│ ├─ Settings → Billing preferences        │
│ └─ Referral page → Earning display       │
│                                          │
└──────────────────────────────────────────┘
```

### ONLOVE ↔ Wallet

```
┌──────────────────────────────────────────┐
│ ONLOVE (Creator Community Platform)      │
├──────────────────────────────────────────┤
│                                          │
│ Auto-debit on:                           │
│ ├─ Subscription (R$ 49-499/mês)          │
│ ├─ Premium features unlock               │
│ └─ Extra storage/team members            │
│                                          │
│ Auto-credit on:                          │
│ ├─ Fan subscriptions                     │
│ ├─ Product sales                         │
│ ├─ Affiliate commissions                 │
│ └─ Gamification rewards                  │
│                                          │
│ Displays:                                │
│ ├─ Creator earnings dashboard            │
│ ├─ Withdrawal tracking                   │
│ ├─ Growth projections                    │
│ └─ Reward notifications                  │
│                                          │
│ Integration Points:                      │
│ ├─ Creator dashboard → Earnings widget   │
│ ├─ Settings → Payout method              │
│ ├─ Profile → Wallet history              │
│ └─ Rewards → Achievement notifications   │
│                                          │
└──────────────────────────────────────────┘
```

### ONMAIL ↔ Wallet

```
┌──────────────────────────────────────────┐
│ ONMAIL (Email Marketing for Creators)    │
├──────────────────────────────────────────┤
│                                          │
│ Auto-debit on:                           │
│ ├─ Subscription (R$ 29-199/mês)          │
│ ├─ Email sends over quota                │
│ └─ Advanced features (automation, etc)   │
│                                          │
│ Displays:                                │
│ ├─ Subscription status                   │
│ ├─ Current send usage                    │
│ ├─ Cost per send                         │
│ └─ Monthly spending graph                │
│                                          │
│ Integration Points:                      │
│ ├─ Dashboard → Cost & wallet widget      │
│ ├─ Send email → Cost calculation         │
│ ├─ Settings → Plan & billing             │
│ └─ Reports → Monthly spend summary       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA & BLINDAGEM

### Security Layers

```
LAYER 1: Authentication
├─ 2FA mandatory for withdrawals
├─ Device fingerprinting
├─ IP whitelist option
└─ Session timeout (30 min inactivity)

LAYER 2: Data Protection
├─ AES-256 encryption at rest
├─ TLS 1.3 in transit
├─ PCI-DSS compliance
└─ Card data tokenization (no storage)

LAYER 3: Fraud Detection
├─ AI anomaly detection
├─ Transaction velocity limits
├─ Impossible travel detection
├─ Unusual spending patterns
└─ Real-time monitoring

LAYER 4: Compliance
├─ LGPD (Brazil) compliant
├─ GDPR ready (for EU expansion)
├─ Money transmission license
├─ Regular audits

LAYER 5: Incident Response
├─ 24/7 monitoring
├─ Automated alerts
├─ Rapid response team
├─ User notification SLA
└─ Fraud reimbursement (100%)
```

### Vulnerabilities to Prevent

```
❌ RATE LIMITING (Prevent brute force):
├─ Max 5 failed logins → 15 min lockout
├─ Max 10 withdraw attempts/hour
├─ Max 100 API calls/minute per user
└─ DDoS protection (Cloudflare)

❌ SQL INJECTION:
├─ Parameterized queries (Prisma ORM)
├─ Input validation (Joi/class-validator)
├─ Escape all user input
└─ Regular security audits

❌ XSRF/CSRF:
├─ CSRF tokens on all state-changing ops
├─ SameSite cookies (Strict)
├─ Referer validation
└─ POST-only mutations

❌ XSS:
├─ Content Security Policy headers
├─ HTML escaping (React auto-escapes)
├─ No inline scripts
└─ Trusted dependencies only

❌ PRIVILEGE ESCALATION:
├─ Role-based access control (RBAC)
├─ Field-level authorization
├─ No client-side role changes
└─ Server-side validation always
```

---

## ✨ ESTÉTICA & UX IMPROVEMENTS

### Color Scheme (All Apps)

```
PRIMARY (Success/Positive):
├─ #00D084 - Earnings, profits, growth
├─ #00B86A - Hover state
├─ #009B54 - Active state
└─ #E8F9F5 - Background tint

SECONDARY (Actions/Interactive):
├─ #0066FF - Primary action
├─ #0052CC - Hover
├─ #003BA3 - Active
└─ #E3F0FF - Background

NEUTRAL (Text/Backgrounds):
├─ #1A1A1A - Dark background
├─ #2D2D2D - Surfaces
├─ #F5F5F5 - Light backgrounds
├─ #999999 - Secondary text
└─ #FFFFFF - Text on dark

WARNING/DANGER:
├─ #FF6B35 - Warning (low balance)
├─ #E74C3C - Error/Danger
├─ #FFF0E6 - Warning background
└─ #FDEAE6 - Error background
```

### Typography System

```
HEADINGS:
├─ H1: 32px bold (page titles)
├─ H2: 24px bold (section titles)
├─ H3: 18px semibold (subsections)
└─ H4: 14px semibold (labels)

BODY:
├─ Large: 16px regular (main text)
├─ Base: 14px regular (descriptions)
├─ Small: 12px regular (helpers)
└─ Tiny: 11px regular (timestamps)

SPECIAL:
├─ Balance amount: 24px bold (prominent)
├─ CTA buttons: 14px semibold (clickable)
├─ Monospace: 13px (amounts, codes)
└─ Family: Inter (modern, clean, readable)
```

### Component Library

```
CARD DESIGN:
├─ 8px border radius (modern)
├─ Subtle shadow (elevation)
├─ Padding: 16px standard
├─ Border: 1px solid #333
└─ Hover: Slight scale (1.02) + shadow increase

BUTTONS:
├─ Primary: Full width on mobile, auto on desktop
├─ Padding: 12px 24px
├─ Border radius: 6px
├─ Font weight: semibold (600)
├─ Min height: 44px (touch target)
└─ States: default, hover, active, disabled

INPUTS:
├─ Border: 1px solid #999
├─ Padding: 12px 16px
├─ Border radius: 6px
├─ Font size: 16px (prevents zoom on mobile)
├─ Focus: Blue outline, no default
└─ Error: Red border + message below

MODALS:
├─ Overlay: Dark backdrop (rgba 0,0,0,0.6)
├─ Content: Centered on screen
├─ Max width: 500px (desktop), 90% (mobile)
├─ Animation: Slide up + fade (300ms)
├─ Close: X button + click outside
└─ Actions: Clear primary + secondary buttons
```

---

## 📱 RESPONSIVE DESIGN

### Mobile (< 768px)

```
WALLET WIDGET:
├─ Full width minus 16px padding
├─ Stacked layout (vertical)
├─ Balance display: 20px bold
├─ Buttons: Full width, 44px height
└─ Modal: Fills screen (90% width, centered)

TRANSACTIONS:
├─ List view only (no table)
├─ Each transaction: Full card, stackable
├─ Swipe to delete (if applicable)
├─ Pull to refresh enabled
└─ Load more button at bottom
```

### Tablet (768px - 1024px)

```
LAYOUT:
├─ Wallet widget: Top bar or sidebar
├─ Two-column layout if space allows
├─ Slightly larger touch targets (48px)
├─ Modal: 600px max width
└─ Optimized for portrait + landscape
```

### Desktop (> 1024px)

```
LAYOUT:
├─ Wallet widget: Sidebar or top bar
├─ Full table view for transactions
├─ Charts and graphs possible
├─ Modal: 700px max width
├─ Multiple columns if needed
└─ Advanced filtering options
```

---

## 🎯 FUNCIONAMENTO & PRECISÃO

### Real-time Sync

```
REQUIREMENT: <500ms update latency

WebSocket Implementation:
├─ Balance update: Emit immediately
├─ Transaction: Appear within 200ms
├─ Campaign charge: Auto-debit without delay
└─ Notification: Push alert within 100ms

Fallback (if WebSocket down):
├─ Poll every 5 seconds
├─ Still show transactions immediately
├─ Server-side validation on next sync
└─ No double-charging possible
```

### Precision Rules

```
MONETARY PRECISION:
├─ All amounts: 2 decimal places (cents)
├─ Rounding: Banker's rounding (round half to even)
├─ No floating point: Use integers (cents) in DB
├─ Display format: R$ X.XX (always)
└─ Conversion: Always server-side

TRANSACTION ORDERING:
├─ Timestamp: UTC, millisecond precision
├─ Display: Newest first (descending)
├─ Idempotency: Every transaction has unique ID
└─ No duplicates: Check before processing

BALANCE CALCULATION:
├─ Always server-side (never client)
├─ Never round intermediate values
├─ Final balance: Exact sum of all transactions
├─ Audit trail: Every change logged
└─ Reconciliation: Nightly automated check
```

### Notifications

```
CRITICAL EVENTS:
├─ Balance low (< R$ 10) → Email + SMS + Push
├─ Withdrawal processed → Instant notification
├─ Failed charge → Email + app notification
├─ Referral earned → In-app notification
├─ Cashback received → In-app notification
└─ Security alert → Urgent (SMS + Email)

NOTIFICATION FORMAT:
├─ Title: Clear, concise (max 50 chars)
├─ Body: Context + action (max 120 chars)
├─ CTA: "View" or "Take action" button
└─ Dismiss: User can ignore (still logged)
```

---

## 📊 MONITORING & ANALYTICS

### Metrics to Track

```
WALLET HEALTH:
├─ Total balance in system (R$)
├─ Active wallets
├─ Daily transactions
├─ Average transaction size
├─ Wallet empty users (%)
├─ Failed charges (%)
└─ Churn rate (30-day)

PERFORMANCE:
├─ API response time (ms)
├─ WebSocket latency (ms)
├─ Transaction processing time (ms)
├─ Error rate (%)
├─ Uptime (%)
└─ Concurrent users

BUSINESS:
├─ Total fees collected (our margin)
├─ Total throughput (volume)
├─ Repeat usage (%)
├─ User satisfaction (NPS)
└─ Referral rate
```

---

**Status**: ✅ Wallet integration ready for all apps  
**Launch**: Can be live in 2-3 weeks  
**Revenue Impact**: +R$ 50-100k MRR (wallet-specific)

