// ============================================
// Petit Stay - Live Monitor Page
// ============================================


import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, AlertTriangle, Baby, Smile, Zap, Radio, Utensils, Gamepad2, Moon, FileText } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge, TierBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ChatPanel } from '../../components/common/ChatPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Skeleton, SkeletonCircle, SkeletonText } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useHotelSessions } from '../../hooks/useSessions';
import type { DemoActiveSession } from '../../data/demo';
import '../../styles/pages/hotel-live-monitor.css';

function getMoodColor(mood: string): string {
  switch (mood.toLowerCase()) {
    case 'happy': case 'excited': return 'var(--success-500)';
    case 'calm': case 'relaxed': return '#4A6F8F';
    case 'tired': case 'sleepy': return 'var(--warning-500)';
    case 'fussy': case 'crying': return 'var(--error-500)';
    default: return 'var(--charcoal-600)';
  }
}

function getEnergyColor(energy: string): string {
  switch (energy.toLowerCase()) {
    case 'high': return 'var(--success-500)';
    case 'medium': return 'var(--warning-500)';
    case 'low': return 'var(--error-500)';
    default: return 'var(--charcoal-600)';
  }
}

function getActivityIcon(activity: string) {
  const lower = activity.toLowerCase();
  if (lower.includes('meal') || lower.includes('eat') || lower.includes('snack') || lower.includes('feed'))
    return <Utensils size={14} strokeWidth={1.75} />;
  if (lower.includes('play') || lower.includes('game') || lower.includes('toy'))
    return <Gamepad2 size={14} strokeWidth={1.75} />;
  if (lower.includes('sleep') || lower.includes('nap') || lower.includes('rest'))
    return <Moon size={14} strokeWidth={1.75} />;
  return <FileText size={14} strokeWidth={1.75} />;
}

