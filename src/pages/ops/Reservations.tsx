import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Calendar, CheckSquare, Search } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Input, Select } from '../../components/common/Input';
import { StatusBadge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

const PAGE_SIZE = 15;

export default function OpsReservations() {
  const { t } = useTranslation();
  const { bookings, hotels, isLoading } = useOpsData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    setPage(1);
    return bookings.filter((b) => {
      const matchesSearch = !search || b.confirmationCode.toLowerCase().includes(search.toLowerCase()) || b.parent.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || b.status === statusFilter;
      const matchesDate = !dateFilter || b.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((b) => b.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="ops-page animate-fade-in">
        <Skeleton width="240px" height="2rem" />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Skeleton height="48px" />
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.allReservations')}</h1>
          <p className="page-subtitle">{t('ops.reservationCount', { count: filtered.length })}</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="ops-batch-bar">
            <span className="ops-batch-count">{t('ops.selectedCount', { count: selectedIds.size })}</span>
            <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>{t('common.cancel')}</Button>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="filters-row filters-row-3">
            <Input placeholder={t('ops.searchReservations')} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)} options={[
              { value: '', label: t('ops.allHotels') },
              ...hotels.map((h) => ({ value: h.id, label: h.name })),
            ]} />
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
                  <th style={{ width: 40 }}>
                    <button className="ops-checkbox-btn" onClick={toggleSelectAll} aria-label="Select all">
                      <CheckSquare size={16} strokeWidth={selectedIds.size === paged.length && paged.length > 0 ? 2.5 : 1.5} />
                    </button>
                  </th>
                  <th>{t('hotel.bookingCode')}</th>
                  <th>{t('hotel.guestRoom')}</th>
                  <th>{t('auth.sitter')}</th>
                  <th>{t('hotel.status')}</th>
                  <th>{t('hotel.amount')}</th>
                </tr>
              </thead>
              <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                {paged.length === 0 && (
                  <tr><td colSpan={6}>
                    <EmptyState
                      icon={<Calendar size={32} strokeWidth={1.5} />}
                      title={t('ops.noReservations')}
                      description={t('ops.noReservationsDesc')}
                    />
                  </td></tr>
                )}
                {paged.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    variants={staggerItem}
                    className={`ops-table-row-hover ${selectedIds.has(booking.id) ? 'ops-row-selected' : ''}`}
                  >
                    <td>
                      <button className="ops-checkbox-btn" onClick={() => toggleSelect(booking.id)} aria-label="Select row">
                        <CheckSquare size={16} strokeWidth={selectedIds.has(booking.id) ? 2.5 : 1.5} />
                      </button>
                    </td>
                    <td>
                      <span className="booking-code">{booking.confirmationCode}</span>
                      <br /><span className="text-xs text-muted">{booking.date} {booking.time}</span>
                    </td>
                    <td>{booking.parent.name}<br /><span className="text-xs text-muted">{t('common.room')} {booking.room}</span></td>
                    <td>
                      {booking.sitter ? (
                        <div className="sitter-cell">
                          <Avatar name={booking.sitter.name} size="sm" />
                          <span>{booking.sitter.name}</span>
                          <TierBadge tier={booking.sitter.tier} />
                        </div>
                      ) : <span className="text-muted">{t('ops.unassigned')}</span>}
                    </td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>{formatCurrency(booking.totalAmount)}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
