// Sitter Schedule Page

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2, Baby, Calendar } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { StatusBadge, TierBadge, SafetyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton, SkeletonText } from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSitterBookings } from '../../hooks/useBookings';
import { useSitterStats } from '../../hooks/useSitters';
import '../../styles/pages/sitter-schedule.css';

export default function Schedule() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const sitterId = user?.sitterInfo?.sitterId || user?.id;
    const { todaySessions, weekSchedule, isLoading } = useSitterBookings(sitterId);
    const { stats, isLoading: isStatsLoading } = useSitterStats(sitterId);

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

            {/* Today's Schedule */}
            <h2 className="section-title">{t('sitter.todaySchedule')}</h2>
            {todaySessions.length > 0 ? (
                <motion.div className="sessions-list" initial="hidden" animate="show" variants={staggerContainer}>
                    {todaySessions.map((session) => (
                        <motion.div key={session.id} variants={staggerItem}>
                            <Card>
                                <CardBody>
                                    <div className="session-header">
                                        <span className="session-time">{session.time}</span>
                                        <StatusBadge status={session.status} />
                                    </div>
                                    <div className="session-info">
                                        <span><Building2 size={14} strokeWidth={1.75} /> {session.hotel} - {t('common.room')} {session.room}</span>
                                        <span><Baby size={14} strokeWidth={1.75} /> {session.children.join(', ')}</span>
                                    </div>
                                    <div className="session-actions">
                                        {session.status === 'confirmed' && (
                                            <Button variant="gold" fullWidth onClick={() => { toast.success(t('sitter.startSession'), `Room ${session.room}`); navigate('/sitter/active'); }}>{t('sitter.startSession')}</Button>
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
                        <span className="day-count" aria-hidden="true">{day.sessions > 0 ? day.sessions : '-'}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
