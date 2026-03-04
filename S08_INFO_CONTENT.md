# S08: Info 페이지 전면 콘텐츠 재작성 — About(사실 기반) + Careers + Press + Privacy + Terms + Help

> 범위: 6개 Info 페이지 콘텐츠를 전문적·사실 기반으로 재작성. 4개 언어 전부.

너는 Petit Stay의 시니어 풀스택 엔지니어 겸 콘텐츠 라이터다.

## 규칙
- InfoLayout 구조 유지, i18n JSON에서 관리, 4개 언어
- 법률: 한국법 준거 (싱가포르 아님), 서울중앙지방법원 관할
- 완료 시 `npm run build` 에러 제로

## 1. AboutPage — 팀 소개 사실로 교체 (매우 중요!)

현재 `info.about.teamDesc`가 허구: "Founded by a team of hospitality operators, early childhood education specialists..."
**이것은 1인 창업이다.** 4개 언어 전부 교체:

EN: "Founded in 2025 by an entrepreneur with hands-on experience in franchise operations, hospitality management, and software development. With a background spanning restaurant business growth, Java/Spring Boot engineering, and frontend development (React, TypeScript, Firebase), the founder brings operational expertise and technical capability to solve real problems in the hospitality industry."

KO: "2025년, 프랜차이즈 운영·외식업 경영·소프트웨어 개발 경험을 두루 갖춘 창업자가 설립했습니다. 외식업 매출 성장, Java/Spring Boot 엔지니어링 교육, 프론트엔드 개발(React, TypeScript, Firebase) 경력을 바탕으로, 호스피탈리티 산업의 실질적인 문제를 기술로 해결합니다."

JA/ZH도 동일 내용으로 자연스럽게 번역.

whereDesc: "현재 서울 거점, 도쿄 확장 준비 중. 양 도시 5성급 호텔 타깃."
missionDesc: B2B2C 모델 설명 — 호텔이 1차 접점, 플랫폼이 매칭·운영·정산·보험.

## 2. CareersPage — 4개 포지션 보강
1. Senior Frontend Engineer (Remote) — React/TS/Firebase
2. Hotel Partnerships Manager — Seoul — 호텔 네트워크 구축
3. Childcare Specialist Onboarding Lead — Seoul — 시터 모집/교육/검증
4. Product Designer (Remote) — 신뢰 중심 UX
+ 복리후생, 지원방법 (careers@petitstay.com)

## 3. PressPage — 한국 시장 중심 보도자료 2개
- "2026년 서울 프리미엄 호텔 파일럿 시작" (2026-03-01)
- "창업지원 프로그램 선정 — 호텔 차일드케어 혁신" (2026-02-15)

## 4. PrivacyPage — PIPA 준수
수집정보, 사용목적, 공유대상, 보안(AES-256, TLS 1.3), 보존기간(아동 데이터 90일 자동삭제), 이용자 권리(개인정보보호법 35~38조), 문의

## 5. TermsPage — 한국법
예약/취소(2시간 전 무료, 이후 50%), 결제(전액선결제, 7일 환불), 안전(검증 수행, 절대보장 아님), 보험, 책임제한, 분쟁해결(**대한민국 법률, 서울중앙지방법원**)

## 6. HelpCenterPage — FAQ 10개 구체적 답변
서비스 이용법, 시터 검증, 대상 연령(3~8세), 보험, 취소, 지원언어, 비용(₩60,000/h), 매칭, 응급, 호텔 제한

## 완료: `git add -A && git commit -m "feat: info pages — factual content, Korean law, comprehensive FAQ"`
