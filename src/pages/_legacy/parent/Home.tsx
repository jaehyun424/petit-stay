// ============================================
// Petit Stay - Parent Home Page
// ============================================

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Calendar, ClipboardList, Baby, Building2, Star, User, Shield, Award } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { Skeleton, CardSkeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useParentBookings } from '../../hooks/booking/useBookings';
import '../../styles/pages/parent-home.css';



export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { upcomingBooking, recentSessions, isLoading } = useParentBookings(user?.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('parent.morning');
    if (hour < 18) return t('parent.afternoon');
    return t('parent.evening');
  };

  const avgRating = recentSessions.length > 0
    ? (recentSessions.reduce((sum, s) => sum + s.rating, 0) / recentSessions.length)
    : 0;

  if (isLoading) {
    return (
      <div className="parent-home animate-fade-in">
        <div className="welcome-section">
          <Skeleton width="70%" height="2.5rem" />
          <Skeleton width="50%" height="1rem" className="mt-2" />
        </div>
        <div className="quick-actions">
          <Skeleton width="100%" height="60px" borderRadius="var(--radius-lg)" />
          <Skeleton width="100%" height="60px" borderRadius="var(--radius-lg)" />
          <Skeleton width="100%" height="60px" borderRadius="var(--radius-lg)" />
        </div>
        <div className="home-stats">
          <Skeleton width="100%" height="80px" borderRadius="var(--radius-lg)" />
          <Skeleton width="100%" height="80px" borderRadius="var(--radius-lg)" />
          <Skeleton width="100%" height="80px" borderRadius="var(--radius-lg)" />
        </div>
        <CardSkeleton />
        <div className="section mt-4">
          <Skeleton width="40%" height="1.5rem" />
          <div className="mt-4">
            <CardSkeleton />
          </div>
          <div className="mt-4">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-home animate-fade-in">
      {/* Welcome */}
      <div className="welcome-section">
        <h1>{t('parent.greeting', { timeOfDay: getTimeOfDay(), name: user?.profile?.firstName || 'Guest' })}</h1>
        <p>{t('parent.childcareHandled')}</p>
      </div>

      {/* Trust Indicators */}
      <div className="trust-indicators">
        <div className="trust-card">
          <Building2 size={20} strokeWidth={1.75} />
          <div>
            <span className="trust-card-value">{t('parent.trustHotels', '120+')}</span>
            <span className="trust-card-label">{t('parent.premiumHotels', 'Premium Hotels')}</span>
          </div>
        </div>
        <div className="trust-card">
          <Shield size={20} strokeWidth={1.75} />
          <div>
            <span className="trust-card-value">{t('parent.trustSpecialists', '500+')}</span>
            <span className="trust-card-label">{t('parent.verifiedSpecialists', 'Verified Specialists')}</span>
          </div>
        </div>
        <div className="trust-card">
          <Award size={20} strokeWidth={1.75} />
          <div>
            <span className="trust-card-value">{t('parent.trustRating', '4.9')}</span>
            <span className="trust-card-label">{t('parent.avgSatisfaction', 'Avg Satisfaction')}</span>
          </div>
        </div>
        <div className="trust-card">
          <Calendar size={20} strokeWidth={1.75} />
          <div>
            <span className="trust-card-value">{t('parent.trustSessions', '10K+')}</span>
            <span className="trust-card-label">{t('parent.completedSessions', 'Completed Sessions')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div className="quick-actions" role="navigation" aria-label="Quick actions" initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div variants={staggerItem}>
          <Link to="/parent/book" className="quick-action-btn">
            <span className="icon" aria-hidden="true"><Calendar size={20} strokeWidth={1.75} /></span>
            <span>{t('parent.bookNow')}</span>
          </Link>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Link to="/parent/history" className="quick-action-btn">
            <span className="icon" aria-hidden="true"><ClipboardList size={20} strokeWidth={1.75} /></span>
            <span>{t('nav.history')}</span>
          </Link>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Link to="/parent/profile" className="quick-action-btn">
            <span className="icon" aria-hidden="true"><Baby size={20} strokeWidth={1.75} /></span>
            <span>{t('parent.children')}</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Dashboard Stats */}
      <div className="home-stats">
        <div className="stat-card">
          {recentSessions.length > 0 ? (
            <AnimatedCounter target={recentSessions.length} className="stat-value" />
          ) : (
            <span className="stat-value stat-value-empty">—</span>
          )}
          <span className="stat-label">
            {recentSessions.length === 0
              ? t('parent.noBookingsYet')
              : t('parent.totalSessions')}
          </span>
        </div>
        <div className="stat-card">
          {recentSessions.length > 0 ? (
            <span className="stat-value">{avgRating.toFixed(1)}</span>
          ) : (
            <span className="stat-value stat-value-empty">—</span>
          )}
          <span className="stat-label">
            {recentSessions.length === 0
              ? t('parent.noRatingsYet')
              : t('parent.avgRating')}
          </span>
        </div>
        <div className="stat-card">
          {(upcomingBooking?.childrenIds?.length || 0) > 0 ? (
            <AnimatedCounter target={upcomingBooking?.childrenIds?.length || 0} className="stat-value" />
          ) : (
            <span className="stat-value stat-value-empty">—</span>
          )}
          <span className="stat-label">{t('parent.children')}</span>
        </div>
      </div>

      {/* Two-column grid wrapper for desktop */}
      <div className="parent-home-grid">
        {/* Upcoming Booking */}
        <div>
          {upcomingBooking ? (
            <Card className="upcoming-card">
              <CardBody>
                <div className="upcoming-header">
                  <h3>{t('parent.upcomingBooking')}</h3>
                  <StatusBadge status={upcomingBooking.status} />
                </div>
                <div className="upcoming-details">
                  <div className="detail-row">
                    <span aria-hidden="true"><Calendar size={16} strokeWidth={1.75} /></span>
                    <span>{t('parent.tonight')} • {upcomingBooking.time}</span>
                  </div>
                  <div className="detail-row">
                    <span aria-hidden="true"><Building2 size={16} strokeWidth={1.75} /></span>
                    <span>{upcomingBooking.hotel} - {t('common.room')} {upcomingBooking.room}</span>
                  </div>
                  <div className="detail-row">
                    <span aria-hidden="true"><User size={16} strokeWidth={1.75} /></span>
                    <span>{upcomingBooking.sitter.name} <span aria-label={`rated ${upcomingBooking.sitter.rating} stars`}><Star size={14} strokeWidth={1.75} fill="currentColor" /> {upcomingBooking.sitter.rating}</span></span>
                  </div>
                  <div className="detail-row">
                    <span aria-hidden="true"><Baby size={16} strokeWidth={1.75} /></span>
                    <span>{upcomingBooking.childrenIds.length} {t('parent.children').toLowerCase()}</span>
                  </div>
                </div>
                <div className="upcoming-actions">
                  <Button variant="gold" fullWidth onClick={() => navigate(`/parent/trust-checkin/${upcomingBooking.id}`)}>
                    {t('parent.trustCheckIn')}
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => navigate(`/parent/qr/${upcomingBooking.id}`)} style={{ marginTop: '0.5rem' }}>
                    {t('parent.showQRCode')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <EmptyState
              icon={<Calendar size={20} strokeWidth={1.75} />}
              title={t('parent.noUpcomingBookings')}
              description={t('parent.noUpcomingBookingsDesc')}
              action={
                <Button variant="gold" onClick={() => navigate('/parent/book')}>{t('parent.bookNow')}</Button>
              }
            />
          )}
        </div>

        {/* Recent Sessions */}
        <div className="section">
          <h2 className="section-title">{t('parent.recentSessions')}</h2>
          {recentSessions.length > 0 ? (
            <motion.div initial="hidden" animate="show" variants={staggerContainer}>
              {recentSessions.map((session) => (
                <motion.div key={session.id} variants={staggerItem}>
                  <Card className="session-card">
                    <CardBody>
                      <div className="session-info">
                        <div>
                          <span className="session-date">{formatDate(session.date)}</span>
                          <span className="session-hotel">{session.hotel}</span>
                        </div>
                        <div className="session-meta">
                          <span>{session.durationHours}h</span>
                          <span aria-label={`${session.rating} star rating`}>{Array.from({ length: session.rating }, (_, i) => <Star key={i} size={14} strokeWidth={1.75} fill="currentColor" />)}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={<ClipboardList size={20} strokeWidth={1.75} />}
              title={t('parent.noRecentSessions')}
              description={t('parent.noRecentSessionsDesc')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
