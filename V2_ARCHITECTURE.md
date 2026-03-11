# V2_ARCHITECTURE.md — Petit Stay V2 정보구조 & 기술 설계

## 1. 라우팅 구조

### Public (모든 방문자)
```
/                       랜딩 — 다국어, 히어로, 시터 검색 CTA
/search                 시터 검색 결과 — 필터(날짜/시간/아이 나이/위치/언어)
/sitters/:id            시터 프로필 상세 — 사진, 영상, 배지, 리뷰, 가격, 가용시간
/book/:sitterId         예약 폼 — 아이 정보, 스케줄, 동의, 특별 요청
/checkout/:bookingId    결제 — 해외카드(Visa/Master/JCB), 에스크로
/booking/:id            예약 확정 / 세션 진행 상태 / 종료 리포트
/review/:bookingId      리뷰 작성 (완료된 유료 세션만)
```

### Auth
```
/login                  로그인 (부모/시터 공용)
/register               회원가입 (부모/시터 선택)
/forgot-password        비밀번호 찾기
```

### Sitter Dashboard (로그인 필요)
```
/sitter                 시터 홈 — 오늘 요청, 다음 세션
/sitter/profile         프로필 편집 — 사진, 영상, 자격, 언어, 자기소개
/sitter/pricing         가격 설정 — 시급, 야간 할증, 권장 밴드 표시
/sitter/availability    가용시간 관리 — 캘린더
/sitter/requests        예약 요청함 — 수락/거절
/sitter/active          진행 중 세션 — 체크인, 활동 기록, 체크아웃
/sitter/earnings        수입 — 정산 내역, 월별
/sitter/reviews         내 리뷰 — 부모 공개 리뷰 + 통계
```

### Partner Console (로그인 필요)
```
/partner                파트너 홈 — 예약 현황 요약
/partner/qr             QR코드 발급 — 투숙객 안내용
/partner/bookings       예약 현황 — 내 채널 경유 예약 목록
/partner/reports        종료 리포트 열람
```

### Info Pages
```
/about                  회사 소개
/careers                채용
/press                  보도자료 / 로드맵
/help                   도움말 / FAQ
/privacy                개인정보처리방침
/terms                  이용약관
```

### Admin (비공개, 내부용)
```
/admin/*                시터 검증, 분쟁 처리, 정산 — 런칭 제품에서 비노출
```

---

## 2. V1 코드 재사용 계획

### ✅ 그대로 재사용
| 항목 | 파일/경로 | 이유 |
|------|----------|------|
| React + TS + Vite 빌드 | vite.config.ts, tsconfig.* | 기술 스택 동일 |
| Firebase 설정 | src/services/firebase.ts | Auth, Firestore, Storage, Hosting 그대로 |
| i18n 구조 | src/i18n.ts, react-i18next 설정 | 4개국어 구조 유지 (카피는 전면 재작성) |
| 공통 컴포넌트 일부 | Button, Input, Modal, Card, Badge, Spinner, Skeleton | 디자인 토큰은 수정하되 구조 재사용 |
| CSS 변수/디자인 토큰 | src/index.css (color/font/radius 변수) | Quiet Luxury 톤 유지 + 핑크 추가 |
| 빌드/배포 | firebase.json, package.json, CI | 파이프라인 유지 |
| Auth 구조 | AuthContext.tsx (부분) | 로그인/가입 로직 재사용, 역할 재정의 |

### 🔄 수정 후 재사용
| 항목 | 변경 내용 |
|------|----------|
| AuthContext | 역할: parent → parent, sitter → sitter, hotel_staff → partner. admin 제거 |
| i18n locale 파일 | ko.json, en.json, ja.json, zh.json — 카피 100% 재작성 |
| CSS | index.css에 핑크 토끼 브랜드 색상 추가. 다크모드 변수 완전 제거 |
| BrandLogo | 핑크 토끼 SVG로 교체 |
| index.html | OG 태그, favicon, manifest — V2 제품 정의로 교체 |

