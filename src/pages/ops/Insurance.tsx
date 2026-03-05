// ============================================
// Petit Stay - Ops Insurance Dashboard
// ============================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Shield, FileCheck, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Input';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useInsurance } from '../../hooks/useInsurance';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

function getCoverageVariant(type: string): 'success' | 'primary' | 'warning' | 'neutral' {
    switch (type) {
        case 'comprehensive': return 'success';
        case 'liability': return 'primary';
        case 'accident': return 'warning';
        case 'property': return 'neutral';
        default: return 'neutral';
    }
}

function getClaimStatusVariant(status: string): 'success' | 'primary' | 'warning' | 'error' | 'neutral' {
    switch (status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'claimed': return 'primary';
        case 'expired': return 'error';
        default: return 'neutral';
    }
}

export default function OpsInsurance() {
    const { t } = useTranslation();
    const [claimStatusFilter, setClaimStatusFilter] = useState('');
    const {
        policies,
        bookingInsurance,
        activePolicies,
        totalCoverage,
        activeBookings,
        pendingClaims,
        claimedCount,
        totalClaimAmount,
        isLoading,
    } = useInsurance();

    const filteredBookingInsurance = useMemo(() => {
        if (!claimStatusFilter) return bookingInsurance;
        return bookingInsurance.filter((b) => b.status === claimStatusFilter);
    }, [bookingInsurance, claimStatusFilter]);

    if (isLoading) {
        return (
            <div className="ops-dashboard animate-fade-in">
                <Skeleton width="260px" height="2rem" />
                <div className="ops-stats-grid" style={{ marginTop: 'var(--space-6)' }}>
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="100px" />)}
                </div>
                <div className="ops-grid-2" style={{ marginTop: 'var(--space-4)' }}>
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                </div>
            </div>
        );
    }

    const statCards = [
        { icon: <Shield size={20} />, label: t('insurance.activePolicies'), value: activePolicies.length, color: 'success' },
        { icon: <FileCheck size={20} />, label: t('insurance.coveredBookings'), value: activeBookings, color: 'primary' },
        { icon: <AlertCircle size={20} />, label: t('insurance.pendingClaims'), value: pendingClaims, color: 'warning' },
        { icon: <DollarSign size={20} />, label: t('insurance.totalClaims'), value: claimedCount, color: 'error' },
    ];

    return (
        <div className="ops-dashboard animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('insurance.title')}</h1>
                    <p className="page-subtitle">{t('insurance.subtitle')}</p>
                </div>
            </div>

            {/* Stats */}
            <motion.div className="ops-stats-grid" initial="hidden" animate="show" variants={staggerContainer}>
                {statCards.map((stat, i) => (
                    <motion.div key={i} className={`ops-stat-card ops-stat-${stat.color}`} variants={staggerItem}>
                        <div className="ops-stat-icon">{stat.icon}</div>
                        <div className="ops-stat-content">
                            <div className="ops-stat-value">
                                <AnimatedCounter target={stat.value} duration={1.5} />
                            </div>
                            <div className="ops-stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Coverage Overview */}
            <div className="ops-grid-2">
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('insurance.totalCoverage', { amount: formatCurrency(totalCoverage) })}>
                            {t('insurance.policyOverview')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {policies.length === 0 ? (
                            <EmptyState
                                icon={<Shield size={32} strokeWidth={1.5} />}
                                title={t('insurance.noPolicies')}
                                description={t('insurance.noPoliciesDesc')}
                            />
                        ) : (
                            <div className="ops-table-wrapper">
                                <table className="ops-table">
                                    <thead>
                                        <tr>
                                            <th>{t('insurance.provider')}</th>
                                            <th>{t('insurance.policyNumber')}</th>
                                            <th>{t('insurance.coverageType')}</th>
                                            <th>{t('insurance.maxCoverage')}</th>
                                            <th>{t('insurance.status')}</th>
                                        </tr>
                                    </thead>
                                    <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                                        {policies.map((policy) => {
                                            const isActive = policy.validTo >= new Date();
                                            return (
                                                <motion.tr key={policy.id} variants={staggerItem} className="ops-table-row-hover">
                                                    <td><span className="ops-hotel-name">{policy.provider}</span></td>
                                                    <td><span className="booking-code">{policy.policyNumber}</span></td>
                                                    <td>
                                                        <Badge variant={getCoverageVariant(policy.coverageType)} size="sm">
                                                            {t(`insurance.type_${policy.coverageType}`)}
                                                        </Badge>
                                                    </td>
                                                    <td className="ops-amount-bold">{formatCurrency(policy.maxCoverage)}</td>
                                                    <td>
                                                        <Badge variant={isActive ? 'success' : 'error'} size="sm">
                                                            {isActive ? t('insurance.active') : t('insurance.expired')}
                                                        </Badge>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </motion.tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('insurance.claimAmount', { amount: formatCurrency(totalClaimAmount) })}>
                            {t('insurance.recentClaims')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {bookingInsurance.filter((b) => b.status === 'claimed').length === 0 ? (
                            <EmptyState
                                icon={<FileCheck size={32} strokeWidth={1.5} />}
                                title={t('insurance.noClaims')}
                                description={t('insurance.noClaimsDesc')}
                            />
                        ) : (
                            <div className="ops-issue-list">
                                {bookingInsurance
                                    .filter((b) => b.status === 'claimed')
                                    .map((bi) => (
                                        <div key={bi.bookingId} className="ops-issue-item" style={{ borderLeft: '3px solid var(--gold-500)' }}>
                                            <div className="ops-issue-header">
                                                <Badge variant="primary" size="sm">
                                                    {bi.bookingId}
                                                </Badge>
                                                <Badge variant={getClaimStatusVariant(bi.status)} size="sm">
                                                    {t(`insurance.status_${bi.status}`)}
                                                </Badge>
                                            </div>
                                            <p className="ops-issue-summary">{bi.claimDescription || t('insurance.noDescription')}</p>
                                            <span className="ops-issue-meta">
                                                {bi.claimAmount ? formatCurrency(bi.claimAmount) : ''} &middot; {bi.claimedAt?.toLocaleDateString() || ''}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* All Booking Insurance with Filter */}
            <Card>
                <CardHeader>
                    <CardTitle subtitle={t('insurance.totalBookingsCovered', { count: bookingInsurance.length })}>
                        {t('insurance.bookingCoverage')}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <div style={{ marginBottom: 'var(--space-4)', maxWidth: 240 }}>
                        <Select value={claimStatusFilter} onChange={(e) => setClaimStatusFilter(e.target.value)} options={[
                            { value: '', label: t('ops.allStatuses') },
                            { value: 'active', label: t('insurance.status_active') },
                            { value: 'pending', label: t('insurance.status_pending') },
                            { value: 'claimed', label: t('insurance.status_claimed') },
                            { value: 'expired', label: t('insurance.status_expired') },
                        ]} />
                    </div>
                    <div className="ops-table-wrapper">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th>{t('insurance.bookingId')}</th>
                                    <th>{t('insurance.policyId')}</th>
                                    <th>{t('insurance.status')}</th>
                                    <th>{t('insurance.claimAmountLabel')}</th>
                                </tr>
                            </thead>
                            <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                                {filteredBookingInsurance.map((bi) => (
                                    <motion.tr key={bi.bookingId} variants={staggerItem} className="ops-table-row-hover">
                                        <td><span className="booking-code">{bi.bookingId}</span></td>
                                        <td>{bi.policyId}</td>
                                        <td>
                                            <Badge variant={getClaimStatusVariant(bi.status)} size="sm">
                                                {t(`insurance.status_${bi.status}`)}
                                            </Badge>
                                        </td>
                                        <td>{bi.claimAmount ? formatCurrency(bi.claimAmount) : '-'}</td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
