// Parent Live Status Page - Quiet Luxury Redesign

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Building2, DoorOpen, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button, IconButton } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { TierBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ActivityFeed } from '../../components/parent/ActivityFeed';
import type { ActivityLog } from '../../components/parent/ActivityFeed';
import { ChatPanel } from '../../components/common/ChatPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveStatus } from '../../hooks/useSessions';
import ErrorBanner from '../../components/common/ErrorBanner';
import '../../styles/pages/parent-live-status.css';

export default function LiveStatus() {
    const { id } = useParams();
    const { t } = useTranslation();
    useAuth();
    const { logs, sessionInfo, isLoading, error, retry } = useLiveStatus(id);
    const [chatOpen, setChatOpen] = useState(false);

    if (!isLoading && !id && logs.length === 0) {
        return (
            <div className="live-status-page">
                <div className="live-status-container">
                    <EmptyState
                        icon={<Clock size={20} strokeWidth={1.75} />}
                        title={t('parent.noActiveSession')}
                        description={t('parent.noActiveSessionDesc')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="live-status-page">
            <div className="live-status-container">
                {error && <ErrorBanner error={error} onRetry={retry} />}

                {/* Header */}
                <div className="live-status-header">
                    <h1 className="live-status-title">{t('parent.liveSession')}</h1>
                    <p className="live-status-subtitle">{t('parent.updatesFromPlayroom')}</p>
                </div>

                {/* Status Banner */}
                <div className="status-pulse-card">
                    <div className="status-pulse-row">
                        <div className="status-pulse-indicator">
                            <span className="status-dot-wrapper" aria-hidden="true">
                                <span className="status-dot-ping"></span>
                                <span className="status-dot-solid"></span>
                            </span>
                            <span className="sr-only">{t('common.active', 'Active')}</span>
                            <span className="status-label">{t('parent.activeCare')}</span>
                        </div>
                        <span className="status-elapsed" aria-live="polite">{sessionInfo.elapsedTime}</span>
                    </div>
                </div>

                {/* Session Info */}
                <Card className="session-info-card" padding="sm">
                    <div className="session-info-grid">
                        <div className="session-info-item">
                            <Building2 size={14} strokeWidth={1.75} />
                            <span className="session-info-label">{t('qr.hotelLabel')}</span>
                            <span className="session-info-value">{t('parent.sessionHotel')}</span>
                        </div>
                        <div className="session-info-item">
                            <DoorOpen size={14} strokeWidth={1.75} />
                            <span className="session-info-label">{t('qr.roomLabel')}</span>
                            <span className="session-info-value">{t('parent.sessionRoom')}</span>
                        </div>
                        <div className="session-info-item">
                            <Clock size={14} strokeWidth={1.75} />
                            <span className="session-info-label">{t('parent.startedAt')}</span>
                            <span className="session-info-value">{t('parent.sessionStartTime')}</span>
                        </div>
                    </div>
                </Card>

                {/* Sitter Profile (Mini) */}
                <Card className="sitter-profile-card" padding="sm">
                    <div className="sitter-profile-row">
                        <Avatar name={sessionInfo.sitterName} size="lg" variant="gold" />
                        <div className="sitter-profile-info">
                            <div className="sitter-profile-name-row">
                                <h3 className="sitter-profile-name">{sessionInfo.sitterName}</h3>
                                <TierBadge tier="gold" />
                            </div>
                            <p className="sitter-profile-details">{t('parent.certifiedSpecialist')} • {t('sitterProfile.defaultLanguages')}</p>
                        </div>
                        <IconButton
                            variant="ghost"
                            size="md"
                            aria-label={t('aria.messageSitter')}
                            icon={<MessageCircle size={20} strokeWidth={1.75} />}
                            onClick={() => setChatOpen(true)}
                        />
                    </div>
                </Card>

                {/* Main Feed */}
                <div className="activity-feed-section">
                    <h3 className="section-header">{t('parent.activityTimeline')}</h3>
                    <div className="activity-feed-card">
                        <ActivityFeed logs={logs as ActivityLog[]} />
                    </div>
                </div>

                {/* Contact & Emergency Actions */}
                <div className="live-status-actions">
                    <Button variant="gold" fullWidth onClick={() => setChatOpen(true)}>
                        {t('parent.contactSitter')}
                    </Button>
                    <a href="tel:119" className="emergency-call-link">
                        <Button
                            variant="danger"
                            fullWidth
                        >
                            {t('parent.emergencyCall119')}
                        </Button>
                    </a>
                    <Link to="/parent" className="return-home-link">
                        <Button variant="secondary" fullWidth>
                            {t('parent.returnHome')}
                        </Button>
                    </Link>
                </div>

                {/* Chat Panel */}
                <ChatPanel
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    otherUserId={sessionInfo.sitterId}
                    otherUserName={sessionInfo.sitterName}
                    bookingId={id}
                />

            </div>

        </div>
    );
}
