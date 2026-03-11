import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, XCircle, Star } from 'lucide-react';

type BookingStatus = 'confirmed' | 'in-progress' | 'completed';

interface Props {
  status: BookingStatus;
  bookingId: string;
  sitterPhone?: string;
}

export function BookingActions({ status, bookingId, sitterPhone }: Props) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';

  return (
    <div className="bd-actions">
      {/* Contact buttons for confirmed / in-progress */}
      {(status === 'confirmed' || status === 'in-progress') && (
        <div className="bd-contact-row">
          <a href={`tel:${sitterPhone || '+82-10-0000-0000'}`} className="bd-action-btn bd-action-secondary">
            <Phone size={18} />
            {isKo ? '전화하기' : 'Call'}
          </a>
          <button className="bd-action-btn bd-action-secondary" onClick={() => alert(isKo ? '메시지 기능 준비 중' : 'Messaging coming soon')}>
            <MessageCircle size={18} />
            {isKo ? '메시지' : 'Message'}
          </button>
        </div>
      )}

      {/* Cancel for confirmed only */}
      {status === 'confirmed' && (
        <button
          className="bd-action-btn bd-action-cancel"
          onClick={() => alert(isKo ? '취소 기능 준비 중' : 'Cancellation coming soon')}
        >
          <XCircle size={18} />
          {isKo ? '예약 취소' : 'Cancel Booking'}
        </button>
      )}

      {/* Review CTA for completed */}
      {status === 'completed' && (
        <button
          className="bd-action-btn bd-action-primary"
          onClick={() => navigate(`/review/${bookingId}`)}
        >
          <Star size={18} />
          {isKo ? '리뷰 작성하기' : 'Write a Review'}
        </button>
      )}
    </div>
  );
}
