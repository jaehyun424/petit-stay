# S09: Landing Page 고급 폴리시 + Footer 정비

> 범위: Landing 9개 컴포넌트 전부. Solutions는 건드리지 마라.

너는 Petit Stay의 시니어 UI/UX 엔지니어다.

## 규칙
- Quiet Luxury 유지, CSS 변수 사용
- 완료 시 `npm run build` 에러 제로

## HeroSection.tsx
1. 오버레이 그라데이션: 하단 어둡게 → 아래 콘텐츠와 자연스러운 이어짐
2. 텍스트 크기: `clamp(2rem, 5vw, 3.5rem)`
3. CTA 버튼 hover 상승 효과
4. 스크롤 다운 인디케이터: chevron bounce 애니메이션

## TrustBar.tsx
1. 수치: 500+ Sessions, 50+ Hotels, 4.9 Rating, 0 Incidents
2. 각 수치 옆 아이콘 (Calendar, Building, Star, Shield)
3. glassmorphism 배경

## FeatureShowcase.tsx
1. 이미지 hover: scale(1.03) + shadow
2. ScrollReveal 적용 확인
3. 이미지 URL 로드 확인

## HowItWorks.tsx
1. 3카드 높이 통일 (align-items: stretch, flex:1)
2. step 번호 gold accent (01, 02, 03)
3. hover translateY(-4px), ScrollReveal + stagger

## TestimonialSection.tsx
1. 인용부호(❝) gold, 별 평점, 이름+호텔+국적 플래그
2. 모바일: 1열 스택

## CTASection.tsx
1. 비디오 재생 확인, 오버레이 가독성
2. 버튼: /solutions/hotels + /solutions/families 링크 정확

## LandingFooter.tsx
1. `<BrandLogo showName />` 확인
2. Copyright: `© 2026 Petit Stay Inc. Seoul · Tokyo`
3. 링크 그룹: Solutions(3), Company(3), Support(3)

## LandingNav.tsx
1. 스크롤 시 배경 변경: 투명 → glassmorphism
   `.landing-nav.scrolled { background: rgba(249,249,247,0.9); backdrop-filter: blur(12px); }`
2. 모바일 햄버거 slide + overlay

## 완료: `git add -A && git commit -m "feat: landing — hero, trust, features, testimonials, CTA, footer polish"`
