# S04: Sitter App — 4개 페이지 전부

> 범위: Schedule, ActiveSession, Earnings, Profile.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')`, 4개 언어, TypeScript strict
- 모바일 퍼스트, 터치 타겟 48px+
- 완료 시 `npm run build` 에러 제로

## Schedule.tsx (~125줄)
1. 오늘 세션 카드: 시간, 호텔, 객실, 아동 이름/나이/알레르기
2. 주간 그리드: 세션 있는 날 gold dot (6px circle, var(--gold-500))
3. 카운트다운 (다음 세션까지, setInterval 1분)
4. "세션 시작" → navigate('/sitter/active-session')
5. EmptyState

## ActiveSession.tsx (~214줄)
1. pulse dot CSS + 경과시간
2. 퀵 액션 4개 모달: 활동 로그, 사진, 간식, 이슈 → 각각 제출 → toast
3. 체크리스트 프로그레스 바 (gold fill, transition width 0.3s)
4. 세션 완료: ConfirmDialog → 요약 → toast

## Earnings.tsx (~219줄)
1. 월 수입: AnimatedCounter + 전월 대비 ▲/▼
2. CSS 바 차트 hover 값 표시
3. 결제 리스트 hover, 호텔별 분석 색상 바

## Profile.tsx (~355줄)
1. Avatar + TierBadge + 통계
2. 리뷰 StarRating + 코멘트 리스트
3. 가용시간 grid 모달, 문서 업로드, 은행정보 모달

## 완료: `git add -A && git commit -m "feat: sitter all pages — schedule, session, earnings, profile"`
