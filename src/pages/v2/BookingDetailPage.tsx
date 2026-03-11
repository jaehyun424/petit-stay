import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Play, Flag } from 'lucide-react';
import { sitterProfiles } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { BookingTimeline } from './booking-detail/BookingTimeline';
import { SessionReport } from './booking-detail/SessionReport';
import { BookingActions } from './booking-detail/BookingActions';
import '../../styles/pages/v2-booking-detail.css';

type BookingStatus = 'confirmed' | 'in-progress' | 'completed';

interface BookingState {
  status?: string;
  sitterId?: string;
  schedule?: { date: string; startTime: string; endTime: string; location: string };
  children?: { name: string; age: string }[];
}

// Demo session report data
const demoReport = {
  activities: 'Drawing, block play, snack time, storybook reading',
  activitiesKo: '그림 그리기, 블록 놀이, 간식 시간, 동화 읽기',
  sleepNote: 'Fell asleep at 21:00, slept well',
  sleepNoteKo: '21시에 잘 잤어요. 편안하게 수면했습니다',
  healthNote: 'No issues. Ate snack well.',
  healthNoteKo: '특이사항 없어요. 간식도 잘 먹었습니다',
  checkInTime: '18:05',
  checkOutTime: '22:00',
};

export default function BookingDetailPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const state = location.state as BookingState | null;

  // Demo: allow switching between states for demonstration
  const [demoStatus, setDemoStatus] = useState<BookingStatus>(
    (state?.status as BookingStatus) || 'confirmed'
  );

  const sitterId = state?.sitterId || 'sitter-001';
  const sitter = sitterProfiles[sitterId];

  // Default demo schedule/children if not passed via state
  const schedule = state?.schedule || {
    date: '2026-03-15',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Grand Hyatt Seoul, Room 1204',
  };
  const children = state?.children || [{ name: 'Emma', age: '5' }];

  if (!sitter) {
    return (
      <div className="bd-page">
        <div className="bd-not-found">
          <h2>{isKo ? '예약 정보를 찾을 수 없습니다' : 'Booking not found'}</h2>
          <Link to="/search" className="bd-back-link">
            {isKo ? '시터 검색으로 돌아가기' : 'Back to search'}
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig: Record<BookingStatus, { icon: typeof CheckCircle2; label: string; labelKo: string; color: string; message: string; messageKo: string }> = {
    confirmed: {
      icon: CheckCircle2,
      label: 'Confirmed',
      labelKo: '예약 확정',
      color: 'var(--gold-500)',
      message: 'Your sitter has accepted the booking',
      messageKo: '시터가 예약을 수락했어요',
    },
    'in-progress': {
      icon: Play,
      label: 'In Progress',
      labelKo: '돌봄 진행 중',
      color: 'var(--success-500)',
      message: 'Care session is in progress',
      messageKo: '돌봄이 진행 중이에요',
    },
    completed: {
      icon: Flag,
      label: 'Completed',
      labelKo: '돌봄 완료',
      color: 'var(--charcoal-900)',
      message: 'Session completed! How was it?',
      messageKo: '돌봄이 잘 끝났어요! 어떠셨나요?',
    },
  };

  const current = statusConfig[demoStatus];
  const StatusIcon = current.icon;

  return (
    <div className="bd-page">
      {/* Nav */}
      <nav className="bd-nav">
        <div className="bd-nav-inner">
          <div className="bd-nav-left">
            <button className="bd-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="bd-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="bd-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bd-header">
        <h1 className="bd-title">
          {isKo ? '예약 상세' : 'Booking Details'}
        </h1>
        <p className="bd-booking-id">#{bookingId || 'PS-2026-0315'}</p>
      </div>

      {/* Content */}
      <div className="bd-content">
        {/* Demo status switcher */}
        <div className="bd-demo-switcher">
          <span className="bd-demo-label">Demo:</span>
          {(['confirmed', 'in-progress', 'completed'] as BookingStatus[]).map((s) => (
            <button
              key={s}
              className={`bd-demo-btn ${demoStatus === s ? 'active' : ''}`}
              onClick={() => setDemoStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status badge */}
        <div className="bd-status-card" style={{ borderLeftColor: current.color }}>
          <div className="bd-status-icon" style={{ color: current.color }}>
            <StatusIcon size={24} />
          </div>
          <div className="bd-status-text">
            <span className="bd-status-label" style={{ color: current.color }}>
              {isKo ? current.labelKo : current.label}
            </span>
            <span className="bd-status-message">
              {isKo ? current.messageKo : current.message}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bd-section">
          <BookingTimeline
            status={demoStatus}
            checkInTime={demoStatus !== 'confirmed' ? demoReport.checkInTime : undefined}
            checkOutTime={demoStatus === 'completed' ? demoReport.checkOutTime : undefined}
          />
        </div>

        {/* Sitter info */}
        <div className="bd-section">
          <h3 className="bd-section-title">{isKo ? '시터 정보' : 'Your Sitter'}</h3>
          <div className="bd-sitter-card">
            <img src={sitter.photo} alt={sitter.name} className="bd-sitter-photo" />
            <div className="bd-sitter-info">
              <p className="bd-sitter-name">{isKo ? sitter.nameKo : sitter.name}</p>
              <p className="bd-sitter-langs">{sitter.languages.join(' · ')}</p>
              <p className="bd-sitter-rate">₩{sitter.hourlyRate.toLocaleString()}/hr</p>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bd-section">
          <h3 className="bd-section-title">{isKo ? '예약 정보' : 'Booking Info'}</h3>
          <div className="bd-details">
            <div className="bd-row">
              <span className="bd-label">{isKo ? '날짜' : 'Date'}</span>
              <span className="bd-value">{schedule.date}</span>
            </div>
            <div className="bd-row">
              <span className="bd-label">{isKo ? '시간' : 'Time'}</span>
              <span className="bd-value">{schedule.startTime} – {schedule.endTime}</span>
            </div>
            <div className="bd-row">
              <span className="bd-label">{isKo ? '장소' : 'Location'}</span>
              <span className="bd-value">{schedule.location}</span>
            </div>
            <div className="bd-row">
              <span className="bd-label">{isKo ? '아이' : 'Children'}</span>
              <span className="bd-value">
                {children.map((c) => `${c.name} (${c.age}${isKo ? '세' : 'y'})`).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Check-in time for in-progress */}
        {demoStatus === 'in-progress' && (
          <div className="bd-section bd-checkin-notice">
            <div className="bd-checkin-dot" />
            <div>
              <p className="bd-checkin-title">
                {isKo ? '체크인 완료' : 'Checked In'}
              </p>
              <p className="bd-checkin-time">{demoReport.checkInTime}</p>
            </div>
          </div>
        )}

        {/* Session report for completed */}
        {demoStatus === 'completed' && (
          <div className="bd-section">
            <SessionReport {...demoReport} />
          </div>
        )}

        {/* Actions */}
        <BookingActions
          status={demoStatus}
          bookingId={bookingId || 'PS-2026-0315'}
          sitterPhone="+82-10-1234-5678"
        />
      </div>
    </div>
  );
}
