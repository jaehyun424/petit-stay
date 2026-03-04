// ============================================
// Petit Stay - Notification Bell
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/notification-bell.css';

// Map notification types to navigation paths
function getNotificationPath(type: string, role?: string): string | null {
    const rolePrefix = role === 'hotel_staff' ? '/hotel' : role === 'sitter' ? '/sitter' : '/parent';
    switch (type) {
        case 'booking_created':
        case 'booking_confirmed':
        case 'booking_cancelled':
            return role === 'hotel_staff' ? '/hotel/bookings' : '/parent/history';
        case 'sitter_assigned':
            return `${rolePrefix}`;
        case 'care_started':
        case 'care_completed':
            return role === 'parent' ? '/parent/live-status' : role === 'hotel_staff' ? '/hotel/live' : '/sitter/session';
        case 'emergency':
            return role === 'hotel_staff' ? '/hotel/safety' : `${rolePrefix}`;
        case 'review_received':
            return role === 'sitter' ? '/sitter/profile' : `${rolePrefix}`;
        case 'payment_received':
            return role === 'sitter' ? '/sitter/earnings' : `${rolePrefix}`;
        default:
            return null;
    }
}

function timeAgo(date: Date, t: (key: string, opts?: Record<string, unknown>) => string): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return t('time.justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('time.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('time.hoursAgoShort', { count: hours });
    const days = Math.floor(hours / 24);
    return t('time.daysAgo', { count: days });
}

export function NotificationBell() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('parent.notifications', 'Notifications') + (unreadCount > 0 ? `, ${unreadCount} ${t('common.unread', 'unread')}` : '')}
            >
                <Bell size={20} strokeWidth={1.75} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <span className="notification-dropdown-title">{t('parent.notifications')}</span>
                        {unreadCount > 0 && (
                            <button
                                className="notification-mark-all"
                                onClick={() => markAllAsRead()}
                            >
                                {t('common.markAllRead')}
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {recentNotifications.length === 0 ? (
                            <div className="notification-empty">
                                {t('common.noNotifications')}
                            </div>
                        ) : (
                            recentNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`notification-item ${!n.read ? 'notification-unread' : ''}`}
                                    onClick={() => {
                                        if (!n.read) markAsRead(n.id);
                                        const path = getNotificationPath(n.type, user?.role);
                                        if (path) {
                                            setIsOpen(false);
                                            navigate(path);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (!n.read) markAsRead(n.id);
                                            const path = getNotificationPath(n.type, user?.role);
                                            if (path) { setIsOpen(false); navigate(path); }
                                        }
                                    }}
                                >
                                    <div className="notification-item-content">
                                        <span className="notification-item-title">{n.title}</span>
                                        <span className="notification-item-body">{n.body}</span>
                                        <span className="notification-item-time">
                                            {timeAgo(n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt), t)}
                                        </span>
                                    </div>
                                    {!n.read && <span className="notification-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="notification-dropdown-footer">
                        <button
                            className="notification-view-all"
                            onClick={() => {
                                setIsOpen(false);
                                const rolePrefix = user?.role === 'hotel_staff' ? '/hotel' : user?.role === 'sitter' ? '/sitter' : '/parent';
                                navigate(`${rolePrefix}/notifications`);
                            }}
                        >
                            {t('notifications.viewAll', 'View All')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
