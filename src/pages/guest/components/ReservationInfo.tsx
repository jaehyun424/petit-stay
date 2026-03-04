import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Building, Baby } from 'lucide-react';
import { TierBadge } from '../../../components/common/Badge';
import { formatCurrency } from '../../../utils/format';

interface ReservationInfoProps {
  reservation: {
    hotelName: string;
    roomNumber: string;
    date: string;
    time: string;
    children: { name: string; age: number }[];
    sitterName?: string;
    sitterTier?: 'gold' | 'silver';
    totalAmount: number;
    confirmationCode: string;
  };
  onNext: () => void;
}

export function ReservationInfo({ reservation, onNext }: ReservationInfoProps) {
  const { t } = useTranslation();

  const infoCards = [
    { icon: <Building size={20} />, label: t('guest.hotelLabel'), value: `${reservation.hotelName} · ${t('guest.roomLabel')} ${reservation.roomNumber}` },
    { icon: <Calendar size={20} />, label: t('guest.dateLabel'), value: reservation.date },
    { icon: <Clock size={20} />, label: t('guest.timeLabel'), value: reservation.time },
    { icon: <Baby size={20} />, label: t('guest.childrenLabel'), value: reservation.children.map((c) => `${c.name} (${c.age})`).join(', ') },
  ];

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.reservationDetails')}</h2>

      <div className="guest-info-cards">
        {infoCards.map((item, i) => (
          <div key={i} className="guest-info-card">
            <div className="guest-info-card-icon">{item.icon}</div>
            <div className="guest-info-card-content">
              <span className="guest-info-label">{item.label}</span>
              <span className="guest-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {reservation.sitterName && (
        <div className="guest-info-sitter-row">
          <span className="guest-info-label">{t('guest.sitterLabel')}</span>
          <span className="guest-info-value guest-info-sitter">
            {reservation.sitterName}
            {reservation.sitterTier && <TierBadge tier={reservation.sitterTier} />}
          </span>
        </div>
      )}

      <div className="guest-info-total-row">
        <span className="guest-info-label">{t('guest.totalAmount')}</span>
        <span className="guest-info-total-amount">{formatCurrency(reservation.totalAmount)}</span>
      </div>

      <button className="guest-btn guest-btn-primary" onClick={onNext}>
        {t('guest.nextStep')}
      </button>
    </div>
  );
}
