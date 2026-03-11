import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PartnerV2Layout } from '../../../components/layout/PartnerV2Layout';

interface DemoReport {
  id: string;
  date: string;
  dateKo: string;
  sitter: string;
  time: string;
  summary: string;
  summaryKo: string;
  rating: number;
  review: string;
  reviewKo: string;
}

const DEMO_REPORTS: DemoReport[] = [
  {
    id: 'R-001',
    date: 'Mar 10',
    dateKo: '3월 10일',
    sitter: 'Alice Kim',
    time: '18:00–22:00',
    summary: 'Block play, drawing, and bedtime routine with Emma (5y). Session ended safely with no issues.',
    summaryKo: 'Emma(5세)와 블록 놀이, 그림 그리기, 수면 루틴 진행. 특이사항 없이 안전하게 종료.',
    rating: 5,
    review: 'Alice was incredibly attentive and Emma fell asleep so peacefully.',
    reviewKo: '앨리스 선생님이 정말 세심하게 돌봐주셔서 엠마가 편안하게 잠들었어요.',
  },
  {
    id: 'R-002',
    date: 'Mar 9',
    dateKo: '3월 9일',
    sitter: 'Yuna Park',
    time: '19:00–23:00',
    summary: 'Craft activities and board games with Leo (7y) and Mia (4y). Both children were happy and engaged throughout.',
    summaryKo: 'Leo(7세), Mia(4세)와 만들기, 보드게임 진행. 두 아이 모두 세션 내내 즐겁게 참여.',
    rating: 5,
    review: 'Yuna was wonderful with both kids. Highly recommend!',
    reviewKo: '유나 선생님이 두 아이 모두 정말 잘 돌봐주셨어요. 강력 추천합니다!',
  },
  {
    id: 'R-003',
    date: 'Mar 8',
    dateKo: '3월 8일',
    sitter: 'Soyeon Lee',
    time: '18:00–21:00',
    summary: 'Puzzle play and reading with Hana (6y). Followed the provided bedtime routine carefully.',
    summaryKo: 'Hana(6세)와 퍼즐 놀이, 동화책 읽기 진행. 부모가 안내한 수면 루틴을 세심하게 따름.',
    rating: 4,
    review: 'Good care overall. Hana liked Soyeon a lot.',
    reviewKo: '전반적으로 좋은 돌봄이었어요. 하나가 소연 선생님을 많이 좋아했어요.',
  },
  {
    id: 'R-004',
    date: 'Mar 6',
    dateKo: '3월 6일',
    sitter: 'Alice Kim',
    time: '18:00–22:00',
    summary: 'Play-dough, coloring, and snack time with Tom (4y). Gentle bedtime routine followed. No issues.',
    summaryKo: 'Tom(4세)과 점토 놀이, 색칠, 간식 시간 진행. 부드러운 수면 루틴 후 안전하게 종료.',
    rating: 5,
    review: 'Our second time with Alice. She is amazing with young children.',
    reviewKo: '앨리스 선생님과 두 번째였는데, 어린아이를 정말 잘 돌봐주세요.',
  },
];

export default function PartnerReports() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <PartnerV2Layout
      title="Session Reports"
      titleKo="종료 리포트"
      subtitle="Completed session records"
      subtitleKo="완료된 세션 기록"
      showBack
    >
      {DEMO_REPORTS.map((report, i) => (
        <motion.div
          key={report.id}
          className="pt-report-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="pt-report-header">
            <div>
              <span className="pt-report-title">
                {isKo ? report.dateKo : report.date} · {report.sitter}
              </span>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--charcoal-400)', marginTop: '0.125rem' }}>
                {report.time}
              </div>
            </div>
            <span className="pt-status pt-status--completed">
              {isKo ? '완료' : 'Completed'}
            </span>
          </div>
          <p className="pt-report-summary">
            {isKo ? report.summaryKo : report.summary}
          </p>
          <div className="pt-report-review">
            <div className="pt-report-stars">{'★'.repeat(report.rating)}{'☆'.repeat(5 - report.rating)}</div>
            <p className="pt-report-review-text">
              "{isKo ? report.reviewKo : report.review}"
            </p>
          </div>
        </motion.div>
      ))}
    </PartnerV2Layout>
  );
}
