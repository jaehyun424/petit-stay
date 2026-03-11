import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, FileText, CheckCircle2 } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';

type SessionPhase = 'waiting' | 'checked-in' | 'completed';

export default function SitterActiveSession() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [phase, setPhase] = useState<SessionPhase>('waiting');
  const [activities, setActivities] = useState('');
  const [sleepNote, setSleepNote] = useState('');
  const [healthNote, setHealthNote] = useState('');

  const session = {
    parentName: 'Sarah Mitchell',
    date: '2026-03-12',
    time: '18:00 – 22:00',
    child: 'Emma (5y)',
    childKo: 'Emma (5세)',
    location: 'Grand Hyatt Seoul, Room 1204',
    earning: 140000,
  };

  const handleCheckIn = () => setPhase('checked-in');

  const handleCheckOut = () => {
    if (!activities.trim()) return;
    setPhase('completed');
  };

  return (
    <SitterV2Layout
      title="Active Session"
      titleKo="진행 중 세션"
      pendingRequests={2}
    >
      {/* Session info card */}
      <div className="st-card st-session-card">
        <div className="st-session-status">
          {phase === 'checked-in' && (
            <>
              <div className="st-session-live-dot" />
              <span className="st-session-live-text">
                {isKo ? '진행 중' : 'In Progress'}
              </span>
            </>
          )}
          {phase === 'waiting' && (
            <span className="st-next-session-badge">
              {isKo ? '오늘 18:00' : 'Today 18:00'}
            </span>
          )}
          {phase === 'completed' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--sitter-accent-dark)', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> {isKo ? '완료' : 'Completed'}
            </span>
          )}
        </div>

        <div className="st-next-session-rows">
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '부모' : 'Parent'}</span>
            <span className="st-detail-value">{session.parentName}</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '시간' : 'Time'}</span>
            <span className="st-detail-value">{session.time}</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '아이' : 'Child'}</span>
            <span className="st-detail-value">{isKo ? session.childKo : session.child}</span>
          </div>
          <div className="st-detail-row">
            <span className="st-detail-label">{isKo ? '장소' : 'Location'}</span>
            <span className="st-detail-value">{session.location}</span>
          </div>
        </div>
      </div>

      {/* Action: Check In */}
      {phase === 'waiting' && (
        <button className="st-session-btn checkin" onClick={handleCheckIn}>
          <LogIn size={20} />
          {isKo ? '도착 — 체크인' : 'Arrived — Check In'}
        </button>
      )}

      {/* Checked in: show report form + checkout */}
      {phase === 'checked-in' && (
        <>
          <div className="st-card">
            <h3 className="st-card-title">
              <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
              {isKo ? '세션 리포트' : 'Session Report'}
            </h3>

            <div className="st-form-group">
              <label className="st-form-label">{isKo ? '활동 내역' : 'Activities'}</label>
              <textarea
                className="st-report-textarea"
                placeholder={isKo
                  ? '어떤 활동을 했나요? (예: 블록 놀이, 그림 그리기, 간식)'
                  : 'What activities did you do? (e.g. block play, drawing, snack)'}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">{isKo ? '수면 상태' : 'Sleep Notes'}</label>
              <textarea
                className="st-report-textarea"
                placeholder={isKo
                  ? '수면 관련 내용 (선택)'
                  : 'Sleep-related notes (optional)'}
                value={sleepNote}
                onChange={(e) => setSleepNote(e.target.value)}
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">{isKo ? '특이사항' : 'Health/Other Notes'}</label>
              <textarea
                className="st-report-textarea"
                placeholder={isKo
                  ? '특이사항이 있으면 적어주세요 (선택)'
                  : 'Any special notes (optional)'}
                value={healthNote}
                onChange={(e) => setHealthNote(e.target.value)}
              />
            </div>
          </div>

          <button
            className="st-session-btn checkout"
            onClick={handleCheckOut}
            disabled={!activities.trim()}
          >
            <LogOut size={20} />
            {isKo ? '체크아웃 + 리포트 제출' : 'Check Out + Submit Report'}
          </button>
        </>
      )}

      {/* Completed */}
      {phase === 'completed' && (
        <div className="st-card">
          <h3 className="st-card-title">{isKo ? '제출된 리포트' : 'Submitted Report'}</h3>
          <div className="st-next-session-rows">
            <div className="st-detail-row">
              <span className="st-detail-label">{isKo ? '활동 내역' : 'Activities'}</span>
              <span className="st-detail-value">{activities}</span>
            </div>
            {sleepNote && (
              <div className="st-detail-row">
                <span className="st-detail-label">{isKo ? '수면' : 'Sleep'}</span>
                <span className="st-detail-value">{sleepNote}</span>
              </div>
            )}
            {healthNote && (
              <div className="st-detail-row">
                <span className="st-detail-label">{isKo ? '특이사항' : 'Notes'}</span>
                <span className="st-detail-value">{healthNote}</span>
              </div>
            )}
            <div className="st-detail-row">
              <span className="st-detail-label">{isKo ? '체크인' : 'Check-in'}</span>
              <span className="st-detail-value">18:05</span>
            </div>
            <div className="st-detail-row">
              <span className="st-detail-label">{isKo ? '체크아웃' : 'Check-out'}</span>
              <span className="st-detail-value">22:00</span>
            </div>
            <div className="st-detail-row">
              <span className="st-detail-label">{isKo ? '수입' : 'Earnings'}</span>
              <span className="st-detail-value" style={{ color: 'var(--sitter-accent-dark)', fontWeight: 700 }}>
                ₩{session.earning.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </SitterV2Layout>
  );
}
