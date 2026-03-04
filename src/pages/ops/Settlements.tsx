import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useSettlements } from '../../hooks/useSettlements';
import { Skeleton } from '../../components/common/Skeleton';

export default function OpsSettlements() {
  const { t } = useTranslation();
  const { settlements, isLoading, approveSettlement, markAsPaid } = useSettlements();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success' as const;
      case 'approved': return 'primary' as const;
      case 'pending_approval': return 'warning' as const;
      default: return 'neutral' as const;
    }
  };

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.totalSettlements')}</h1>
      </div>

      <Card>
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
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td><span className="ops-hotel-name">{s.hotelName}</span></td>
                    <td>{s.period}</td>
                    <td>{s.totalBookings}</td>
                    <td>{formatCurrency(s.totalRevenue)}</td>
                    <td>{formatCurrency(s.commission)} ({s.commissionRate}%)</td>
                    <td className="ops-amount-bold">{formatCurrency(s.netPayout)}</td>
                    <td><Badge variant={statusVariant(s.status)} size="sm">{s.status.replace('_', ' ')}</Badge></td>
                    <td>
                      {s.status === 'pending_approval' && (
                        <Button variant="gold" size="sm" onClick={() => approveSettlement(s.id)}>{t('ops.approveSettlement')}</Button>
                      )}
                      {s.status === 'approved' && (
                        <Button variant="primary" size="sm" onClick={() => markAsPaid(s.id)}>{t('ops.markAsPaid')}</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
