# S15: 애니메이션 통일 + i18n 검수 + 성능 + 접근성 + SEO + README

> 범위: 최종 폴리시. 애니메이션, 번역, 성능, 접근성, SEO, README 전부.

너는 Petit Stay의 시니어 QA 엔지니어다.

## 규칙
- 대규모 리팩토링 하지 마라 — 빠진 것 추가, 깨진 것 수정만
- 완료 시 `npm run build` 에러 제로, warning 최소

## Part A: 애니메이션 통일

1. PageTransition: 4개 Layout에서 AnimatePresence + key 감싸기 확인
2. Layout 밖 페이지(Landing, Solutions, Auth, Info): motion.div 래핑 (opacity 0→1)
3. 카드 hover: translateY(-2px) + shadow — 빠진 곳 추가
4. 리스트 stagger: delay i*0.05 — 주요 리스트에
5. AnimatedCounter: Dashboard, Earnings, Safety 숫자에
6. Skeleton: 모든 isLoading 상태에

## Part B: i18n 검수

1. 하드코딩 찾기:
   ```bash
   grep -rn "toast\.\(success\|error\)" src/pages/ | grep -v "t("
   grep -rn 'placeholder="[A-Z]' src/ | grep -v "t("
   ```
   → i18n 키로 전환, 4개 언어 추가

2. 키 누락 확인: en.json 키 vs ko/ja/zh 키 비교 → 누락 추가

3. 번역 품질: JA です/ます체, KO 존댓말, ZH 简体字만

## Part C: 성능

1. console.log 제거 (catch 내 console.error는 유지):
   ```bash
   grep -rn "console\.log" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v test
   ```
2. 이미지 `loading="lazy"` 누락 추가
3. 비디오 `preload="metadata"`
4. App.tsx 모든 페이지 `lazy()` import 확인
5. TypeScript: `npx tsc --noEmit` 에러 수정

## Part D: 접근성

1. `<img>` 전부 `alt` 확인
2. 아이콘 버튼 `aria-label` 확인
3. 모달 ESC 닫기, 드롭다운 ESC 닫기
4. `aria-expanded`, `aria-current="page"`
5. gold 텍스트 대비: 작은 텍스트에 --gold-600(#A88B42) 또는 --gold-700(#8B7235) 사용
   (index.css에 변수 추가)

## Part E: SEO

index.html에:
```html
<meta name="description" content="Premium in-hotel childcare for traveling families. Trusted by luxury hotels in Seoul and Tokyo." />
<meta property="og:title" content="Petit Stay — Premium In-Hotel Childcare" />
<meta property="og:description" content="Trusted childcare for traveling families, powered by luxury hotel partnerships." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://petit-stay.web.app" />
<meta property="og:image" content="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200" />
<meta name="twitter:card" content="summary_large_image" />
```

manifest.json: name, short_name, theme_color(#1C1C1C), background_color(#F9F9F7)

## Part F: README.md

```markdown
# Petit Stay — Premium In-Hotel Childcare Platform
> B2B2C 호텔 연계형 프리미엄 차일드케어 플랫폼

## Demo: https://petit-stay.web.app
| Role | Email | Password |
|------|-------|----------|
| Hotel | demo@hotel.com | demo1234 |
| Parent | demo@parent.com | demo1234 |
| Sitter | demo@sitter.com | demo1234 |
| Ops | demo@ops.com | demo1234 |
Guest: /guest/demo-reservation-1

## Stack: React 19 + TypeScript 5.9 + Vite 7 + Firebase + framer-motion + recharts + react-i18next (EN/KO/JA/ZH)

## Setup: npm install → npm run dev → http://localhost:5173

© 2026 Petit Stay Inc.
```
(데모 계정 코드에서 확인 후 정확하게)

## Part G: 최종 빌드

```bash
npm run build
```
에러 제로, warning 정리.

## 완료: `git add -A && git commit -m "chore: final polish — animation, i18n, perf, a11y, SEO, README"`
