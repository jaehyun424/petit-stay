# S05: Guest Page 완전 개편

> 범위: GuestPage + 6개 step 컴포넌트만.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')`, 4개 언어, 모바일 퍼스트
- 완료 시 `npm run build` 에러 제로

## StepIndicator.tsx (32줄 → 대폭 개선)
- 완료=gold bg+Check, 활성=gold border+숫자, 미완료=grey
- 스텝 간 연결선 (완료=gold, 미완료=grey)
- 각 스텝 아래 라벨 (i18n: 예약확인, 동의, 결제, 완료)

## GuestPage.tsx
- 토큰 만료 에러 페이지: AlertCircle + t('guest.tokenExpired') + 설명
- AnimatePresence 스텝 전환 확인

## ReservationInfo.tsx — 아이콘+카드 (Calendar, Clock, Building, Baby)
## ConsentForm.tsx — 체크박스 3개, 모두 체크해야 다음 활성화, 터치 48px+
## PaymentStep.tsx — PriceBreakdown 사용 (S02에서 생성), 결제 시뮬레이션

## ConfirmationStep.tsx (30줄 → 대폭 확장)
1. 축하 애니메이션: CheckCircle scale-up spring
   ```tsx
   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
     <CheckCircle size={64} color="var(--gold-500)" />
   </motion.div>
   ```
2. 예약 요약: 날짜, 시간, 호텔, 시터
3. 예약 번호: `PS-2026-MMDD-001`
4. 안내 문구 i18n

## FeedbackStep.tsx — StarRating + textarea + 제출 toast

## 완료: `git add -A && git commit -m "feat: guest page — step indicator, confirmation celebration"`
