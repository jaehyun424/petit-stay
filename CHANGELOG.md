# Changelog

All notable changes to Petit Stay are documented in this file.

## [1.1.0] - 2026-03-05

### Wave 4: Production Hardening

#### Code Quality and Performance
- Dead code removal and unused import cleanup
- Component optimization and render performance improvements

#### Project Structure
- File organization and module boundary cleanup

#### Test Strengthening
- Test suite fixes and expanded coverage

#### Firebase Cleanup
- Firestore rules and security configuration review
- Cloud Functions cleanup

#### Docs and SEO
- README updated with full project documentation
- CHANGELOG maintained with all release history
- Open Graph and Twitter Card meta tags with absolute URLs
- robots.txt with authenticated route exclusions
- sitemap.xml with all public pages
- CONTRIBUTING.md with development and PR guidelines
- MIT LICENSE added

---

## [1.0.0-beta] - 2026-03-05

### Production Upgrade (10-Phase Plan)

#### Phase 10: Final QA
- Zero build errors, zero TypeScript warnings
- 1,250 i18n lines x 4 locales verified
- All pages lazy-loaded and responsive

#### Phase 9: Animations
- Parent History staggered booking cards
- Sitter Earnings staggered payment rows
- Framer Motion transitions across all pages

#### Phase 8: Demo Data Overhaul
- Dynamic dates using daysFromNow helpers
- Realistic pricing: Silver 60K, Gold 75-90K KRW/hr
- Confirmation codes: KCP-2026-xxxx format

#### Phase 7: Responsive Design
- Parent Home grids: 3 to 2 columns at 480px
- Guest/booking forms stack at 480px
- Weekly schedule optimized for narrow screens
- Notification dropdown overflow fix

#### Phase 6: i18n Audit
- NotificationBell and TierBadge migrated to t() calls
- All 4 locale files perfectly synced

#### Phase 5: Content Pages
- About page with B2B2C model and founding story
- Press page with 4 Korea/Japan-focused releases
- Help center expanded to 10 FAQ items
- Privacy policy with PIPA compliance
- Terms with Seoul Central District Court jurisdiction

#### Phase 4: UI/UX Polish
- Ops Issues severity borders and resolve button
- Guest page slide transitions with AnimatePresence

#### Phase 3: Auth and LanguageSwitcher
- LanguageSwitcher deduplication (sidebar only)
- RegisterPage ?role= URL param support

#### Phase 2: Landing Page Overhaul
- 3 Solutions pages (Hotels, Families, Specialists) with lazy routes
- LandingNav Solutions dropdown and footer links
- DemoBanner i18n support

#### Phase 1: Branding and Logo
- BrandLogo redesigned with "ps" italic ligature SVG
- showName prop for unified logo+text across layouts

---

## [0.9.0] - Feature Completion

### Hotel Console
- Real-time booking dashboard with live session monitoring
- Sitter management with tier badges (Gold/Silver) and safety records
- QR check-in scanner with manual code fallback
- Reports and analytics with CSV/PDF export
- Safety dashboard with incident tracking
- Weekly chart, summary stats, and activity timeline
- Branding preview modal in Settings
- Accept confirmation modal for assignments

### Parent App
- Multi-step booking wizard (5 steps) with real-time pricing
- Trust Protocol: 4-step verification (medical, emergency, consent, signature)
- Live session status with activity timeline and chat
- Booking history with review system (12 rich entries)
- QR display for check-in

### Sitter App
- Weekly schedule management with calendar and list views
- Active session care tools (activity log, photo upload, 10-item checklist)
- Earnings dashboard with monthly charts and hotel breakdown
- Profile with service regions, language display, document uploader
- Onboarding flow with progress bar, quiz, and pending approval

### Ops Console
- Platform-wide statistics and hotel management
- Reservation oversight with filters and search
- Sitter management with tier and status tracking
- Settlement processing (approve/pay) with animated summary
- Issue tracking with 5 severity levels and detail modals
- Insurance overview with status filters
- Comprehensive reports with executive summary

### Guest Page
- Token-based access (no login required)
- 4-step flow: reservation, consent, payment, confirmation
- Real consent content and rich confirmation details

---

## [0.8.0] - Infrastructure

### Core
- React 19.2 + TypeScript 5.9 + Vite 7
- Firebase 12.8 (Firestore, Auth, Storage, Hosting)
- DEMO_MODE dual-mode hooks pattern
- PWA support with service worker
- Dark mode with full theme support

### Design System
- Quiet Luxury theme: Charcoal + Cream + Gold
- Playfair Display, Lato, Montserrat fonts
- 28 shared UI components
- WCAG AA color contrast and accessibility

### i18n
- 4 languages: English, Korean, Japanese, Chinese
- react-i18next integration

### Testing
- Vitest test suite with 400+ test cases
- Component, hook, and service tests

---

## [0.1.0] - Initial Release

- Initial commit: hotel childcare platform MVP
- Firebase Auth and Firestore integration
- Basic routing and page structure
- Korean/English i18n support