### 🆕 새로 만들기
| 화면 | 설명 |
|------|------|
| 시터 검색 (/search) | 필터 + 시터 카드 목록. 핵심 신규 화면 |
| 시터 프로필 (/sitters/:id) | 사진, 영상, 배지, 리뷰, 가격, 가용시간. 매칭 플랫폼의 핵심 |
| 예약 폼 (/book/:sitterId) | 아이 정보, 스케줄, 동의, 특별 요청 |
| 결제 (/checkout/:bookingId) | 해외카드 결제, 에스크로 |
| 예약 확정/상태 (/booking/:id) | 예약 확인, 세션 진행, 종료 리포트 |
| 리뷰 (/review/:bookingId) | Verified Review 작성 |
| 시터 대시보드 전체 (/sitter/*) | 프로필 편집, 가격, 가용시간, 요청함, 진행 세션, 수입, 리뷰 |
| 파트너 콘솔 (/partner/*) | QR 발급, 예약 현황, 리포트 |
| 랜딩 페이지 | V2 제품 정의에 맞게 완전 재작성 |

### ❌ 제거 (라우트에서 빼기, 코드는 legacy 보존)
| V1 화면 | 이유 |
|---------|------|
| /hotel/* | V1 호텔 운영 대시보드 → /partner/*로 대체 |
| /parent/* | V1 부모 앱 → public 예약 플로우(/search → /book → /checkout)로 대체 |
| /ops/* | 내부 백오피스 → /admin/*으로 비공개 이관 |
| /guest/* | V1 토큰 기반 게스트 → public 예약 플로우로 흡수 |

---

## 3. 데이터 모델 핵심 변경

### V1 → V2

| V1 | V2 |
|----|-----|
| Hotel이 booking 생성 | Parent이 booking 생성 |
| Platform이 sitter 배정 | Sitter가 request 수락/거절 |
| 고정 가격 (Gold/Silver tier) | Sitter 자율 가격 + 권장 밴드 |
| 리뷰 없음 | Verified Review (부모→시터 공개 + 시터→부모 내부) |
| Hotel = operator | Partner = referral channel |

### 새 핵심 컬렉션 (Firestore)

```
users/          - role: parent | sitter | partner | admin
sitters/        - profile, pricing, availability, badges, stats
bookings/       - parentId, sitterId, status, payment, review
reviews/        - bookingId, parentId, sitterId, rating, text, verified
sessions/       - bookingId, checkin, checkout, report, activityLog
partners/       - hotelId, qrCode, referralStats
```

---

## 4. 브랜치 전략

```bash
# V1 동결
git tag v1-freeze-2026-03-12
git push origin v1-freeze-2026-03-12

# V2 브랜치 생성
git checkout -b v2/marketplace main

# 작업은 v2/marketplace에서만
# main은 V1 보존
# V2 안정화 후 main에 머지
```

---

## 5. 개발 순서 (추천)

### Phase 0: 기반 (1일)
- [ ] V2 브랜치 생성, V1 태그
- [ ] CLAUDE.md, MASTER_BRIEF_V2.md 프로젝트에 배치
- [ ] 브랜드 교체 (핑크 토끼 로고, favicon, OG 태그)
- [ ] Auth 역할 재정의 (parent/sitter/partner)
- [ ] V1 라우트 정리 (제거할 것 빼기, 새 라우트 스켈레톤)

### Phase 1: 핵심 퍼널 (3~4일)
- [ ] 랜딩 페이지 재작성
- [ ] 시터 검색 화면 (/search)
- [ ] 시터 프로필 화면 (/sitters/:id)
- [ ] 예약 폼 (/book/:sitterId)
- [ ] 결제 화면 (/checkout) — 데모 모드
- [ ] 예약 확정/상태 (/booking/:id)
- [ ] 리뷰 화면 (/review/:bookingId)

### Phase 2: 시터 대시보드 (2~3일)
- [ ] 시터 프로필 편집
- [ ] 가격/가용시간 설정
- [ ] 예약 요청 수락/거절
- [ ] 진행 중 세션 (체크인, 활동 기록, 체크아웃)
- [ ] 수입 대시보드
- [ ] 내 리뷰 보기

### Phase 3: 파트너 & 인포 (1~2일)
- [ ] 파트너 콘솔 (QR, 예약 현황, 리포트)
- [ ] 회사 소개, 채용, 도움말, 약관, 개인정보 — 카피 V2로 재작성
- [ ] 보도자료 → 로드맵 표현

### Phase 4: 다국어 & 마무리 (1~2일)
- [ ] ko/en/ja/zh 카피 전면 재작성
- [ ] 모바일 최적화
- [ ] README + GitHub description 업데이트
- [ ] 최종 빌드/배포

---

## 6. 데모 모드

V2에서도 데모 모드 유지. Firebase 없이도 작동하도록.

### 데모 데이터
- 시터 프로필 5~8명 (다양한 언어, 가격, 배지)
- 예약 3~5건 (다양한 상태)
- 리뷰 10~15개
- 파트너 1~2곳

### 데모 계정
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| Parent | parent@demo.com | demo1234 |
| Sitter | sitter@demo.com | demo1234 |
| Partner | partner@demo.com | demo1234 |
