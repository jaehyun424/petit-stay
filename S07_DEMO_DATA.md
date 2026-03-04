# S07: 데모 데이터 현실화 + 기능 연결

> 범위: src/data/demo.ts 전면 수정 + 누락 기능 연결.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- types/index.ts 타입 준수
- 데모 = "실제 서비스처럼" (심사위원이 볼 것)
- 완료 시 `npm run build` 에러 제로

## 1. 날짜 동적화
하드코딩 `new Date('2024-...')`, `new Date('2025-...')` → 전부 동적:
```typescript
const now = new Date();
const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
```
- 예약: 오늘~내일, 과거: 1~14일 전, 문서: 3~6개월 전

## 2. 다국적 이름
- 부모: Sarah Johnson, Tanaka Yuki, Lee Sujin(이수진), Zhang Meihua(张美华), Maria Garcia
- 아이: Emma(5), Yui(4), Haeun(6), Xiaoming(3), Lucas(7)
- 시터: Kim Minjung, Park Sooyeon, Sato Haruka, Chen Wei, Lee Jihye
- 호텔: Grand Hyatt Seoul, The Shilla Seoul, Signiel Seoul, Four Seasons Seoul, Park Hyatt Busan

## 3. 통계 현실화
todayBookings:5, todayRevenue:900000, activeNow:2, monthlyBookings:47, monthlyRevenue:8460000, totalSitters:12, averageRating:4.87, incidentFreeStreak:94

## 4. 차트 데이터
- 월별 매출: 최근 6개월 (성장 추세: 320만→480만→620만→750만→840만→900만)
- 호텔별 비중: Grand Hyatt 35%, Shilla 25%, Signiel 20%, Four Seasons 15%, Park Hyatt 5%

## 5. 기능 연결
- History → 리뷰: ReviewForm 모달 연동
- Bookings → 게스트 링크: clipboard.writeText → toast
- 시터 아바타: `https://ui-avatars.com/api/?name=Kim+Minjung&background=C5A059&color=fff&size=80`
- 시터 카드 "Hotel Verified" 뱃지

## 완료: `git add -A && git commit -m "feat: demo data — dynamic dates, diverse names, realistic stats"`
