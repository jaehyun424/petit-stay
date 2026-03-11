# Petit Stay — Multilingual Babysitting Marketplace for Traveling Families

> Find verified babysitters in Seoul, regardless of where you stay.

![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.8-ffca28.svg)

---

## What is Petit Stay?

A C2C marketplace where foreign families traveling in Korea can search, compare, and book verified multilingual babysitters — directly from their phone.

- **Parents** search sitters by date, time, child age, and area. Compare profiles, watch intro videos, read verified reviews, then book and pay.
- **Sitters** set their own prices and availability. Accept or decline each request.
- **Partners** (hotels, Airbnb hosts, residences) refer guests via QR code. No staffing, no operations.

## Core Features

### For Parents
- Sitter search with filters (language, price, certifications)
- Detailed profiles: photo, intro video, badges, verified reviews, hourly rate
- 4-step booking: schedule → child info → emergency contacts → consent
- Escrow payment (foreign cards supported)
- Session report after every session

### For Sitters
- Profile & pricing management
- Weekly availability calendar
- Request inbox (accept/decline)
- Active session tools
- Earnings dashboard

### For Partners
- QR code generation for guest referral
- Referral booking dashboard
- Monthly reports

---

## Demo

**Live**: [petit-stay.web.app](https://petit-stay.web.app)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Parent | `parent@demo.com` | demo1234 |
| Sitter | `sitter@demo.com` | demo1234 |
| Partner | `partner@demo.com` | demo1234 |

> Demo mode uses sample data — no Firebase backend required.

---

## Quick Start

```bash
git clone https://github.com/jaehyun424/petit-stay.git
cd petit-stay
npm install
npm run dev          # http://localhost:5173
```

### Build & Deploy

```bash
npm run build        # Production build
firebase deploy      # Deploy to Firebase Hosting
```

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
| Icons | lucide-react |
| Design | Custom CSS — Quiet Luxury theme |

## Design

- **Theme**: Charcoal #1C1C1C + Cream #F9F9F7 + Gold #C5A059 + Pink #F5A9B8
- **Fonts**: Playfair Display (headings), Lato (body), Montserrat (CTAs)
- **Mobile-first**: Designed for tourists on phones

---

## Project Structure

```
src/
├── pages/
│   ├── v2/                  # V2 marketplace pages
│   │   ├── SearchPage        # Sitter search & filters
│   │   ├── SitterProfilePage # Profile, reviews, pricing
│   │   ├── BookingPage       # 4-step booking form
│   │   ├── CheckoutPage      # Payment & escrow
│   │   ├── BookingDetailPage  # Confirmation & session report
│   │   ├── ReviewPage        # Post-session review
│   │   ├── sitter/           # Sitter dashboard (profile, pricing, requests, earnings)
│   │   └── partner/          # Partner console (QR, bookings, reports)
│   ├── landing/              # Landing page
│   ├── auth/                 # Login, Register, Forgot password
│   ├── solutions/            # For Hotels, Families, Specialists
│   └── info/                 # About, Careers, Press, Help, Privacy, Terms
├── components/               # Shared components & layouts
├── contexts/                 # Auth, Theme, Toast
├── hooks/                    # Dual-mode hooks (demo / Firestore)
├── locales/                  # EN, KO, JA, ZH (1,250+ keys each)
├── styles/                   # Page & component CSS
└── utils/                    # Animations, formatting
```

---

## License

MIT License © 2026
