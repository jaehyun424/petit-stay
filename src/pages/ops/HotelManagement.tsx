import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/useOpsData';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';

interface EditHotelForm {
  name: string;
  tier: string;
  commission: string;
}

export default function OpsHotelManagement() {
  const { t } = useTranslation();
  const { hotels, isLoading } = useOpsData();
  const toast = useToast();
  const [editHotel, setEditHotel] = useState<{ id: string; form: EditHotelForm } | null>(null);

  const handleEditClick = (hotel: { id: string; name: string; tier: string }) => {
    setEditHotel({
      id: hotel.id,
      form: { name: hotel.name, tier: hotel.tier, commission: '15' },
    });
  };

  const handleSaveEdit = () => {
    if (!editHotel) return;
    toast.success(t('ops.hotelUpdated'), editHotel.form.name);
    setEditHotel(null);
  };

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.hotelList')}</h1>
      </div>

      <Card>
        <CardBody>
          {hotels.length === 0 ? (
            <EmptyState
              icon={<Building2 size={32} strokeWidth={1.5} />}
              title={t('ops.noHotels')}
              description={t('ops.noHotelsDesc')}
            />
          ) : (
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
                  <tr key={hotel.id} className="ops-table-row-hover">
                    <td><span className="ops-hotel-name">{hotel.name}</span></td>
                    <td><Badge variant={hotel.tier === 'luxury' ? 'gold' : 'primary'} size="sm">{hotel.tier}</Badge></td>
                    <td>{hotel.bookingsThisMonth}</td>
                    <td>{formatCurrency(hotel.revenue)}</td>
                    <td>15%</td>
                    <td><Button variant="secondary" size="sm" onClick={() => handleEditClick(hotel)}>{t('ops.editHotel')}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardBody>
      </Card>

      {/* Edit Hotel Modal */}
      <Modal
        isOpen={!!editHotel}
        onClose={() => setEditHotel(null)}
        title={t('ops.editHotel')}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditHotel(null)}>{t('common.cancel')}</Button>
            <Button variant="gold" onClick={handleSaveEdit}>{t('common.save')}</Button>
          </>
        }
      >
        {editHotel && (
          <div className="ops-edit-form">
            <Input
              label={t('common.name')}
              value={editHotel.form.name}
              onChange={(e) => setEditHotel({ ...editHotel, form: { ...editHotel.form, name: e.target.value } })}
            />
            <Input
              label={t('ops.tier')}
              value={editHotel.form.tier}
              onChange={(e) => setEditHotel({ ...editHotel, form: { ...editHotel.form, tier: e.target.value } })}
            />
            <Input
              label={t('ops.commissionRate')}
              type="number"
              value={editHotel.form.commission}
              onChange={(e) => setEditHotel({ ...editHotel, form: { ...editHotel.form, commission: e.target.value } })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
