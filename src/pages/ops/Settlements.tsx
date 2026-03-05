import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useSettlements } from '../../hooks/useSettlements';
import ErrorBanner from '../../components/common/ErrorBanner';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';

export default function OpsSettlements() {
  const { t } = useTranslation();
  const { settlements, isLoading, approveSettlement, markAsPaid, error, retry } = useSettlements();
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'pay'; id: string; name: string } | null>(null);

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

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      {error && <ErrorBanner error={error} onRetry={retry} />}
      <div className="page-header">
        <h1 className="page-title">{t('ops.totalSettlements')}</h1>
      </div>

      <Card>
        <CardBody>
          {settlements.length === 0 ? (
            <EmptyState
              icon={<Wallet size={32} strokeWidth={1.5} />}
              title={t('ops.noSettlements')}
              description={t('ops.noSettlementsDesc')}
            />
          ) : (
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
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="ops-table-row-hover">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardBody>
      </Card>

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
