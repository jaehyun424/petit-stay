// ============================================
// Petit Stay - Ops Dashboard
// ============================================

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2, Users, Calendar, DollarSign, Star, AlertTriangle, Wallet, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useOpsData } from '../../hooks/useOpsData';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

export default function OpsDashboard() {
  const { t } = useTranslation();
  const { stats, hotels, incidents, isLoading } = useOpsData();

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

  return (
    <div className="ops-dashboard animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.dashboard')}</h1>
          <p className="page-subtitle">{t('ops.title')}</p>
        </div>
      </div>

      <motion.div className="ops-stats-grid" initial="hidden" animate="show" variants={staggerContainer}>
        {statCards.map((stat, i) => (
          <motion.div key={i} className={`ops-stat-card ops-stat-${stat.color}`} variants={staggerItem}>
            <div className="ops-stat-icon">{stat.icon}</div>
            <div className="ops-stat-content">
              <div className="ops-stat-value">{stat.value}</div>
              <div className="ops-stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="ops-grid-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('ops.hotelManagement')}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="ops-table-wrapper">
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
                    <tr key={hotel.id}>
                      <td><span className="ops-hotel-name">{hotel.name}</span></td>
                      <td>{hotel.bookingsThisMonth}</td>
                      <td>{formatCurrency(hotel.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('ops.issues')}</CardTitle>
          </CardHeader>
          <CardBody>
            {incidents.length === 0 ? (
              <p className="ops-empty">{t('ops.noData')}</p>
            ) : (
              <div className="ops-issue-list">
                {incidents.map((incident) => (
                  <div key={incident.id} className="ops-issue-item">
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
    </div>
  );
}
