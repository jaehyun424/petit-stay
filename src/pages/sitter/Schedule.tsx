// Sitter Schedule Page

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2, Baby, Calendar, Clock, AlertCircle, Check, X, DollarSign, CalendarDays, List, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { StatusBadge, TierBadge, SafetyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton, SkeletonText } from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSitterBookings } from '../../hooks/useBookings';
import { useSitterStats } from '../../hooks/useSitters';
import '../../styles/pages/sitter-schedule.css';

function useCountdown(todaySessions: { time: string; status: string }[]) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const calcCountdown = () => {
            const now = new Date();
            const upcoming = todaySessions
                .filter((s) => s.status === 'confirmed' || s.status === 'pending')
                .map((s) => {
                    const [startStr] = s.time.split(' - ');
                    const [h, m] = startStr.split(':').map(Number);
                    const sessionDate = new Date(now);
                    sessionDate.setHours(h, m, 0, 0);
                    return sessionDate;
                })
                .filter((d) => d.getTime() > now.getTime())
                .sort((a, b) => a.getTime() - b.getTime());

            if (upcoming.length === 0) {
                setCountdown('');
                return;
            }

            const diff = upcoming[0].getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 0) {
                setCountdown(`${hours}h ${mins}m`);
            } else {
                setCountdown(`${mins}m`);
            }
        };

        calcCountdown();
        const interval = setInterval(calcCountdown, 60000);
        return () => clearInterval(interval);
    }, [todaySessions]);

    return countdown;
}

type ViewMode = 'list' | 'calendar';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
}

