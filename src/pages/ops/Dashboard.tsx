// ============================================
// Petit Stay - Ops Dashboard
// ============================================

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2, Users, Calendar, DollarSign, Star, AlertTriangle, Wallet, Target, Clock, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useOpsData } from '../../hooks/useOpsData';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

export default function OpsDashboard() {
  const { t } = useTranslation();
  const { stats, hotels, incidents, sessions, sitters, isLoading } = useOpsData();

  const urgentAlerts = useMemo(() =>
    incidents.filter((inc) => (inc.severity === 'critical' || inc.severity === 'high') && inc.status !== 'resolved' && inc.status !== 'closed'),
    [incidents]
  );

  const sitterAvailability = useMemo(() => {
    const counts = { Available: 0, Busy: 0, 'On Leave': 0, Offline: 0 };
    for (const s of sitters) {
      if (s.availability in counts) counts[s.availability as keyof typeof counts]++;
    }
    return counts;
  }, [sitters]);

  if (isLoading) {
    return (
      <div className="ops-dashboard animate-fade-in">
        <Skeleton width="260px" height="2rem" />
        <div className="ops-stats-grid">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="100px" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: <Building2 size={20} />, label: t('ops.totalHotels'), value: stats.totalHotels, color: 'primary' },
    { icon: <Users size={20} />, label: t('ops.activeSitters'), value: stats.totalActiveSitters, color: 'success' },
    { icon: <Calendar size={20} />, label: t('ops.monthlyBookings'), value: stats.totalBookingsThisMonth, color: 'warning' },
    { icon: <DollarSign size={20} />, label: t('ops.monthlyRevenue'), value: formatCurrency(stats.totalRevenueThisMonth), color: 'gold' },
    { icon: <Star size={20} />, label: t('ops.avgSatisfaction'), value: stats.avgSatisfaction.toFixed(1), color: 'success' },
    { icon: <AlertTriangle size={20} />, label: t('ops.openIssues'), value: stats.openIssues, color: 'error' },
    { icon: <Wallet size={20} />, label: t('ops.pendingSettlements'), value: stats.pendingSettlements, color: 'warning' },
    { icon: <Target size={20} />, label: t('ops.slaCompliance'), value: `${stats.slaCompliance}%`, color: 'primary' },
  ];

  const severityColors: Record<string, string> = {
    critical: 'var(--error-500)', high: 'var(--warning-500)', medium: 'var(--gold-500)', low: 'var(--success-500)',
  };

  return (
    <div className="ops-dashboard animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.dashboard')}</h1>
          <p className="page-subtitle">{t('ops.title')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div className="ops-stats-grid" initial="hidden" animate="show" variants={staggerContainer}>
        {statCards.map((stat, i) => (
          <motion.div key={i} className={`ops-stat-card ops-stat-${stat.color}`} variants={staggerItem}>
            <div className="ops-stat-icon">{stat.icon}</div>
            <div className="ops-stat-content">
              <div className="ops-stat-value">
                {typeof stat.value === 'number' ? <AnimatedCounter target={stat.value} duration={1.5} /> : stat.value}
              </div>
              <div className="ops-stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <Card className="ops-urgent-card mb-6">
          <CardHeader>
            <CardTitle>
              <Bell size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--error-500)' }} />
              {t('ops.urgentAlerts')} ({urgentAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="ops-alert-list">
              {urgentAlerts.map((alert) => (
                <div key={alert.id} className="ops-alert-item" style={{ borderLeft: `3px solid ${severityColors[alert.severity] || 'var(--border-color)'}` }}>
                  <Badge variant="error" size="sm">{alert.severity.toUpperCase()}</Badge>
                  <span className="ops-alert-text">{alert.summary}</span>
                  <span className="ops-alert-meta">{alert.sitterName}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="ops-grid-2">
        {/* Hotel Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ops.hotelManagement')}</CardTitle>
          </CardHeader>
          <CardBody>
            {/* Desktop Table */}
            <div className="ops-table-wrapper ops-desktop-only">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('ops.monthlyBookings')}</th>
                    <th>{t('ops.monthlyRevenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="ops-table-row-hover">
                      <td><span className="ops-hotel-name">{hotel.name}</span></td>
                      <td>{hotel.bookingsThisMonth}</td>
                      <td>{formatCurrency(hotel.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="ops-mobile-card-list ops-mobile-only-block">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="ops-mobile-card">
                  <div className="ops-mobile-card-header">
                    <span className="ops-mobile-card-title">{hotel.name}</span>
                  </div>
                  <div className="ops-mobile-card-body">
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.monthlyBookings')}</span>
                      <span>{hotel.bookingsThisMonth}</span>
                    </div>
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.monthlyRevenue')}</span>
                      <span className="ops-mobile-card-amount">{formatCurrency(hotel.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Issues Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ops.issues')}</CardTitle>
          </CardHeader>
          <CardBody>
            {incidents.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={32} strokeWidth={1.5} />}
                title={t('ops.noIssues')}
                description={t('ops.noIssuesDesc')}
              />
            ) : (
              <div className="ops-issue-list">
                {incidents.map((incident) => (
                  <div key={incident.id} className="ops-issue-item" style={{ borderLeft: `3px solid ${severityColors[incident.severity] || 'var(--border-color)'}` }}>
                    <div className="ops-issue-header">
                      <Badge variant={incident.severity === 'high' || incident.severity === 'critical' ? 'error' : incident.severity === 'medium' ? 'warning' : 'neutral'} size="sm">
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={incident.status === 'resolved' || incident.status === 'closed' ? 'success' : 'warning'} size="sm">
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="ops-issue-summary">{incident.summary}</p>
                    <span className="ops-issue-meta">{incident.sitterName} &middot; {incident.childName}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Today's Sessions + Sitter Availability */}
      <div className="ops-grid-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Clock size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {t('ops.todaySessions')}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {sessions.length === 0 ? (
              <EmptyState
                icon={<Calendar size={32} strokeWidth={1.5} />}
                title={t('ops.noActiveSessions')}
                description={t('ops.noActiveSessionsDesc')}
              />
            ) : (
              <div className="ops-session-list">
                {sessions.map((session) => (
                  <div key={session.id} className="ops-session-item">
                    <Avatar name={session.sitter.name} size="sm" variant={session.sitter.tier === 'gold' ? 'gold' : 'default'} />
                    <div className="ops-session-info">
                      <span className="ops-session-sitter">{session.sitter.name}</span>
                      <span className="ops-session-meta">{session.childrenText} &middot; {session.startTime}</span>
                    </div>
                    <Badge variant="success" size="sm">{session.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Users size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {t('ops.sitterAvailability')}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="ops-availability-grid">
              <div className="ops-availability-item">
                <div className="ops-availability-count ops-avail-available">{sitterAvailability.Available}</div>
                <div className="ops-availability-label">{t('ops.available')}</div>
              </div>
              <div className="ops-availability-item">
                <div className="ops-availability-count ops-avail-busy">{sitterAvailability.Busy}</div>
                <div className="ops-availability-label">{t('ops.busy')}</div>
              </div>
              <div className="ops-availability-item">
                <div className="ops-availability-count ops-avail-leave">{sitterAvailability['On Leave']}</div>
                <div className="ops-availability-label">{t('ops.onLeave')}</div>
              </div>
              <div className="ops-availability-item">
                <div className="ops-availability-count ops-avail-offline">{sitterAvailability.Offline}</div>
                <div className="ops-availability-label">{t('ops.offline')}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
