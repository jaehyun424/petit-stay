# S03: Parent TrustCheckIn + LiveStatus + History + Profile + QRDisplay

> 범위: Parent App 나머지 5개 페이지만.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')` 사용, 4개 언어 추가, TypeScript strict
- 모바일 퍼스트, 터치 타겟 48px+
- 완료 시 `npm run build` 에러 제로

## TrustCheckIn.tsx (~251줄)
1. StepIndicator 개선: 숫자 → 아이콘+라벨 (Shield/Phone/PenTool from lucide)
   - 완료=gold bg+Check, 활성=gold border, 미완료=grey
2. 스텝 전환: AnimatePresence + slide (Booking과 동일 패턴)
3. 각 스텝 validation: 빈 값 경고, SignaturePad 빈 서명 방지

## LiveStatus.tsx (~111줄)
1. 세션 정보: 시터, 호텔, 객실, 시작시간, 경과시간
2. ActivityFeed lucide 아이콘: Palette(놀이), Utensils(식사), Moon(수면), FileText(메모), Camera(사진)
3. 긴급 통화 `<a href="tel:119">`
4. 세션 없으면 EmptyState

## History.tsx (~131줄)
1. Pagination 동작 확인
2. 완료 예약에 "리뷰 쓰기" 버튼 → ReviewForm 모달 → StarRating + 코멘트 → toast
3. EmptyState, 카드 hover lift

## Profile.tsx (~488줄)
1. 아동 CRUD 전부 동작 확인, 빈 상태 처리
2. 결제 수단: PaymentMethodCard, 없으면 안내
3. 설정: 다크모드, 언어, 로그아웃 동작 확인
4. 저장 버튼 → 변경 시에만 활성화

## QRDisplay.tsx (~93줄)
1. QR + 예약 요약, 복사 버튼 동작, 중앙 정렬

## 완료: `git add -A && git commit -m "feat: parent remaining pages — TrustCheckIn, LiveStatus, History, Profile"`
