// ============================================
// Petit Stay - Notification Inbox Page
// ============================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/pages/notification-inbox.css';

type FilterType = 'all' | 'bookings' | 'sessions' | 'emergency';

const BOOKING_TYPES = ['booking_created', 'booking_confirmed', 'booking_cancelled'];
const SESSION_TYPES = ['care_started', 'care_completed', 'sitter_assigned'];
const EMERGENCY_TYPES = ['emergency'];

// timeAgo is now defined inside the component to access t()

export default function NotificationInbox() {
    const { t } = useTranslation();

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return t('time.justNow');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('time.minutesAgo', { count: minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('time.hoursAgo', { count: hours });
        const days = Math.floor(hours / 24);
        return t('time.daysAgo', { count: days });
    };

    const { user } = useAuth();
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user?.id);
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'all') return true;
        if (filter === 'bookings') return BOOKING_TYPES.includes(n.type);
        if (filter === 'sessions') return SESSION_TYPES.includes(n.type);
        if (filter === 'emergency') return EMERGENCY_TYPES.includes(n.type);
        return true;
    });

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: t('notifications.filterAll') },
        { key: 'bookings', label: t('notifications.filterBookings') },
        { key: 'sessions', label: t('notifications.filterSessions') },
        { key: 'emergency', label: t('notifications.filterEmergency') },
    ];

    return (
        <div className="notification-inbox animate-fade-in">
            {/* ErrorBanner placeholder for future error/retry support */}
            <div className="notification-inbox-header">
                <h1 className="page-title">{t('notifications.inbox')}</h1>
                <div className="notification-inbox-actions">
                    <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                        {t('notifications.markAllRead')}
                    </Button>
                </div>
            </div>

            <div className="notification-filter-tabs">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        className={`notification-filter-tab ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <Card>
                    <CardBody>
                        <EmptyState
                            icon={<Bell size={20} strokeWidth={1.75} />}
                            title={t('notifications.noNotifications')}
                            description={t('notifications.noNotificationsDesc')}
                        />
                    </CardBody>
                </Card>
            ) : (
                <div className="notification-inbox-list">
                    {filteredNotifications.map((n) => (
                        <div
                            key={n.id}
                            className={`notification-inbox-item ${!n.read ? 'unread' : ''}`}
                        >
                            <span className={`notification-inbox-item-dot ${n.read ? 'read' : ''}`} />
                            <div
                                className="notification-inbox-item-content"
                                onClick={() => { if (!n.read) markAsRead(n.id); }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !n.read) markAsRead(n.id); }}
                            >
                                <span className="notification-inbox-item-title">{n.title}</span>
                                <span className="notification-inbox-item-body">{n.body}</span>
                                <span className="notification-inbox-item-time">
                                    {timeAgo(n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt))}
                                </span>
                            </div>
                            <div className="notification-inbox-item-actions">
                                {!n.read && (
                                    <button onClick={() => markAsRead(n.id)}>
                                        {t('common.markAllRead')}
                                    </button>
                                )}
                                <button className="delete" onClick={() => deleteNotification(n.id)}>
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
