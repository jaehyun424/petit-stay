# S11: recharts 차트 + PDF 리포트 다운로드

> 범위: Hotel Reports, Ops Reports, Sitter Earnings의 CSS 바 차트 → recharts로 교체 + PDF 리포트 생성.

너는 Petit Stay의 시니어 풀스택 엔지니어다.

## 규칙
- Quiet Luxury 색상 유지 (gold, charcoal, cream)
- recharts는 프로젝트에 아직 없음 → `npm install recharts` 실행
- jspdf는 이미 있음 (package.json 확인)
- 완료 시 `npm run build` 에러 제로

## 작업 1: recharts 설치

```bash
npm install recharts
```

## 작업 2: Hotel Reports.tsx (~414줄) — 차트 교체

현재 CSS 기반 바 차트 (`.rpt-bar-chart`) → recharts BarChart로 교체:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// 매출 차트
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
    <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `₩${(v/10000).toFixed(0)}만`} />
    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
    <Bar dataKey="revenue" fill="var(--gold-500)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

추가 차트:
- 예약 건수 LineChart (같은 기간)
- 시터별 성과 수평 BarChart

## 작업 3: Ops Reports.tsx (~93줄) — 차트 추가

현재 테이블만 있음 → recharts 추가:
- 호텔별 매출 PieChart (gold 색상 계열 5가지 shade)
- 월별 트렌드 AreaChart
- SLA 달성률 RadialBarChart 또는 게이지

```tsx
import { PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
const GOLD_COLORS = ['#D3B167', '#C5A059', '#B08F4A', '#9E8047', '#8B7235'];
```

## 작업 4: Sitter Earnings.tsx (~219줄) — 차트 개선

현재 CSS 바 차트 → recharts:
- 월별 수입 BarChart (현재 월 = gold, 나머지 = charcoal-300)
- 호텔별 수입 분포 PieChart

## 작업 5: PDF 리포트 다운로드

Hotel Reports에 "PDF 다운로드" 기능 (jspdf 이미 있음):

```tsx
import jsPDF from 'jspdf';

const downloadPDF = () => {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Petit Stay — Monthly Report', 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${selectedPeriod}`, 20, 35);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, 45);
  doc.text(`Total Bookings: ${totalBookings}`, 20, 55);
  // 시터 성과 테이블
  let y = 75;
  doc.text('Sitter Performance', 20, y);
  y += 10;
  sitterData.forEach(s => {
    doc.text(`${s.name}: ${s.sessions} sessions, Rating ${s.rating}`, 25, y);
    y += 8;
  });
  doc.save(`petit-stay-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
```

Reports 헤더의 "Export" 버튼에 이 기능 연결.
Ops Reports에도 동일한 PDF 다운로드 추가.

## 완료: `git add -A && git commit -m "feat: recharts integration + PDF report download"`
