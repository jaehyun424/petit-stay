import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';

export default function OpsReports() {
  const { t } = useTranslation();
  const { stats, hotels, isLoading } = useOpsData();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  const totalRevenue = hotels.reduce((sum, h) => sum + h.revenue, 0);
  const totalCommission = hotels.reduce((sum, h) => sum + h.commission, 0);

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.reports')}</h1>
          <p className="page-subtitle">{t('ops.revenueBreakdown')}</p>
        </div>
        <Button variant="gold" icon={<Download size={20} />}>{t('ops.exportData')}</Button>
      </div>

      <div className="ops-grid-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('ops.revenueBreakdown')}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="ops-table-wrapper">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>{t('ops.hotel')}</th>
                    <th>{t('ops.revenue')}</th>
                    <th>{t('ops.commission')}</th>
                    <th>{t('ops.net')}</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((hotel) => (
                    <tr key={hotel.id}>
                      <td>{hotel.name}</td>
                      <td>{formatCurrency(hotel.revenue)}</td>
                      <td>{formatCurrency(hotel.commission)}</td>
                      <td className="ops-amount-bold">{formatCurrency(hotel.revenue - hotel.commission)}</td>
                    </tr>
                  ))}
                  <tr className="ops-table-total">
                    <td><strong>{t('ops.total')}</strong></td>
                    <td><strong>{formatCurrency(totalRevenue)}</strong></td>
                    <td><strong>{formatCurrency(totalCommission)}</strong></td>
                    <td className="ops-amount-bold"><strong>{formatCurrency(totalRevenue - totalCommission)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('ops.slaReport')}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="ops-sla-grid">
              <div className="ops-sla-item">
                <div className="ops-sla-value">{stats.slaCompliance}%</div>
                <div className="ops-sla-label">{t('ops.slaCompliance')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value">{stats.avgSatisfaction}</div>
                <div className="ops-sla-label">{t('ops.avgSatisfaction')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value">{stats.openIssues}</div>
                <div className="ops-sla-label">{t('ops.openIssues')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value">{stats.totalBookingsThisMonth}</div>
                <div className="ops-sla-label">{t('ops.monthlyBookings')}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
