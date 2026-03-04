# S12: 알림 센터 고도화 + 검색/필터 강화

> 범위: NotificationBell + NotificationInbox 고도화, Hotel Bookings / Ops Reservations 검색 필터 강화.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')`, 4개 언어, TypeScript strict
- 완료 시 `npm run build` 에러 제로

## 작업 1: NotificationBell.tsx (154줄) 고도화

1. 알림 드롭다운 → 최근 5개 미리보기:
   - 아이콘 (예약확인=Calendar, 세션시작=Play, 세션완료=CheckCircle, 리뷰=Star, 이슈=AlertTriangle)
   - 시간 표시 (date-fns `formatDistanceToNow`)
   - 읽음/안읽음: 안읽음은 좌측 gold dot
   - "모두 읽음" 버튼
2. "전체 보기" → NotificationInbox로 이동
3. 알림 개수 뱃지: 0이면 뱃지 숨김, pulse 애니메이션

## 작업 2: NotificationInbox.tsx (126줄) 고도화

1. 알림 타입별 필터 탭: 전체 | 예약 | 세션 | 리뷰 | 이슈
2. 각 알림 카드:
   - 아이콘 + 제목 + 설명 + 시간
   - 클릭 → 해당 페이지로 이동 (예약 알림 → Bookings, 세션 알림 → LiveMonitor 등)
   - 스와이프 삭제 또는 삭제 버튼
3. 빈 상태: EmptyState "새로운 알림이 없습니다"
4. 데모 알림 데이터 (demo.ts에 추가):
   - "Grand Hyatt Seoul에서 새 예약이 접수되었습니다" (5분 전)
   - "Kim Minjung 시터가 세션을 시작했습니다" (1시간 전)
   - "Sarah Johnson님이 5점 리뷰를 남겼습니다" (3시간 전)
   - "Room 2105 세션이 완료되었습니다" (어제)
   - 최소 8개 알림, 다양한 타입

## 작업 3: Hotel Bookings 검색/필터 강화

현재 검색+필터 바 확인 후 개선:
1. **검색**: 게스트 이름, 예약번호로 검색 (debounce 300ms)
2. **상태 필터**: All | Upcoming | Active | Completed | Cancelled (탭 또는 드롭다운)
3. **날짜 필터**: "오늘", "이번 주", "이번 달", 커스텀 범위
4. **정렬**: 날짜순(최신/오래된), 금액순
5. 모바일: 필터 접기/펼치기 (collapsible)
6. 결과 없을 때: EmptyState "조건에 맞는 예약이 없습니다"

## 작업 4: Ops Reservations 검색/필터 강화

Hotel Bookings와 동일한 패턴 + 추가:
- **호텔 필터**: 드롭다운으로 특정 호텔 선택
- **시터 필터**: 시터별 검색

## 완료: `git add -A && git commit -m "feat: notification center, advanced search/filter for bookings"`
