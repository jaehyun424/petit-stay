# S10: 다크모드 전면 검증 + 완성

> 범위: 다크모드가 이미 부분 구현됨 (ThemeContext + [data-theme="dark"] 34개 규칙). 이것을 전체 앱에서 완벽하게 동작하도록 완성.

너는 Petit Stay의 시니어 CSS 엔지니어다.

## 현재 상태
- `src/contexts/ThemeContext.tsx` 존재: light/dark 토글, localStorage 저장, 기본값 dark
- `src/index.css`에 `[data-theme="dark"]` 규칙 34개 이미 있음
- 그러나 **페이지별 CSS 파일** (src/styles/pages/*.css)에는 다크모드 대응 없을 수 있음

## 규칙
- 기존 light 테마를 깨뜨리지 마라
- 다크모드 색상: `--charcoal-900`을 배경으로, `--cream-100`을 텍스트로 반전
- gold 악센트는 양쪽 모드에서 동일
- 완료 시 `npm run build` 에러 제로

## 작업 1: index.css 다크모드 변수 확인/보강

`[data-theme="dark"]`에 아래 변수들이 정의되어 있는지 확인:
```css
:root[data-theme="dark"] {
  --bg-primary: var(--charcoal-900);
  --bg-secondary: #252525;
  --bg-card: #2A2A2A;
  --text-primary: var(--cream-100);
  --text-secondary: #B0B0B0;
  --border-color: #3A3A3A;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
}
```

## 작업 2: 페이지별 CSS 다크모드 대응

아래 CSS 파일들을 모두 열어서, `background: white`, `color: #333`, `border-color: #eee` 같은 하드코딩 색상 → CSS 변수로 교체:

- src/styles/pages/hotel-dashboard.css
- src/styles/pages/hotel-bookings.css
- src/styles/pages/hotel-live-monitor.css
- src/styles/pages/hotel-reports.css
- src/styles/pages/hotel-safety.css
- src/styles/pages/hotel-settings.css
- src/styles/pages/hotel-sitter-mgmt.css
- src/styles/pages/hotel-scan-checkin.css
- src/styles/pages/ops-dashboard.css
- src/styles/pages/parent-*.css (6개)
- src/styles/pages/sitter-*.css (4개)
- src/styles/pages/landing.css
- src/styles/pages/solutions.css
- src/styles/pages/login.css, register.css
- src/styles/pages/guest.css
- src/styles/pages/info.css

패턴:
```css
/* 하드코딩 → 변수로 */
background: white;          → background: var(--bg-card, white);
color: #333;                → color: var(--text-primary, #333);
border-color: #eee;         → border-color: var(--border-color, #eee);
box-shadow: 0 1px 3px ...;  → box-shadow: var(--shadow-sm);
```

## 작업 3: 다크모드 토글 접근성

Parent Profile과 Sitter Profile에 다크모드 토글이 있는지 확인. 없으면 추가.
토글 레이블: `t('settings.darkMode')`

## 작업 4: 특수 케이스

- 비디오 오버레이: 다크모드에서 더 어둡게 안 해도 됨 (이미 어두움)
- 차트/그래프: 바 색상이 다크 배경에서 보이는지 확인
- 이미지: 다크모드에서 brightness 조정 불필요 (자연스럽게)
- gold 색상: 양 모드 동일 유지

## 완료: `git add -A && git commit -m "feat: dark mode — full app coverage, CSS variable migration"`
