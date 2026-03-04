import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';

export default function OpsHotelManagement() {
  const { t } = useTranslation();
  const { hotels, isLoading } = useOpsData();

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.hotelList')}</h1>
      </div>

      <Card>
        <CardBody>
          <div className="ops-table-wrapper">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('ops.tier')}</th>
                  <th>{t('ops.monthlyBookings')}</th>
                  <th>{t('ops.monthlyRevenue')}</th>
                  <th>{t('ops.commissionRate')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td><span className="ops-hotel-name">{hotel.name}</span></td>
                    <td><Badge variant={hotel.tier === 'luxury' ? 'gold' : 'primary'} size="sm">{hotel.tier}</Badge></td>
                    <td>{hotel.bookingsThisMonth}</td>
                    <td>{formatCurrency(hotel.revenue)}</td>
                    <td>15%</td>
                    <td><Button variant="secondary" size="sm">{t('ops.editHotel')}</Button></td>
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
