import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Input, Select } from '../../components/common/Input';
import { StatusBadge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';

export default function OpsReservations() {
  const { t } = useTranslation();
  const { bookings, isLoading } = useOpsData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesSearch = !search || b.confirmationCode.toLowerCase().includes(search.toLowerCase()) || b.parent.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.allReservations')}</h1>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="filters-row">
            <Input placeholder={t('ops.searchReservations')} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: '', label: t('ops.allStatuses') },
              { value: 'pending', label: t('status.pending') },
              { value: 'confirmed', label: t('status.confirmed') },
              { value: 'in_progress', label: t('status.inProgress') },
              { value: 'completed', label: t('status.completed') },
              { value: 'cancelled', label: t('status.cancelled') },
            ]} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="ops-table-wrapper">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t('hotel.bookingCode')}</th>
                  <th>{t('hotel.guestRoom')}</th>
                  <th>{t('auth.sitter')}</th>
                  <th>{t('hotel.status')}</th>
                  <th>{t('hotel.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className="booking-code">{booking.confirmationCode}</span>
                      <br /><span className="text-xs text-muted">{booking.date} {booking.time}</span>
                    </td>
                    <td>{booking.parent.name}<br /><span className="text-xs text-muted">Room {booking.room}</span></td>
                    <td>
                      {booking.sitter ? (
                        <div className="sitter-cell">
                          <Avatar name={booking.sitter.name} size="sm" />
                          <span>{booking.sitter.name}</span>
                          <TierBadge tier={booking.sitter.tier} />
                        </div>
                      ) : <span className="text-muted">Unassigned</span>}
                    </td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>{formatCurrency(booking.totalAmount)}</td>
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