export default function Schedule() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const sitterId = user?.sitterInfo?.sitterId || user?.id;
    const { todaySessions, weekSchedule, isLoading, acceptAssignment, rejectAssignment } = useSitterBookings(sitterId);
    const { stats, isLoading: isStatsLoading } = useSitterStats(sitterId);
    const countdown = useCountdown(todaySessions);

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
    const [confirmAccept, setConfirmAccept] = useState<{ id: string; hotel: string; room: string; time: string } | null>(null);

    const calendarDays = getMonthDays(calendarDate.getFullYear(), calendarDate.getMonth());
    const today = new Date();

    const sessionsWithDays = weekSchedule.reduce<Record<number, number>>((acc, day) => {
        const dayNum = parseInt(day.date.split('/')[1] || day.date, 10);
        if (day.sessions > 0 && !isNaN(dayNum)) acc[dayNum] = day.sessions;
        return acc;
    }, {});

    const handleAccept = async (bookingId: string) => {
        try {
            await acceptAssignment(bookingId);
            toast.success(t('sitter.assignmentAccepted', 'Assignment Accepted'), t('sitter.assignmentAcceptedDesc', 'You have accepted this session.'));
        } catch {
            toast.error(t('common.error'), t('sitter.assignmentFailed', 'Failed to update assignment.'));
        }
    };

    const handleReject = async (bookingId: string) => {
        try {
            await rejectAssignment(bookingId);
            toast.success(t('sitter.assignmentDeclined', 'Assignment Declined'), t('sitter.assignmentDeclinedDesc', 'The booking will be reassigned.'));
        } catch {
            toast.error(t('common.error'), t('sitter.assignmentFailed', 'Failed to update assignment.'));
        }
    };

    const navigateMonth = (delta: number) => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1));
    };

    if (isLoading || isStatsLoading) {
        return (
            <div className="sitter-schedule animate-fade-in">
                <div className="stats-row">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="stat-item">
                            <Skeleton width="50px" height="1.5rem" />
                            <Skeleton width="70px" height="0.75rem" className="mt-2" />
                        </div>
                    ))}
                </div>
                <Skeleton width="100%" height="40px" borderRadius="var(--radius-full)" className="mt-4" />
                <Skeleton width="40%" height="1.5rem" className="mt-6" />
                <div className="sessions-list mt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card" style={{ marginBottom: '0.75rem' }}>
                            <div className="flex justify-between items-center">
                                <Skeleton width="35%" height="1rem" />
                                <Skeleton width="80px" height="1.5rem" borderRadius="var(--radius-full)" />
                            </div>
                            <SkeletonText lines={2} className="mt-4" />
                            <Skeleton width="100%" height="40px" borderRadius="var(--radius-sm)" className="mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="sitter-schedule animate-fade-in">
            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">{stats.totalSessions}</span>
                    <span className="stat-label">{t('hotel.sessions')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.avgRating}</span>
                    <span className="stat-label">{t('common.rating')}</span>
                </div>
                <div className="stat-item gold">
                    <TierBadge tier={stats.tier} />
                </div>
            </div>

            <SafetyBadge days={stats.safetyDays} />

            {/* Availability Toggle */}
            <div className="availability-toggle">
                <div className="availability-info">
                    <span className="availability-label">{t('sitter.availability', 'Availability')}</span>
                    <span className="availability-status">
                        {availabilityEnabled
                            ? t('sitter.availableForAssignment', 'Available for assignments')
                            : t('sitter.unavailable', 'Not accepting assignments')}
                    </span>
                </div>
                <button
                    className={`toggle-btn ${availabilityEnabled ? 'active' : ''}`}
                    onClick={() => {
                        setAvailabilityEnabled(!availabilityEnabled);
                        toast.success(
                            t('sitter.availability', 'Availability'),
                            availabilityEnabled
                                ? t('sitter.markedUnavailable', 'You are now marked as unavailable')
                                : t('sitter.markedAvailable', 'You are now available for assignments')
                        );
                    }}
                    aria-label={t('sitter.toggleAvailability', 'Toggle availability')}
                >
                    {availabilityEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
            </div>

            {/* Countdown */}
            {countdown && (
                <motion.div
                    className="countdown-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Clock size={16} strokeWidth={1.75} />
                    <span>{t('sitter.nextSessionIn', 'Next session in')} <strong>{countdown}</strong></span>
                </motion.div>
            )}

            {/* View Mode Toggle + Today's Schedule Header */}
            <div className="schedule-header-row">
                <h2 className="section-title">
                    {viewMode === 'list'
                        ? t('sitter.todaySchedule')
                        : t('sitter.calendarView', 'Calendar')}
                </h2>
                <div className="view-toggle" role="tablist">
                    <button
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        role="tab"
                        aria-selected={viewMode === 'list'}
                        aria-label={t('sitter.listView', 'List view')}
                    >
                        <List size={16} strokeWidth={1.75} />
                    </button>
                    <button
                        className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                        role="tab"
                        aria-selected={viewMode === 'calendar'}
                        aria-label={t('sitter.calendarView', 'Calendar view')}
                    >
                        <CalendarDays size={16} strokeWidth={1.75} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Session Cards */}
                        {todaySessions.length > 0 ? (
                            <motion.div className="sessions-list" initial="hidden" animate="show" variants={staggerContainer}>
                                {todaySessions.map((session) => (
                                    <motion.div key={session.id} variants={staggerItem}>
                                        <Card className={`session-card session-card--${session.status}`}>
                                            <CardBody>
                                                <div className="session-header">
                                                    <div className="session-time-block">
                                                        <span className="session-time">{session.time}</span>
                                                        {session.amount && (
                                                            <span className="session-amount-inline">
                                                                <DollarSign size={12} strokeWidth={2} />
                                                                {session.amount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <StatusBadge status={session.status} />
                                                </div>
                                                <div className="session-details-grid">
                                                    <div className="session-detail">
                                                        <div className="session-detail-icon">
                                                            <Building2 size={14} strokeWidth={1.75} />
                                                        </div>
                                                        <div>
                                                            <span className="detail-label">{t('sitter.hotelRoom', 'Hotel / Room')}</span>
                                                            <span className="detail-value">{session.hotel} - {session.room}</span>
                                                        </div>
                                                    </div>
                                                    <div className="session-detail">
                                                        <div className="session-detail-icon">
                                                            <Baby size={14} strokeWidth={1.75} />
                                                        </div>
                                                        <div>
                                                            <span className="detail-label">{t('sitter.childrenInfo', 'Children')}</span>
                                                            <span className="detail-value">{session.children.map((c) => typeof c === 'string' ? c : `${c.name} (${c.age})`).join(', ')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="session-detail">
                                                        <div className="session-detail-icon">
                                                            <Clock size={14} strokeWidth={1.75} />
                                                        </div>
                                                        <div>
                                                            <span className="detail-label">{t('common.time')}</span>
                                                            <span className="detail-value">{session.time}</span>
                                                        </div>
                                                    </div>
                                                    {session.amount && (
                                                        <div className="session-detail">
                                                            <div className="session-detail-icon icon-gold">
                                                                <DollarSign size={14} strokeWidth={1.75} />
                                                            </div>
                                                            <div>
                                                                <span className="detail-label">{t('sitter.sessionAmount', 'Amount')}</span>
                                                                <span className="detail-value detail-value-gold">{session.amount}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {session.children.some((c) => typeof c !== 'string' && c.allergies?.length) && (
                                                    <div className="allergy-info">
                                                        <AlertCircle size={14} strokeWidth={1.75} />
                                                        <span>{t('sitter.allergies', 'Allergies')}: {session.children
                                                            .filter((c) => typeof c !== 'string' && c.allergies?.length)
                                                            .map((c) => typeof c !== 'string' ? `${c.name}: ${c.allergies!.join(', ')}` : '')
                                                            .join(' | ')}</span>
                                                    </div>
                                                )}
                                                <div className="session-actions">
                                                    {session.status === 'confirmed' && (
                                                        <Button variant="gold" fullWidth onClick={() => { toast.success(t('sitter.startSession'), `Room ${session.room}`); navigate('/sitter/active'); }}>{t('sitter.startSession')}</Button>
                                                    )}
                                                    {session.status === 'sitter_assigned' && (
                                                        <div className="assignment-actions">
                                                            <Button variant="primary" onClick={() => setConfirmAccept({ id: session.id, hotel: session.hotel, room: session.room, time: session.time })}>
                                                                <Check size={16} strokeWidth={1.75} /> {t('sitter.acceptAssignment', 'Accept')}
                                                            </Button>
                                                            <Button variant="danger" onClick={() => handleReject(session.id)}>
                                                                <X size={16} strokeWidth={1.75} /> {t('sitter.declineAssignment', 'Decline')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {session.status === 'pending' && (
                                                        <Button variant="secondary" fullWidth disabled>{t('status.pending')}</Button>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <EmptyState
                                icon={<Calendar size={20} strokeWidth={1.75} />}
                                title={t('sitter.noSessionsScheduled', 'No sessions scheduled')}
                                description={t('sitter.noSessionsScheduledDesc', 'You have no sessions scheduled for today. Check back later.')}
                            />
                        )}

                        {/* Week View */}
                        <h2 className="section-title">{t('sitter.thisWeek')}</h2>
                        <motion.div className="week-grid" role="group" aria-label="Weekly schedule overview" initial="hidden" animate="show" variants={staggerContainer}>
                            {weekSchedule.map((day, i) => (
                                <motion.div key={i} className={`day-item ${day.sessions > 0 ? 'has-sessions' : ''}`} aria-label={`${day.date}: ${day.sessions > 0 ? day.sessions + ' sessions' : 'no sessions'}`} variants={staggerItem}>
                                    <span className="day-date">{day.date}</span>
                                    {day.sessions > 0 && (
                                        <>
                                            <span className="gold-dot" aria-hidden="true" />
                                            <span className="day-session-count">{day.sessions}</span>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Calendar View */}
                        <Card className="calendar-card">
                            <CardBody>
                                <div className="calendar-nav">
                                    <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)} aria-label={t('common.back')}>
                                        <ChevronLeft size={18} strokeWidth={2} />
                                    </button>
                                    <h3 className="calendar-month-title">
                                        {calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button className="calendar-nav-btn" onClick={() => navigateMonth(1)} aria-label={t('common.next')}>
                                        <ChevronRight size={18} strokeWidth={2} />
                                    </button>
                                </div>
                                <div className="calendar-grid">
                                    {DAYS_OF_WEEK.map((d) => (
                                        <div key={d} className="calendar-day-header">{d}</div>
                                    ))}
                                    {calendarDays.map((day, i) => {
                                        const isToday = day === today.getDate()
                                            && calendarDate.getMonth() === today.getMonth()
                                            && calendarDate.getFullYear() === today.getFullYear();
                                        const hasSession = day !== null && sessionsWithDays[day];
                                        return (
                                            <div
                                                key={i}
                                                className={`calendar-cell ${day === null ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasSession ? 'has-session' : ''}`}
                                            >
                                                {day !== null && (
                                                    <>
                                                        <span className="calendar-day-num">{day}</span>
                                                        {hasSession && <span className="calendar-session-dot" />}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Accept Confirmation Modal */}
            <Modal
                isOpen={!!confirmAccept}
                onClose={() => setConfirmAccept(null)}
                title={t('sitter.confirmAcceptTitle', 'Confirm Assignment')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmAccept(null)}>{t('common.cancel')}</Button>
                        <Button variant="gold" onClick={() => { if (confirmAccept) { handleAccept(confirmAccept.id); setConfirmAccept(null); } }}>{t('sitter.acceptAssignment', 'Accept')}</Button>
                    </>
                }
            >
                {confirmAccept && (
                    <div className="confirm-accept-details">
                        <p>{t('sitter.confirmAcceptDesc', 'Are you sure you want to accept this assignment?')}</p>
                        <div className="confirm-accept-info">
                            <div><span className="detail-label">{t('sitter.hotelRoom', 'Hotel / Room')}</span><span className="detail-value">{confirmAccept.hotel} - {confirmAccept.room}</span></div>
                            <div><span className="detail-label">{t('common.time')}</span><span className="detail-value">{confirmAccept.time}</span></div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
