# Petit Stay

> **Premium Hotel Childcare Platform**
> 호텔 투숙객을 위한 프리미엄 아이돌봄 서비스 플랫폼

![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.8-ffca28.svg)

---

## Features

### Hotel Console (`/hotel/*`)
- Real-time booking dashboard with live session monitoring
- Sitter management with tier badges (Gold/Silver) and safety records
- QR check-in scanner with manual code fallback
- Reports & analytics with CSV export
- Safety dashboard with incident tracking (127+ incident-free days)

### Parent App (`/parent/*`)
- Multi-step booking wizard with real-time pricing
- **Trust Protocol** — 4-step verification (medical info, emergency contacts, safety consent, signature)
- Live session status with activity timeline and chat
- Booking history with review system

### Sitter App (`/sitter/*`)
- Weekly schedule management with session overview
- Active session care tools (activity log, photo upload, checklist)
- Earnings dashboard with monthly charts and hotel breakdown

### Ops Console (`/ops/*`)
- Platform-wide statistics and hotel management
- Reservation oversight and sitter management
- Settlement processing (approve/pay)
- Issue tracking with severity levels

### Guest Page (`/guest/:id`)
- Token-based access (no login required)
- 4-step flow: reservation → consent → payment → confirmation
- Multi-language support

### Landing Page (`/`)
- Video hero with parallax effect
- Trust indicators, feature showcase, testimonials
- Multi-language (EN/KO/JA/ZH)

---

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm 9+

### Installation

```bash
git clone https://github.com/anthropics/petit-stay.git
cd petit-stay
npm install
```

### Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run test         # Run test suite (Vitest)
npx tsc --noEmit     # TypeScript type check
```

### Firebase (optional)

```bash
cp .env.example .env              # Add your Firebase config
firebase emulators:start           # Start local emulators
firebase deploy                    # Deploy to Firebase Hosting
```

> Without Firebase config, the app runs in **demo mode** with mock data.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Hotel Staff | `hotel@demo.com` | demo1234 |
| Parent | `parent@demo.com` | demo1234 |
| Sitter | `sitter@demo.com` | demo1234 |
| Admin (Ops) | `admin@demo.com` | demo1234 |

> Demo mode uses mock data — no Firebase backend required.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19.2 + TypeScript 5.9 |
| Build | Vite 7 |
| Routing | react-router-dom v7 |
| Backend | Firebase 12.8 (Firestore, Auth, Storage, Hosting) |
| i18n | react-i18next (EN, KO, JA, ZH) |
| Animation | framer-motion 12 |
| Icons | lucide-react 0.575 |
| PDF | jsPDF |
| QR | qrcode.react + jsQR |
| Design | Custom CSS Design System ("Quiet Luxury" theme) |

---

## Design System

- **Theme**: Quiet Luxury — Deep Charcoal + Cream + Muted Gold
- **Fonts**: Playfair Display (serif), Lato (sans), Montserrat (action)
- **Colors**: `--charcoal-900 #1C1C1C`, `--cream-100 #F9F9F7`, `--gold-500 #C5A059`
- **Dark mode**: Full support via `[data-theme="dark"]`
- **Accessibility**: WCAG AA color contrast, focus-visible outlines, aria-labels

---

## Project Structure

```
src/
├── components/
│   ├── common/          # 27 shared components (Button, Card, Modal, Badge, etc.)
│   ├── layout/          # HotelLayout, ParentLayout, SitterLayout, OpsLayout
│   └── parent/          # ActivityFeed
├── contexts/            # Auth, Theme, Toast
├── data/                # Demo data (demo.ts)
├── hooks/               # 15 dual-mode hooks (DEMO_MODE / Firestore)
├── pages/
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── hotel/           # Dashboard, Bookings, LiveMonitor, Reports, Safety, Settings, SitterMgmt, ScanCheckIn
│   ├── parent/          # Home, Booking, TrustCheckIn, LiveStatus, History, Profile, QRDisplay
│   ├── sitter/          # Schedule, ActiveSession, Earnings, Profile
│   ├── ops/             # Dashboard, Reservations, SitterMgmt, HotelMgmt, Settlements, Issues, Reports
│   ├── guest/           # GuestPage (4-step flow)
│   ├── landing/         # LandingPage + components
│   └── info/            # About, Careers, Press, Help, Privacy, Terms
├── services/            # firebase.ts, firestore.ts (800+ lines), messaging.ts, storage.ts
├── styles/              # Page and component CSS
├── types/               # TypeScript interfaces (682 lines)
├── utils/               # animations.ts, format.ts
└── i18n/                # en.json, ko.json, ja.json, zh.json
```

---

## Architecture

```
Browser --> React SPA (Vite) --> Firebase (Firestore, Auth, Storage)
                |
                ├── DEMO_MODE branch: mock data from src/data/demo.ts
                └── REAL branch: Firestore via src/services/firestore.ts
```

- **B2B2C model**: Hotels subscribe, parents book childcare, sitters provide care
- **4 user roles**: `parent`, `sitter`, `hotel_staff`, `admin`
- **Dual-mode hooks**: Each hook checks `DEMO_MODE` and switches between demo data and Firestore
- **Lazy-loaded routes**: All pages are code-split via `React.lazy()`
- **i18n**: 4 languages with 1,250+ translation keys per locale

## Deployment

```bash
npm run build
firebase deploy
```

Live at: **https://petit-stay.web.app**

---

## License

MIT License © 2026
