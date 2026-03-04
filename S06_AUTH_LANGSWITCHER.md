# S06: Auth 페이지 + LanguageSwitcher 전면 정비

> 범위: Login, Register, ForgotPassword, LanguageSwitcher, Layout 중복 제거.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 유지, `t('key')`, 4개 언어
- 완료 시 `npm run build` 에러 제로

## 1. RegisterPage 비디오 교체 (중요!)
현재 CTA와 동일한 비디오(3209211). 다른 걸로 교체:
`https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_30fps.mp4`
→ RegisterPage의 REGISTER_VIDEO 상수 변경

## 2. Register/Login 레이아웃 통일
- 비디오 배경/오버레이 구조 동일
- 폼 카드 너비/패딩/radius 동일
- LanguageSwitcher: 둘 다 우측 상단 absolute
- Footer: `© 2026 Petit Stay Inc.` (도시 목록 삭제)

## 3. LanguageSwitcher Portal 수정
드롭다운이 overflow:hidden에 가려지는 문제 → createPortal 사용:
```tsx
import { createPortal } from 'react-dom';
const buttonRef = useRef<HTMLButtonElement>(null);
// 클릭 시 getBoundingClientRect()로 위치 계산
// {isOpen && createPortal(<div style={{ position:'fixed', top, left, zIndex:9999 }}>...</div>, document.body)}
```

## 4. LanguageSwitcher 중복 제거
ParentLayout, SitterLayout에서 LanguageSwitcher가 2곳 → 1곳만:
- Desktop: 사이드바 안에 1개
- Mobile: 햄버거 메뉴 안에 1개
- 바텀 내비 근처 별도 X

## 완료: `git add -A && git commit -m "fix: auth unification, language switcher portal + dedup"`
