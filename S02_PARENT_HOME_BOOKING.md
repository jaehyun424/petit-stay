# S02: Parent Home + Booking — 요금 수정 + PriceBreakdown + 스텝 애니메이션

> 범위: Parent Home.tsx + Booking.tsx + PriceBreakdown 신규 컴포넌트. 다른 파일 건드리지 마라.

너는 Petit Stay의 시니어 풀스택 엔지니어다. 기존 코드를 먼저 읽고 점진적으로 개선하라.

## 규칙
- Quiet Luxury 디자인 시스템 유지 (CSS 변수, 새 색상/폰트 금지)
- 모든 텍스트 `t('key')`, 새 키는 en/ko/ja/zh 4개 전부 추가
- TypeScript strict, `any` 금지
- 완료 시 `npm run build` 에러 제로

## 작업 1: PriceBreakdown 공통 컴포넌트 생성

`src/components/common/PriceBreakdown.tsx` 신규 생성:
```tsx
interface PriceItem { labelKey: string; amount: number; highlight?: boolean; }
interface PriceBreakdownProps { items: PriceItem[]; total: number; }
```
- 각 항목: 라벨(i18n) + 금액(Intl.NumberFormat 'ko-KR' currency KRW)
- 합계: 굵은 폰트, gold 색상, 상단 구분선
- CSS: `.price-breakdown`, `.price-row`, `.price-row-total`

## 작업 2: Booking.tsx 요금 수정 (중요!)

1. `baseRate = 70000` → `60000` 전부 변경 (사업계획서 기준 ₩60,000/h)
2. 추가 아동 ₩20,000/h, 야간 +20%, 긴급당일 +₩30,000, Gold 시터 +₩50,000 → 확인
3. 확인 스텝에서 PriceBreakdown 컴포넌트 사용
4. 하단 sticky 요금 미리보기 bar:
   ```css
   .booking-price-sticky { position: sticky; bottom: 0; background: var(--cream-100);
     border-top: 1px solid var(--border-color); padding: var(--space-3) var(--space-4);
     font-family: var(--font-serif); z-index: 10; }
   ```
5. 3스텝 전환에 framer-motion AnimatePresence + slide:
   ```tsx
   const slide = {
     enter: { x: 40, opacity: 0 },
     center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
     exit: { x: -40, opacity: 0 }
   };
   ```

## 작업 3: Home.tsx

1. Trust indicators hover: `transform: scale(1.03); transition: 0.3s`
2. 통계 0이면 친절 문구 (i18n: `parent.noBookingsYet` 등)
3. AnimatedCounter 적용 (컴포넌트 이미 존재)
4. 빠른 액션 터치 타겟 48px+

## 완료 시
- `npm run build` 에러 제로
- `git add -A && git commit -m "feat: parent Home + Booking — pricing ₩60k, PriceBreakdown, step animation"`
