import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2 } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { useOpsData } from '../../hooks/useOpsData';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

interface EditHotelForm {
  name: string;
  tier: string;
  commission: string;
}

export default function OpsHotelManagement() {
  const { t } = useTranslation();
  const { hotels, stats, isLoading } = useOpsData();
  const toast = useToast();
  const [editHotel, setEditHotel] = useState<{ id: string; form: EditHotelForm } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const slaScoresRef = useRef<Record<string, number>>({});
  const getSlaScore = (hotelId: string) => {
    if (!(hotelId in slaScoresRef.current)) {
      slaScoresRef.current[hotelId] = 90 + Math.floor(Math.random() * 10);
    }
    return slaScoresRef.current[hotelId];
  };

  const filteredHotels = useMemo(() => hotels.filter((h) => {
    const matchesSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = !tierFilter || h.tier === tierFilter;
    return matchesSearch && matchesTier;
  }), [hotels, searchQuery, tierFilter]);

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

  if (isLoading) {
    return (
      <div className="ops-page animate-fade-in">
        <Skeleton width="240px" height="2rem" />
        <div className="ops-sla-grid mb-6" style={{ marginTop: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="80px" />)}
        </div>
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.hotelList')}</h1>
          <p className="page-subtitle">{t('ops.hotelCount', { count: hotels.length })}</p>
        </div>
      </div>

      {/* SLA Overview */}
      <motion.div className="ops-sla-grid mb-6" initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="ops-sla-item" variants={staggerItem}>
          <div className="ops-sla-value" style={{ color: stats.slaCompliance >= 95 ? 'var(--success-500)' : stats.slaCompliance >= 80 ? 'var(--warning-500)' : 'var(--error-500)' }}>
            <AnimatedCounter target={stats.slaCompliance} duration={1.2} />%
          </div>
          <div className="ops-sla-label">{t('ops.slaCompliance')}</div>
        </motion.div>
        <motion.div className="ops-sla-item" variants={staggerItem}>
          <div className="ops-sla-value">
            <AnimatedCounter target={hotels.length} duration={1} />
          </div>
          <div className="ops-sla-label">{t('ops.totalHotels')}</div>
        </motion.div>
        <motion.div className="ops-sla-item" variants={staggerItem}>
          <div className="ops-sla-value" style={{ color: stats.avgSatisfaction >= 4.5 ? 'var(--success-500)' : 'var(--warning-500)' }}>
            {stats.avgSatisfaction.toFixed(1)}
          </div>
          <div className="ops-sla-label">{t('ops.avgSatisfaction')}</div>
        </motion.div>
        <motion.div className="ops-sla-item" variants={staggerItem}>
          <div className="ops-sla-value">
            <AnimatedCounter target={stats.totalBookingsThisMonth} duration={1.2} />
          </div>
          <div className="ops-sla-label">{t('ops.monthlyBookings')}</div>
        </motion.div>
      </motion.div>

      {/* Search/Filter */}
      <Card className="mb-6">
        <CardBody>
          <div className="filters-row">
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} options={[
              { value: '', label: t('ops.allTiers') },
              { value: 'luxury', label: 'Luxury' },
              { value: 'premium', label: 'Premium' },
              { value: 'standard', label: 'Standard' },
            ]} />
          </div>
        </CardBody>
      </Card>

      {filteredHotels.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Building2 size={32} strokeWidth={1.5} />}
              title={t('ops.noHotels')}
              description={t('ops.noHotelsDesc')}
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
                      <th>{t('common.name')}</th>
                      <th>{t('ops.tier')}</th>
                      <th>{t('ops.contractInfo')}</th>
                      <th>{t('ops.monthlyBookings')}</th>
                      <th>{t('ops.monthlyRevenue')}</th>
                      <th>{t('ops.commissionRate')}</th>
                      <th>{t('ops.slaScore')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                    {filteredHotels.map((hotel) => {
                      const slaScore = getSlaScore(hotel.id);
                      return (
                        <motion.tr key={hotel.id} variants={staggerItem} className="ops-table-row-hover">
                          <td><span className="ops-hotel-name">{hotel.name}</span></td>
                          <td><Badge variant={hotel.tier === 'luxury' ? 'gold' : 'primary'} size="sm">{hotel.tier}</Badge></td>
                          <td><Badge variant="success" size="sm">{t('ops.activeContract')}</Badge></td>
                          <td>{hotel.bookingsThisMonth}</td>
                          <td>{formatCurrency(hotel.revenue)}</td>
                          <td>15%</td>
                          <td>
                            <span style={{ color: slaScore >= 95 ? 'var(--success-500)' : slaScore >= 85 ? 'var(--warning-500)' : 'var(--error-500)', fontWeight: 600 }}>
                              {slaScore}%
                            </span>
                          </td>
                          <td><Button variant="secondary" size="sm" onClick={() => handleEditClick(hotel)}>{t('ops.editHotel')}</Button></td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Mobile Card List */}
          <motion.div className="ops-mobile-card-list ops-mobile-only-block" initial="hidden" animate="show" variants={staggerContainer}>
            {filteredHotels.map((hotel) => {
              const slaScore = getSlaScore(hotel.id);
              return (
                <motion.div key={hotel.id} variants={staggerItem}>
                  <div className="ops-mobile-card">
                    <div className="ops-mobile-card-header">
                      <span className="ops-mobile-card-title">{hotel.name}</span>
                      <Badge variant={hotel.tier === 'luxury' ? 'gold' : 'primary'} size="sm">{hotel.tier}</Badge>
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
                      <div className="ops-mobile-card-row">
                        <span className="ops-mobile-card-label">{t('ops.slaScore')}</span>
                        <span style={{ color: slaScore >= 95 ? 'var(--success-500)' : slaScore >= 85 ? 'var(--warning-500)' : 'var(--error-500)', fontWeight: 600 }}>
                          {slaScore}%
                        </span>
                      </div>
                      <div className="ops-mobile-card-row">
                        <span className="ops-mobile-card-label">{t('ops.commissionRate')}</span>
                        <span>15%</span>
                      </div>
                    </div>
                    <div className="ops-mobile-card-footer">
                      <Badge variant="success" size="sm">{t('ops.activeContract')}</Badge>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(hotel)}>{t('ops.editHotel')}</Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

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
