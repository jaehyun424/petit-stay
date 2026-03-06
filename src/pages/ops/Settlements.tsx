import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Wallet } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useSettlements } from '../../hooks/useSettlements';
import ErrorBanner from '../../components/common/ErrorBanner';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

export default function OpsSettlements() {
  const { t } = useTranslation();
  const { settlements, isLoading, approveSettlement, markAsPaid, error, retry } = useSettlements();
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'pay'; id: string; name: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  const periods = useMemo(() => [...new Set(settlements.map((s) => s.period))], [settlements]);

  const filtered = useMemo(() => settlements.filter((s) => {
    const matchesStatus = !statusFilter || s.status === statusFilter;
    const matchesPeriod = !periodFilter || s.period === periodFilter;
    return matchesStatus && matchesPeriod;
  }), [settlements, statusFilter, periodFilter]);

  const totals = useMemo(() => {
    const pending = filtered.filter((s) => s.status === 'pending_approval').reduce((sum, s) => sum + s.netPayout, 0);
    const approved = filtered.filter((s) => s.status === 'approved').reduce((sum, s) => sum + s.netPayout, 0);
    const paid = filtered.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.netPayout, 0);
    return { pending, approved, paid, total: pending + approved + paid };
  }, [filtered]);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success' as const;
      case 'approved': return 'gold' as const;
      case 'pending_approval': return 'warning' as const;
      default: return 'neutral' as const;
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      approveSettlement(confirmAction.id);
    } else {
      markAsPaid(confirmAction.id);
    }
    setConfirmAction(null);
  };

  if (isLoading) {
    return (
      <div className="ops-page animate-fade-in">
        <Skeleton width="240px" height="2rem" />
        <div className="ops-summary-bar" style={{ marginTop: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="80px" />)}
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}><Skeleton height="400px" /></div>
      </div>
    );
  }

  return (
    <div className="ops-page animate-fade-in">
      {error && <ErrorBanner error={error} onRetry={retry} />}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.totalSettlements')}</h1>
          <p className="page-subtitle">{t('ops.settlementSummary', { count: filtered.length })}</p>
        </div>
      </div>

      {/* Summary Bar */}
      <motion.div className="ops-summary-bar mb-6" initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="ops-summary-item" variants={staggerItem}>
          <div className="ops-summary-value" style={{ color: 'var(--warning-500)' }}>{formatCurrency(totals.pending)}</div>
          <div className="ops-summary-label">{t('ops.totalPending')}</div>
        </motion.div>
        <motion.div className="ops-summary-item" variants={staggerItem}>
          <div className="ops-summary-value" style={{ color: 'var(--gold-600)' }}>{formatCurrency(totals.approved)}</div>
          <div className="ops-summary-label">{t('ops.totalApproved')}</div>
        </motion.div>
        <motion.div className="ops-summary-item" variants={staggerItem}>
          <div className="ops-summary-value" style={{ color: 'var(--success-500)' }}>{formatCurrency(totals.paid)}</div>
          <div className="ops-summary-label">{t('ops.totalPaid')}</div>
        </motion.div>
        <motion.div className="ops-summary-item" variants={staggerItem}>
          <div className="ops-summary-value">{formatCurrency(totals.total)}</div>
          <div className="ops-summary-label">{t('ops.total')}</div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="filters-row">
            <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} options={[
              { value: '', label: t('ops.allPeriods') },
              ...periods.map((p) => ({ value: p, label: p })),
            ]} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: '', label: t('ops.allStatuses') },
              { value: 'pending_approval', label: t('ops.totalPending') },
              { value: 'approved', label: t('ops.totalApproved') },
              { value: 'paid', label: t('ops.totalPaid') },
            ]} />
          </div>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Wallet size={32} strokeWidth={1.5} />}
              title={t('ops.noSettlements')}
              description={t('ops.noSettlementsDesc')}
            />
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="ops-desktop-only">
            <CardBody>
              <div className="ops-table-wrapper">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>{t('ops.hotel')}</th>
                      <th>{t('ops.settlementPeriod')}</th>
                      <th>{t('ops.bookings')}</th>
                      <th>{t('ops.monthlyRevenue')}</th>
                      <th>{t('ops.commission')}</th>
                      <th>{t('ops.netPayout')}</th>
                      <th>{t('ops.settlementStatus')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                    {filtered.map((s) => (
                      <motion.tr key={s.id} variants={staggerItem} className="ops-table-row-hover">
                        <td><span className="ops-hotel-name">{s.hotelName}</span></td>
                        <td>{s.period}</td>
                        <td>{s.totalBookings}</td>
                        <td>{formatCurrency(s.totalRevenue)}</td>
                        <td>{formatCurrency(s.commission)} ({s.commissionRate}%)</td>
                        <td className="ops-amount-bold">{formatCurrency(s.netPayout)}</td>
                        <td><Badge variant={statusVariant(s.status)} size="sm">{s.status.replace('_', ' ')}</Badge></td>
                        <td>
                          {s.status === 'pending_approval' && (
                            <Button variant="gold" size="sm" onClick={() => setConfirmAction({ type: 'approve', id: s.id, name: s.hotelName })}>{t('ops.approveSettlement')}</Button>
                          )}
                          {s.status === 'approved' && (
                            <Button variant="primary" size="sm" onClick={() => setConfirmAction({ type: 'pay', id: s.id, name: s.hotelName })}>{t('ops.markAsPaid')}</Button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Mobile Card List */}
          <motion.div className="ops-mobile-card-list ops-mobile-only-block" initial="hidden" animate="show" variants={staggerContainer}>
            {filtered.map((s) => (
              <motion.div key={s.id} variants={staggerItem}>
                <div className="ops-mobile-card">
                  <div className="ops-mobile-card-header">
                    <span className="ops-mobile-card-title">{s.hotelName}</span>
                    <Badge variant={statusVariant(s.status)} size="sm">{s.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="ops-mobile-card-body">
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.settlementPeriod')}</span>
                      <span>{s.period}</span>
                    </div>
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.bookings')}</span>
                      <span>{s.totalBookings}</span>
                    </div>
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.monthlyRevenue')}</span>
                      <span>{formatCurrency(s.totalRevenue)}</span>
                    </div>
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.commission')}</span>
                      <span>{formatCurrency(s.commission)} ({s.commissionRate}%)</span>
                    </div>
                    <div className="ops-mobile-card-row">
                      <span className="ops-mobile-card-label">{t('ops.netPayout')}</span>
                      <span className="ops-mobile-card-amount">{formatCurrency(s.netPayout)}</span>
                    </div>
                  </div>
                  <div className="ops-mobile-card-footer">
                    {s.status === 'pending_approval' && (
                      <Button variant="gold" size="sm" onClick={() => setConfirmAction({ type: 'approve', id: s.id, name: s.hotelName })}>{t('ops.approveSettlement')}</Button>
                    )}
                    {s.status === 'approved' && (
                      <Button variant="primary" size="sm" onClick={() => setConfirmAction({ type: 'pay', id: s.id, name: s.hotelName })}>{t('ops.markAsPaid')}</Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'approve' ? t('ops.approveSettlement') : t('ops.markAsPaid')}
        message={t('ops.confirmSettlementAction', { hotel: confirmAction?.name || '' })}
        confirmText={confirmAction?.type === 'approve' ? t('ops.approveSettlement') : t('ops.markAsPaid')}
        variant={confirmAction?.type === 'approve' ? 'warning' : 'primary'}
      />
    </div>
  );
}
