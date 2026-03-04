# S14: 반응형 전면 점검 — 전체 앱

> 범위: 모든 페이지를 375px~1440px에서 점검.

너는 Petit Stay의 시니어 CSS 엔지니어다.

## 규칙
- CSS 변수 사용, 기존 레이아웃 깨뜨리지 마라
- Hotel/Ops = 데스크탑 기준 → 모바일 대응
- Parent/Sitter = 모바일 퍼스트 → 데스크탑에서 max-width
- 완료 시 `npm run build` 에러 제로

## 뷰포트: 375px, 390px, 768px, 1280px, 1440px

## Landing + Solutions (src/styles/pages/landing.css, solutions.css)
```css
@media (max-width: 768px) {
  .hero-title { font-size: clamp(1.75rem, 6vw, 3rem); }
  .hero-actions, .cta-actions { flex-direction: column; gap: var(--space-3); }
  .hero-actions a, .cta-actions a { width: 100%; text-align: center; }
  .trust-bar-grid { grid-template-columns: 1fr 1fr; }
  .feature-row { flex-direction: column; }
  .steps-grid { grid-template-columns: 1fr; }
  .testimonial-grid { grid-template-columns: 1fr; }
  .landing-footer-content { flex-direction: column; text-align: center; }
  .solutions-grid { grid-template-columns: 1fr; }
  .solutions-cta-btn { width: 100%; }
}
```

## Auth (login.css, register.css)
```css
@media (max-width: 768px) {
  .auth-video-section { display: none; }
  .auth-form-card { width: 100%; max-width: none; margin: var(--space-4); }
}
```

## Hotel/Ops Console
- StatCard 그리드: 768px→2열, 375px→1열
- 테이블: 모바일에서 `overflow-x: auto; -webkit-overflow-scrolling: touch;`
- 사이드바 → 오버레이 동작 확인
- recharts 차트: `<ResponsiveContainer>` 이미 사용 → width 100%

## Parent/Sitter (모바일 퍼스트)
- 데스크탑: `max-width: 640px; margin: 0 auto;`
- 바텀 내비: `padding-bottom: env(safe-area-inset-bottom, 0);`
- Booking 폼: 좁은 화면에서 입력 필드 width:100%

## Guest
- 폼 카드: `max-width: 500px; width: 100%;`
- StepIndicator: 모바일에서 라벨 숨기고 아이콘만

## 공통
- [ ] 수평 스크롤바 없음
- [ ] 텍스트 overflow 없음 (특히 일본어)
- [ ] 모달: 모바일에서 width: calc(100% - 32px)
- [ ] 터치 타겟 48px+
- [ ] 이미지 object-fit: cover

## 완료: `git add -A && git commit -m "fix: responsive — all pages 375px to 1440px"`
