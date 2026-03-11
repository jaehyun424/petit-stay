import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Clock, Inbox, ChevronRight, Lightbulb } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';
import { sitterProfiles } from '../../../data/v2-demo-sitters';

const DEMO_SITTER = sitterProfiles['sitter-001'];

export default function SitterDashboard() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <SitterV2Layout
      title={`Hi, ${DEMO_SITTER.name.split(' ')[0]}`}
      titleKo={`안녕하세요, ${DEMO_SITTER.nameKo.slice(1)}님`}
      pendingRequests={2}
    >
      {/* Summary stats */}
      <div className="st-stats-row">
        <div className="st-stat-box">
          <span className="st-stat-value accent">2</span>
          <span className="st-stat-label">{isKo ? '대기 중 요청' : 'Pending'}</span>
        </div>
        <div className="st-stat-box">
          <span className="st-stat-value">1</span>
          <span className="st-stat-label">{isKo ? '오늘 세션' : 'Today'}</span>
        </div>
        <div className="st-stat-box">
          <span className="st-stat-value">₩480K</span>
          <span className="st-stat-label">{isKo ? '이번 달' : 'This month'}</span>
        </div>
      </div>

      {/* Next session */}
      <div className="st-card st-next-session">
        <div className="st-next-session-header">
          <h3 className="st-card-title" style={{ margin: 0 }}>
            {isKo ? '다음 세션' : 'Next Session'}
          </h3>
          <span className="st-next-session-badge">
            {isKo ? '오늘' : 'Today'}
          </span>
        </div>
        <div className="st-next-session-rows">
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '부모' : 'Parent'}</span>
            <span className="st-detail-value">Sarah Mitchell</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '시간' : 'Time'}</span>
            <span className="st-detail-value">18:00 – 22:00</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '아이' : 'Child'}</span>
            <span className="st-detail-value">Emma (5{isKo ? '세' : 'y'})</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '장소' : 'Location'}</span>
            <span className="st-detail-value">Grand Hyatt Seoul, 1204</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '예상 수입' : 'Est. earnings'}</span>
            <span className="st-detail-value" style={{ color: 'var(--sitter-accent-dark)', fontWeight: 700 }}>
              ₩140,000
            </span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '바로가기' : 'Quick Links'}</h3>
        <div className="st-quick-links">
          <Link to="/sitter/profile" className="st-quick-link">
            <div className="st-quick-link-left">
              <div className="st-quick-link-icon"><User size={18} /></div>
              <div className="st-quick-link-text">
                <span>{isKo ? '프로필 편집' : 'Edit Profile'}</span>
                <span>{isKo ? '사진, 소개, 자격증' : 'Photo, bio, credentials'}</span>
              </div>
            </div>
            <ChevronRight size={18} className="st-quick-link-arrow" />
          </Link>
          <Link to="/sitter/availability" className="st-quick-link">
            <div className="st-quick-link-left">
              <div className="st-quick-link-icon"><Clock size={18} /></div>
              <div className="st-quick-link-text">
                <span>{isKo ? '가용시간 설정' : 'Availability'}</span>
                <span>{isKo ? '이번 주 5일 등록됨' : '5 days set this week'}</span>
              </div>
            </div>
            <ChevronRight size={18} className="st-quick-link-arrow" />
          </Link>
          <Link to="/sitter/requests" className="st-quick-link">
            <div className="st-quick-link-left">
              <div className="st-quick-link-icon"><Inbox size={18} /></div>
              <div className="st-quick-link-text">
                <span>{isKo ? '예약 요청함' : 'Booking Requests'}</span>
                <span style={{ color: 'var(--sitter-accent-dark)', fontWeight: 600 }}>
                  {isKo ? '새로운 요청 2건' : '2 new requests'}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="st-quick-link-arrow" />
          </Link>
        </div>
      </div>

      {/* Tip */}
      <div className="st-tip">
        <Lightbulb size={16} />
        <span>
          {isKo
            ? '프로필을 완성하면 더 많은 요청을 받을 수 있어요'
            : 'Complete your profile to receive more booking requests'}
        </span>
      </div>
    </SitterV2Layout>
  );
}
