#!/bin/bash
# ============================================
# Petit Stay — 14-Session 자동 실행 (S02~S15)
# Session 1은 이미 Claude Code에서 수동 완료
#
# 사용법:
#   1. 이 파일 + S02~S15.md를 ~/petit-stay/ 안에 넣기
#   2. chmod +x run_sessions.sh
#   3. tmux new -s petit
#   4. ./run_sessions.sh
#   5. Ctrl+B, D (분리 → 자러 가기)
#   6. tmux attach -t petit (아침에 확인)
# ============================================

set -e

# ★ 네 프로젝트 경로로 수정 ★
PROJECT_DIR="$HOME/petit-stay"

PROMPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$PROMPTS_DIR/logs"
mkdir -p "$LOG_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SESSIONS=(
  "S02_PARENT_HOME_BOOKING.md"
  "S03_PARENT_REMAINING.md"
  "S04_SITTER_ALL.md"
  "S05_GUEST_PAGE.md"
  "S06_AUTH_LANGSWITCHER.md"
  "S07_DEMO_DATA.md"
  "S08_INFO_CONTENT.md"
  "S09_LANDING_POLISH.md"
  "S10_DARK_MODE.md"
  "S11_RECHARTS_PDF.md"
  "S12_NOTIFICATION_SEARCH.md"
  "S13_ONBOARDING_ERROR.md"
  "S14_RESPONSIVE_ALL.md"
  "S15_ANIMATION_I18N_PERF.md"
)

TOTAL=${#SESSIONS[@]}

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Petit Stay — 자동 프로덕션 업그레이드             ║${NC}"
echo -e "${CYAN}║  Session 2~15 (${TOTAL}개) 순차 실행                    ║${NC}"
echo -e "${CYAN}║                                                   ║${NC}"
echo -e "${CYAN}║  S02-05: 4개 모듈 UI/UX (Parent+Sitter+Guest)    ║${NC}"
echo -e "${CYAN}║  S06-07: Auth + 데모데이터                        ║${NC}"
echo -e "${CYAN}║  S08-09: Info 콘텐츠 + Landing                    ║${NC}"
echo -e "${CYAN}║  S10:    다크모드 완성                             ║${NC}"
echo -e "${CYAN}║  S11:    recharts + PDF 리포트                    ║${NC}"
echo -e "${CYAN}║  S12:    알림센터 + 검색필터                      ║${NC}"
echo -e "${CYAN}║  S13:    온보딩 가이드 + 에러 바운더리            ║${NC}"
echo -e "${CYAN}║  S14:    반응형 전면 점검                          ║${NC}"
echo -e "${CYAN}║  S15:    애니메이션 + i18n + SEO + README         ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# 사전 확인
if ! command -v claude &> /dev/null; then
  echo -e "${RED}[ERROR] claude CLI 미설치${NC}"
  echo "  npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}[ERROR] $PROJECT_DIR 없음${NC}"
  echo "  스크립트 상단의 PROJECT_DIR를 수정하세요"
  exit 1
fi

cd "$PROJECT_DIR"

# 초기 빌드
echo -e "${YELLOW}[PRE] 초기 빌드 확인...${NC}"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}[OK] 빌드 성공${NC}"
else
  echo -e "${RED}[FAIL] 초기 빌드 실패 — 먼저 수정 필요${NC}"
  exit 1
fi
echo ""

START_TIME=$(date +%s)
FAILED=0
COMPLETED=0

for i in "${!SESSIONS[@]}"; do
  SF="${SESSIONS[$i]}"
  SN=$((i + 1))
  NAME="${SF%.md}"
  LOG="$LOG_DIR/${NAME}.log"

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  [${SN}/${TOTAL}] ${NAME}${NC}"
  echo -e "${CYAN}  시작: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  if [ ! -f "$PROMPTS_DIR/$SF" ]; then
    echo -e "${RED}[SKIP] $SF 없음${NC}"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Claude Code 실행
  SESSION_START=$(date +%s)
  echo -e "${YELLOW}[RUN] Claude Code...${NC}"

  if claude \
    --dangerously-skip-permissions \
    --max-turns 80 \
    --output-format text \
    -p "$(cat "$PROMPTS_DIR/$SF")" \
    > "$LOG" 2>&1; then
    echo -e "${GREEN}[OK] 실행 완료${NC}"
  else
    echo -e "${YELLOW}[WARN] 비정상 종료${NC}"
  fi

  SESSION_END=$(date +%s)
  ELAPSED=$(( (SESSION_END - SESSION_START) / 60 ))
  echo -e "${CYAN}  소요: ${ELAPSED}분${NC}"

  # 빌드 체크
  echo -e "${YELLOW}[BUILD] 확인...${NC}"
  if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] 빌드 성공 ✓${NC}"
  else
    echo -e "${RED}[FAIL] 빌드 실패 → 자동 수정 시도${NC}"
    BERR=$(npm run build 2>&1 | tail -40)
    claude --dangerously-skip-permissions --max-turns 15 \
      -p "npm run build 에러다. 아래 에러만 수정하라. 다른 것은 절대 건드리지 마라.
${BERR}" > "$LOG_DIR/${NAME}_fix.log" 2>&1

    if npm run build > /dev/null 2>&1; then
      echo -e "${GREEN}[FIXED] 자동 수정 성공 ✓${NC}"
    else
      echo -e "${RED}[FATAL] 수정 실패${NC}"
      FAILED=$((FAILED + 1))
    fi
  fi

  # git commit
  if [ -d .git ]; then
    git add -A 2>/dev/null
    git commit -m "feat(s$((i+2))): ${NAME}" --no-verify 2>/dev/null || true
  fi

  COMPLETED=$((COMPLETED + 1))
  echo -e "${GREEN}  ✓ [${COMPLETED}/${TOTAL}] 완료${NC}"
  echo ""
done

END_TIME=$(date +%s)
TOTAL_MIN=$(( (END_TIME - START_TIME) / 60 ))

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  전체 완료                                        ║${NC}"
echo -e "${CYAN}║  성공: ${COMPLETED}/${TOTAL}  실패: ${FAILED}  총 소요: ${TOTAL_MIN}분          ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  로그: $LOG_DIR/"
echo "  다음: npm run dev → 브라우저 확인"
echo "        firebase deploy → 배포"
