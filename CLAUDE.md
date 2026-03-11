# CLAUDE.md — Petit Stay V2

## What this product is
Petit Stay is a **multilingual babysitting marketplace** for foreign families traveling in Korea.
Parents directly search, select, book, and pay sitters. Hotels are referral channels, not operators.
This is NOT a hotel childcare management tool. This is NOT a generic babysitter app.

## Hard rules
1. Parents choose sitters directly. Platform never force-assigns.
2. Sitters set their own prices. Platform shows recommended ranges only.
3. Hotels are referral partners, not employers. No staffing/dispatch language.
4. No exaggerated claims: "최초/유일/완전공백" → use "표준화 플랫폼은 공개적으로 부재"
5. Light mode only. No dark mode.
6. No AI-looking template UI. Design must feel like a real consumer app.
7. All Korean copy must sound natural — no translation artifacts, no startup hype.
8. Service scope V1: Seoul, 18-23h, age 3-8, in-room only, no medical/overnight.

## Users (all are important)
- **Parents**: Search → Profile → Book → Pay → Review. This is the core product.
- **Sitters**: Profile → Pricing → Availability → Accept/Decline → Session → Report → Earnings. Marketplace sellers.
- **Partners**: Hotel/host QR → Referral dashboard → Booking status. Channel tools.
- **Admin**: Internal only. Not visible in public product.

## V2 route structure
```
/                   Landing
/search             Sitter search results
/sitters/:id        Sitter profile (photo, video, badges, reviews, price)
/book               Booking form (child info, schedule, consent)
/checkout           Payment (foreign cards, escrow)
/booking/:id        Confirmation / session status / report
/review/:id         Post-session review
/sitter/*           Sitter dashboard (profile, pricing, availability, requests, earnings)
/partner/*          Partner console (QR, referral status, reports)
/auth/*             Login, Register, Forgot password
/about, /terms, /privacy, /help, /careers, /press
```

## Design direction
- Benchmark: Ably/29CM/Zigzag (Korean 20s consumer apps) + Care.com/UrbanSitter/Sittercity (sitter marketplace trust)
- Tone: warm, trustworthy, premium but not cold. Pink rabbit motif.
- Colors: Charcoal #1C1C1C + Cream #F9F9F7 + Gold #C5A059 + Pink #F5A9B8
- Fonts: Playfair Display (headings) + Lato (body) + Montserrat (CTAs)
- Mobile-first. Foreign tourists use phones.

## Copy direction
- Korean: natural, warm, non-robotic. For government judges.
- English: primary user language. Clean, trustworthy, short.
- Japanese: 2nd priority. Must feel native, not translated.
- No startup hype. No "revolutionizing" or "disrupting".

## Working method
1. Plan first — list files, acceptance criteria, risks. No code yet.
2. Implement only approved scope. Max 3-6 files per ticket.
3. Verify — re-read changed files, check each criterion. Say NOT APPLIED if not done.

## After every task
- List changed files
- Run npm run build
- Report failures honestly
- Check Korean copy for awkward phrasing
- Check mobile impact

## Reference files
- MASTER_BRIEF_V2.md — Product definition
- V2_ARCHITECTURE.md — Routes, screens, reuse plan
- CLAIMS_GUARDRAIL.md — What we can/cannot claim publicly

## Completion notification
```bash
curl -d "✅ Petit Stay V2: [task summary]" ntfy.sh/petit-stay-jh-2026
```
