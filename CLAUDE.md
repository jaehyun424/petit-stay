# Petit Stay — Project Guide for Claude Code

## Project Overview
Premium hotel childcare platform. B2B2C model: hotels sell childcare service to foreign tourist families.
Tech: React 19 + TypeScript 5.9 + Vite 7 + Firebase 12.8 (Firestore, Auth, Storage, Functions)

## Architecture
- `src/pages/{module}/` — Hotel, Parent, Sitter, Guest, Ops, Landing, Auth, Info
- `src/hooks/use*.ts` — Dual-mode hooks (DEMO_MODE flag switches between demo data and Firestore)
- `src/services/firestore.ts` — All Firestore CRUD (10 service groups, 877 lines)
- `src/services/firebase.ts` — Firebase initialization
- `src/contexts/` — AuthContext (auth state), ThemeContext, ToastContext
- `src/components/common/` — 28 shared UI components
- `src/types/index.ts` — All TypeScript interfaces (683 lines)
- `src/data/demo.ts` — Mock data for demo mode
- `src/locales/` — i18n (en, ko, ja, zh)
- `functions/src/index.ts` — Cloud Functions (7 functions)

## CRITICAL: Demo → Real Conversion Pattern
Each hook checks `DEMO_MODE`. When converting:
1. Keep the DEMO_MODE branch for development/testing
2. Add the real Firestore branch using existing services from `src/services/firestore.ts`
3. Use `onSnapshot` for real-time data where needed (Dashboard, LiveMonitor, Sessions)
4. Always handle loading/error states

## Firestore Collections
users, hotels, bookings, sessions, children, activityLogs, reviews, sitters, incidents, notifications, guestTokens, settlements

## User Roles
parent, sitter, hotel_staff, admin — defined in `UserRole` type

## Coding Conventions
- Functional components with hooks only (no class components)
- Named exports for hooks, default exports for pages
- CSS Modules pattern: each page has matching CSS in `src/styles/pages/`
- Use existing common components from `src/components/common/`
- All text through i18n (`useTranslation` hook)
- Date handling: `date-fns`
- Animations: `framer-motion`
- Icons: `lucide-react`

## Don't
- Don't delete demo mode code — keep it as fallback
- Don't change the routing structure in App.tsx
- Don't modify types/index.ts unless adding new fields (never remove)
- Don't install new CSS frameworks (use existing design system)
- Don't change existing component APIs (add optional props only)

## Commands
npm run dev — Start dev server (port 5173)
npm run build — Production build
npm run test — Run vitest
firebase emulators:start — Start Firebase emulators
firebase deploy — Deploy to Firebase Hosting