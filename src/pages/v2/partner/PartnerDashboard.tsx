import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QrCode, CalendarDays, FileText, ChevronRight, Lightbulb } from 'lucide-react';
import { PartnerV2Layout } from '../../../components/layout/PartnerV2Layout';

export default function PartnerDashboard() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <PartnerV2Layout
      title="Grand Hyatt Seoul"
      titleKo="그랜드 하얏트 서울"
      subtitle="Partner Console"
      subtitleKo="파트너 콘솔"
    >
      {/* Summary stats */}
      <div className="pt-stats-row">
        <div className="pt-stat-box">
          <span className="pt-stat-value accent">12</span>
          <span className="pt-stat-label">{isKo ? '이번 달 예약' : 'This month'}</span>
        </div>
        <div className="pt-stat-box">
          <span className="pt-stat-value">3</span>
          <span className="pt-stat-label">{isKo ? '활성 예약' : 'Active'}</span>
        </div>
        <div className="pt-stat-box">
          <span className="pt-stat-value">8</span>
          <span className="pt-stat-label">{isKo ? '완료 세션' : 'Completed'}</span>
        </div>
      </div>

      {/* Recent completed report preview */}
      <div className="pt-card">
        <h3 className="pt-card-title">{isKo ? '최근 종료 리포트' : 'Recent Report'}</h3>
        <div className="pt-report-card" style={{ border: 'none', padding: 0 }}>
          <div className="pt-report-header">
            <span className="pt-report-title">
              {isKo ? '3월 10일 · Alice Kim' : 'Mar 10 · Alice Kim'}
            </span>
            <span className="pt-status pt-status--completed">
              {isKo ? '완료' : 'Completed'}
            </span>
          </div>
          <p className="pt-report-summary">
            {isKo
              ? 'Emma(5세)와 함께 블록 놀이, 그림 그리기, 수면 루틴 진행. 특이사항 없이 안전하게 종료.'
              : 'Block play, drawing, and bedtime routine with Emma (5y). Session ended safely with no issues.'}
          </p>
          <div className="pt-report-review">
            <div className="pt-report-stars">★★★★★</div>
            <p className="pt-report-review-text">
              {isKo
                ? '"앨리스 선생님이 정말 세심하게 돌봐주셨어요. 다음에도 꼭 부탁하고 싶습니다."'
                : '"Alice was incredibly attentive. We\'d love to book her again next time."'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="pt-card">
        <h3 className="pt-card-title">{isKo ? '바로가기' : 'Quick Links'}</h3>
        <div className="pt-quick-links">
          <Link to="/partner/qr" className="pt-quick-link">
            <div className="pt-quick-link-left">
              <div className="pt-quick-link-icon"><QrCode size={18} /></div>
              <div className="pt-quick-link-text">
                <span>{isKo ? 'QR 코드 발급' : 'Generate QR Code'}</span>
                <span>{isKo ? '객실·프런트 비치용' : 'For rooms & front desk'}</span>
              </div>
            </div>
            <ChevronRight size={18} className="pt-quick-link-arrow" />
          </Link>
          <Link to="/partner/bookings" className="pt-quick-link">
            <div className="pt-quick-link-left">
              <div className="pt-quick-link-icon"><CalendarDays size={18} /></div>
              <div className="pt-quick-link-text">
                <span>{isKo ? '예약 현황' : 'Booking Status'}</span>
                <span style={{ color: 'var(--partner-accent)', fontWeight: 600 }}>
                  {isKo ? '활성 예약 3건' : '3 active bookings'}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="pt-quick-link-arrow" />
          </Link>
          <Link to="/partner/reports" className="pt-quick-link">
            <div className="pt-quick-link-left">
              <div className="pt-quick-link-icon"><FileText size={18} /></div>
              <div className="pt-quick-link-text">
                <span>{isKo ? '종료 리포트' : 'Session Reports'}</span>
                <span>{isKo ? '완료된 세션 기록' : 'Completed session records'}</span>
              </div>
            </div>
            <ChevronRight size={18} className="pt-quick-link-arrow" />
          </Link>
        </div>
      </div>

      {/* Tip */}
      <div className="pt-tip">
        <Lightbulb size={16} />
        <span>
          {isKo
            ? 'QR 코드를 객실 안내서나 프런트 데스크에 비치하면 투숙객의 서비스 이용이 편리해집니다'
            : 'Place the QR code in room guides or at the front desk to help guests discover the service easily'}
        </span>
      </div>
    </PartnerV2Layout>
  );
}
