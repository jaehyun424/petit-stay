import { useTranslation } from 'react-i18next';
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

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.reservationDetails')}</h2>
      <div className="guest-info-grid">
        <div className="guest-info-item">
          <span className="guest-info-label">{t('guest.hotelLabel')}</span>
          <span className="guest-info-value">{reservation.hotelName}</span>
        </div>
        <div className="guest-info-item">
          <span className="guest-info-label">{t('guest.roomLabel')}</span>
          <span className="guest-info-value">{reservation.roomNumber}</span>
        </div>
        <div className="guest-info-item">
          <span className="guest-info-label">{t('guest.dateLabel')}</span>
          <span className="guest-info-value">{reservation.date}</span>
        </div>
        <div className="guest-info-item">
          <span className="guest-info-label">{t('guest.timeLabel')}</span>
          <span className="guest-info-value">{reservation.time}</span>
        </div>
        <div className="guest-info-item">
          <span className="guest-info-label">{t('guest.childrenLabel')}</span>
          <span className="guest-info-value">
            {reservation.children.map((c) => `${c.name} (${c.age})`).join(', ')}
          </span>
        </div>
        {reservation.sitterName && (
          <div className="guest-info-item">
            <span className="guest-info-label">{t('guest.sitterLabel')}</span>
            <span className="guest-info-value guest-info-sitter">
              {reservation.sitterName}
              {reservation.sitterTier && <TierBadge tier={reservation.sitterTier} />}
            </span>
          </div>
        )}
        <div className="guest-info-item guest-info-total">
          <span className="guest-info-label">{t('guest.totalAmount')}</span>
          <span className="guest-info-value">{formatCurrency(reservation.totalAmount)}</span>
        </div>
      </div>
      <button className="guest-btn guest-btn-primary" onClick={onNext}>
        {t('guest.nextStep')}
      </button>
    </div>
  );
}
