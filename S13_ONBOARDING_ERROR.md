# S13: 온보딩 가이드 + 에러 바운더리 체계화

> 범위: 첫 사용자 온보딩 투어 구현 + ErrorBoundary 전체 적용 + 404 페이지 개선.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')`, 4개 언어
- 완료 시 `npm run build` 에러 제로

## 작업 1: 온보딩 가이드 (Hotel Console)

Hotel Console에 처음 진입할 때 나타나는 가이드 투어:

`src/components/common/OnboardingGuide.tsx` 신규 생성:
```tsx
interface Step { target: string; title: string; description: string; position: 'top' | 'bottom' | 'left' | 'right'; }
interface OnboardingGuideProps { steps: Step[]; onComplete: () => void; storageKey: string; }
```

- 각 스텝: 하이라이트(target 요소 주변 어두운 오버레이) + tooltip
- "다음" / "건너뛰기" / "완료" 버튼
- `localStorage`로 완료 여부 저장 (다시 안 보이게) — 주의: 데모 모드에서는 매번 표시 또는 "다시 보기" 옵션
- 부드러운 전환 (framer-motion)

Hotel Dashboard에 적용:
```tsx
const hotelSteps = [
  { target: '.stat-cards', title: t('onboarding.hotel.stats'), description: t('onboarding.hotel.statsDesc'), position: 'bottom' },
  { target: '.today-bookings', title: t('onboarding.hotel.bookings'), description: t('onboarding.hotel.bookingsDesc'), position: 'right' },
  { target: '.live-preview', title: t('onboarding.hotel.live'), description: t('onboarding.hotel.liveDesc'), position: 'left' },
  { target: '.sidebar-nav', title: t('onboarding.hotel.nav'), description: t('onboarding.hotel.navDesc'), position: 'right' },
];
```

i18n: onboarding 네임스페이스 4개 언어.

## 작업 2: Parent App 온보딩

Parent Home에 처음 진입할 때:
```tsx
const parentSteps = [
  { target: '.trust-indicators', title: t('onboarding.parent.trust'), description: '...', position: 'bottom' },
  { target: '.quick-actions', title: t('onboarding.parent.actions'), description: '...', position: 'top' },
  { target: '.bottom-nav', title: t('onboarding.parent.nav'), description: '...', position: 'top' },
];
```

## 작업 3: ErrorBoundary 전체 적용

현재 `ErrorBoundary.tsx` (93줄) 이미 존재. 이것이 전체 앱에 적용되어 있는지 확인:

App.tsx에서:
```tsx
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

각 모듈 레이아웃에도 개별 ErrorBoundary 래핑:
```tsx
// HotelLayout.tsx
<ErrorBoundary fallback={<ModuleErrorFallback module="hotel" />}>
  <Outlet />
</ErrorBoundary>
```

`ModuleErrorFallback` 컴포넌트 신규 생성:
- 에러 아이콘 + "문제가 발생했습니다" 메시지
- "새로고침" 버튼 + "홈으로" 버튼
- 에러 상세 (개발 모드에서만 표시)
- Quiet Luxury 스타일

## 작업 4: 404 Not Found 페이지 개선

`src/pages/NotFoundPage.tsx` 확인 후 개선:
- 큰 "404" 텍스트 (gold, serif)
- "페이지를 찾을 수 없습니다" (i18n)
- 검색 제안 또는 "홈으로 돌아가기" 버튼
- 최근 방문 페이지 링크 (선택)

## 완료: `git add -A && git commit -m "feat: onboarding guide, error boundary coverage, 404 page"`
