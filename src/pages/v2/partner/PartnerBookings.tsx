import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PartnerV2Layout } from '../../../components/layout/PartnerV2Layout';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'active' | 'completed';

interface DemoBooking {
  id: string;
  date: string;
  dateKo: string;
  time: string;
  sitter: string;
  status: Exclude<BookingStatus, 'all'>;
}

const DEMO_BOOKINGS: DemoBooking[] = [
  { id: 'B-001', date: 'Mar 12', dateKo: '3월 12일', time: '18:00–22:00', sitter: 'Alice Kim', status: 'active' },
  { id: 'B-002', date: 'Mar 12', dateKo: '3월 12일', time: '19:00–23:00', sitter: 'Yuna Park', status: 'active' },
  { id: 'B-003', date: 'Mar 13', dateKo: '3월 13일', time: '18:00–21:00', sitter: 'Soyeon Lee', status: 'confirmed' },
  { id: 'B-004', date: 'Mar 13', dateKo: '3월 13일', time: '19:00–22:00', sitter: 'Alice Kim', status: 'pending' },
  { id: 'B-005', date: 'Mar 14', dateKo: '3월 14일', time: '18:00–22:00', sitter: 'Mina Choi', status: 'pending' },
  { id: 'B-006', date: 'Mar 10', dateKo: '3월 10일', time: '18:00–22:00', sitter: 'Alice Kim', status: 'completed' },
  { id: 'B-007', date: 'Mar 9', dateKo: '3월 9일', time: '19:00–23:00', sitter: 'Yuna Park', status: 'completed' },
  { id: 'B-008', date: 'Mar 8', dateKo: '3월 8일', time: '18:00–21:00', sitter: 'Soyeon Lee', status: 'completed' },
];

const STATUS_LABELS: Record<Exclude<BookingStatus, 'all'>, { en: string; ko: string }> = {
  pending: { en: 'Pending', ko: '대기' },
  confirmed: { en: 'Confirmed', ko: '확정' },
  active: { en: 'In Progress', ko: '진행 중' },
  completed: { en: 'Completed', ko: '완료' },
};

const FILTER_OPTIONS: { value: BookingStatus; en: string; ko: string }[] = [
  { value: 'all', en: 'All', ko: '전체' },
  { value: 'pending', en: 'Pending', ko: '대기' },
  { value: 'confirmed', en: 'Confirmed', ko: '확정' },
  { value: 'active', en: 'Active', ko: '진행' },
  { value: 'completed', en: 'Completed', ko: '완료' },
];

export default function PartnerBookings() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const [filter, setFilter] = useState<BookingStatus>('all');

  const filtered = filter === 'all'
    ? DEMO_BOOKINGS
    : DEMO_BOOKINGS.filter((b) => b.status === filter);

  return (
    <PartnerV2Layout
      title="Bookings"
      titleKo="예약 현황"
      subtitle={`${DEMO_BOOKINGS.length} bookings via your channel`}
      subtitleKo={`내 채널 경유 예약 ${DEMO_BOOKINGS.length}건`}
      showBack
    >
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`pt-btn ${filter === opt.value ? 'pt-btn-primary' : 'pt-btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-xs)' }}
            onClick={() => setFilter(opt.value)}
          >
            {isKo ? opt.ko : opt.en}
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="pt-booking-list">
        {filtered.length === 0 ? (
          <div className="pt-empty">
            {isKo ? '해당하는 예약이 없습니다' : 'No bookings found'}
          </div>
        ) : (
          filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              className="pt-booking-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="pt-booking-header">
                <span className="pt-booking-date">
                  {isKo ? booking.dateKo : booking.date} · {booking.time}
                </span>
                <span className={`pt-status pt-status--${booking.status}`}>
                  {isKo ? STATUS_LABELS[booking.status].ko : STATUS_LABELS[booking.status].en}
                </span>
              </div>
              <div className="pt-booking-meta">
                <span>{isKo ? '시터' : 'Sitter'}: {booking.sitter}</span>
                <span>{isKo ? '예약 번호' : 'Booking'}: {booking.id}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </PartnerV2Layout>
  );
}