export default function LiveMonitor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sessions, isLoading, error, retry } = useHotelSessions(user?.hotelId);
  const toast = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string } | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [detailSession, setDetailSession] = useState<DemoActiveSession | null>(null);

  const handleContactSitter = (sitterName: string) => {
    setChatTarget({ id: `sitter-${sitterName}`, name: sitterName });
    setChatOpen(true);
  };

  const handleEmergencyConfirm = () => {
    toast.warning(t('liveMonitor.emergencyActivated'), t('liveMonitor.emergencyActivatedDesc'));
    setShowEmergency(false);
  };

  if (isLoading) {
    return (
      <div className="live-monitor-page animate-fade-in">
        <div className="page-header">
          <div>
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="40%" height="1rem" className="mt-2" />
          </div>
          <Skeleton width="160px" height="40px" borderRadius="var(--radius-sm)" />
        </div>
        <div className="sessions-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="flex gap-4 items-center">
                <SkeletonCircle size={48} />
                <div className="skeleton-flex-fill">
                  <Skeleton width="50%" height="1.25rem" />
                  <Skeleton width="30%" height="0.875rem" className="mt-2" />
                </div>
                <Skeleton width="60px" height="1rem" />
              </div>
              <div className="mt-4">
                <SkeletonText lines={3} />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton width="120px" height="32px" borderRadius="var(--radius-sm)" />
                <Skeleton width="100px" height="32px" borderRadius="var(--radius-sm)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="live-monitor-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {t('nav.liveMonitor')}
            <span className="live-indicator" role="status" aria-label="Live monitoring active">
              <span className="live-dot" aria-hidden="true" />
              {t('hotel.live')}
            </span>
          </h1>
          <p className="page-subtitle" aria-live="polite">
            {t('hotel.activeSessionsNow', { count: sessions.length })}
            {sessions.length > 0 && (
              <span className="realtime-indicator" style={{ marginLeft: 'var(--space-3)' }}>
                <span className="realtime-pulse" aria-hidden="true" />
                {t('liveMonitor.realtimeUpdates', 'Real-time updates')}
              </span>
            )}
          </p>
        </div>
        <Button variant="danger" icon={<AlertTriangle size={16} strokeWidth={2} />} onClick={() => setShowEmergency(true)}>
          {t('hotel.emergencyProtocol')}
        </Button>
      </div>

      {error && <ErrorBanner error={error} onRetry={retry} />}

      {sessions.length > 0 ? (
      <div className="sessions-grid">
        {sessions.map((session) => (
          <Card key={session.id} className="session-card">
            <CardHeader>
              <div className="session-header">
                <Avatar name={session.sitter.name} size="lg" variant={session.sitter.tier === 'gold' ? 'gold' : 'default'} />
                <div className="session-info">
                  <div className="session-sitter">
                    <span className="sitter-name">{session.sitter.name}</span>
                    <TierBadge tier={session.sitter.tier} />
                  </div>
                  <div className="session-room">{t('common.room')} {session.room}</div>
                </div>
                <div className="session-time">
                  <span className="elapsed">{session.elapsed}</span>
                  <span className="last-update">{t('hotel.updated')} {session.lastUpdate}</span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {/* Children */}
              <div className="children-list">
                {session.children.map((child, i) => (
                  <div key={i} className="child-tag">
                    <Baby size={16} strokeWidth={1.75} /> {child.name} ({child.age}y)
                  </div>
                ))}
              </div>

              {/* Vitals */}
              <div className="vitals-row">
                <span className="vital" style={{ color: getMoodColor(session.vitals.mood) }}>
                  <Smile size={16} strokeWidth={1.75} /> {session.vitals.mood}
                </span>
                <span className="vital" style={{ color: getEnergyColor(session.vitals.energy) }}>
                  <Zap size={16} strokeWidth={1.75} /> {session.vitals.energy} {t('hotel.energy')}
                </span>
              </div>

              {/* Activity Timeline */}
              <div className="activity-timeline">
                <h4>{t('hotel.recentActivity')}</h4>
                {session.activities.slice(0, 3).map((activity, i) => (
                  <div key={i} className="activity-item">
                    <span className="activity-time">{activity.time}</span>
                    <span className="activity-icon" aria-hidden="true">{getActivityIcon(activity.activity)}</span>
                    <span className="activity-text">{activity.activity}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="session-actions">
                <Button variant="ghost" size="sm" icon={<Phone size={16} strokeWidth={2} />} onClick={() => handleContactSitter(session.sitter.name)}>
                  {t('hotel.contactSitter')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDetailSession(session)}>
                  {t('hotel.viewDetails')}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      ) : (
        <EmptyState
          icon={<Radio size={16} strokeWidth={1.75} />}
          title={t('liveMonitor.noActiveSessions')}
          description={t('liveMonitor.noActiveSessionsDesc')}
        />
      )}

      {/* Emergency Protocol Confirm */}
      <ConfirmDialog
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        onConfirm={handleEmergencyConfirm}
        title={t('hotel.emergencyProtocol')}
        message={t('liveMonitor.emergencyConfirm')}
        confirmText={t('liveMonitor.activate')}
        variant="danger"
      />

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!detailSession}
        onClose={() => setDetailSession(null)}
        title={detailSession ? `${detailSession.sitter.name} - ${t('common.room')} ${detailSession.room}` : ''}
        size="lg"
      >
        {detailSession && (
          <div className="detail-modal-stack">
            <div className="detail-modal-header">
              <Avatar name={detailSession.sitter.name} size="lg" variant={detailSession.sitter.tier === 'gold' ? 'gold' : 'default'} />
              <div>
                <div className="detail-modal-name">{detailSession.sitter.name}</div>
                <TierBadge tier={detailSession.sitter.tier} />
              </div>
            </div>
            <div className="detail-modal-grid">
              <div><strong>{t('liveMonitor.roomLabel')}</strong> {detailSession.room}</div>
              <div><strong>{t('liveMonitor.startedLabel')}</strong> {detailSession.startTime}</div>
              <div><strong>{t('liveMonitor.elapsedLabel')}</strong> {detailSession.elapsed}</div>
              <div><strong>{t('liveMonitor.moodLabel')}</strong> {detailSession.vitals.mood}</div>
              <div><strong>{t('liveMonitor.energyLabel')}</strong> {detailSession.vitals.energy}</div>
            </div>
            <div>
              <strong>{t('activeSession.children')}:</strong>
              <div className="detail-modal-tags">
                {detailSession.children.map((child, i) => (
                  <Badge key={i} variant="neutral">{child.name} ({child.age}y)</Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>{t('liveMonitor.activityTimeline')}</strong>
              <div className="detail-timeline-section">
                {detailSession.activities.map((activity, i) => (
                  <div key={i} className={`detail-timeline-item${i < detailSession.activities.length - 1 ? '' : ' detail-timeline-item-last'}`}>
                    <span className="detail-timeline-time">{activity.time}</span>
                    <span>{activity.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        otherUserId={chatTarget?.id}
        otherUserName={chatTarget?.name}
      />
    </div>
  );
}
