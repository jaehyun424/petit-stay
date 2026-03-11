import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock } from 'lucide-react';
import { sitterProfiles } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { OrderSummary } from './checkout/OrderSummary';
import { PaymentMethod, type CardType } from './checkout/PaymentMethod';
import { SafetyNotice } from './checkout/SafetyNotice';
import '../../styles/pages/v2-checkout.css';

const SERVICE_FEE_RATE = 0.15;

function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

interface BookingState {
  sitterId: string;
  schedule: { date: string; startTime: string; endTime: string; location: string };
  children: { name: string; age: string }[];
  emergency: { parentPhone: string; emergencyContact: string; specialRequests: string };
}

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const state = location.state as BookingState | null;
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!state?.sitterId) {
    return (
      <div className="co-page">
        <div className="co-not-found">
          <h2>{isKo ? '예약 정보를 찾을 수 없습니다' : 'Booking not found'}</h2>
          <Link to="/search" className="co-back-link">
            {isKo ? '시터 검색으로 돌아가기' : 'Back to search'}
          </Link>
        </div>
      </div>
    );
  }

  const sitter = sitterProfiles[state.sitterId];
  if (!sitter) {
    return (
      <div className="co-page">
        <div className="co-not-found">
          <h2>{isKo ? '시터 정보를 찾을 수 없습니다' : 'Sitter not found'}</h2>
          <Link to="/search" className="co-back-link">
            {isKo ? '시터 검색으로 돌아가기' : 'Back to search'}
          </Link>
        </div>
      </div>
    );
  }

  const { schedule, children } = state;
  const hours = calcHours(schedule.startTime, schedule.endTime);
  const subtotal = hours * sitter.hourlyRate;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const canPay = selectedCard !== null && !processing;

  const handlePay = () => {
    setProcessing(true);
    // Demo: simulate brief processing then confirm
    setTimeout(() => {
      navigate(`/booking/${bookingId}`, {
        state: { status: 'confirmed', sitterId: state.sitterId },
      });
    }, 1200);
  };

  return (
    <div className="co-page">
      {/* Nav */}
      <nav className="co-nav">
        <div className="co-nav-inner">
          <div className="co-nav-left">
            <button className="co-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="co-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="co-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="co-header">
        <h1 className="co-title">
          {isKo ? '결제 정보를 확인해 주세요' : 'Review your payment'}
        </h1>
        <p className="co-subtitle">
          {isKo ? '안전하게 결제됩니다' : 'Your payment is secure'}
        </p>
      </div>

      {/* Content */}
      <div className="co-content">
        <OrderSummary
          sitter={sitter}
          date={schedule.date}
          startTime={schedule.startTime}
          endTime={schedule.endTime}
          location={schedule.location}
          children={children}
          hours={hours}
          subtotal={subtotal}
          serviceFee={serviceFee}
          total={total}
        />

        <PaymentMethod selected={selectedCard} onSelect={setSelectedCard} />

        <SafetyNotice />

        {/* CTA */}
        <div className="co-cta">
          <button
            className="co-pay-btn"
            disabled={!canPay}
            onClick={handlePay}
          >
            {processing ? (
              <span className="co-spinner" />
            ) : (
              <>
                <Lock size={18} />
                {isKo
                  ? `₩${total.toLocaleString()} 결제하기`
                  : `Pay ₩${total.toLocaleString()}`}
              </>
            )}
          </button>
          <p className="co-cta-note">
            {isKo
              ? '결제 버튼을 누르면 이용약관에 동의하게 됩니다'
              : 'By paying, you agree to the Terms of Service'}
          </p>
        </div>
      </div>
    </div>
  );
}
