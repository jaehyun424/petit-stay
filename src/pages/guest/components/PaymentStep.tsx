import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PriceBreakdown } from '../../../components/common/PriceBreakdown';
import { DEMO_MODE } from '../../../hooks/common/useDemo';
import { guestService } from '../../../services/firestore';
import { calculatePrice } from '../../../services/pricingEngine';
import type { PricingInput } from '../../../services/pricingEngine';

interface PaymentStepProps {
  reservation: {
    id: string;
    totalAmount: number;
    children: { name: string; age: number }[];
    time: string;
    date?: string;
    endTime?: string;
    sitterTier?: 'gold' | 'silver' | 'any';
    isUrgent?: boolean;
  };
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ reservation, onNext, onBack }: PaymentStepProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', holder: '' });

  const isValid = form.cardNumber.length >= 16 && form.expiry.length >= 4 && form.cvv.length >= 3 && form.holder.length > 0;

  // Calculate dynamic pricing breakdown
  const pricing = useMemo(() => {
    const startHour = reservation.time || '18:00';
    const duration = reservation.endTime
      ? Math.max(1, parseInt(reservation.endTime) - parseInt(startHour))
      : Math.max(1, reservation.children.length >= 2 ? 2 : 1);
    const endHour = reservation.endTime || `${parseInt(startHour) + duration}:00`;

    const input: PricingInput = {
      baseRate: 60000,
      hours: duration,
      startTime: startHour,
      endTime: endHour,
      date: reservation.date ? new Date(reservation.date) : new Date(),
      childrenCount: reservation.children.length,
      sitterTier: reservation.sitterTier || 'any',
      isUrgent: reservation.isUrgent ?? false,
    };
    return calculatePrice(input);
  }, [reservation]);

  const handleSubmit = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        // Submit payment authorization to Firestore
        await guestService.submitPayment(reservation.id, {
          method: 'card',
          transactionId: `txn_${Date.now()}`,
        });
      }
      onNext();
    } catch {
      setPaymentError(t('guest.paymentError'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Build price breakdown items from pricing engine
  const priceItems = [
    { labelKey: 'pricing.baseRate', amount: pricing.baseRate * pricing.hours },
    ...(pricing.nightSurcharge > 0 ? [{ labelKey: 'pricing.nightSurcharge', amount: pricing.nightSurcharge }] : []),
    ...(pricing.weekendSurcharge > 0 ? [{ labelKey: 'pricing.weekendSurcharge', amount: pricing.weekendSurcharge }] : []),
    ...(pricing.urgentSurcharge > 0 ? [{ labelKey: 'pricing.urgentSurcharge', amount: pricing.urgentSurcharge }] : []),
    ...(pricing.additionalChildrenSurcharge > 0 ? [{ labelKey: 'pricing.additionalChildren', amount: pricing.additionalChildrenSurcharge }] : []),
    ...(pricing.goldSitterSurcharge > 0 ? [{ labelKey: 'pricing.goldSitter', amount: pricing.goldSitterSurcharge }] : []),
  ];

  const total = pricing.total || reservation.totalAmount;

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.paymentTitle')}</h2>

      <div className="guest-price-section">
        <h3 className="guest-price-heading">{t('pricing.breakdown')}</h3>
        <PriceBreakdown items={priceItems} total={total} />
      </div>

      <div className="guest-form-stack">
        <div className="guest-form-field">
          <label>{t('guest.cardNumber')}</label>
          <input
            type="text"
            className="guest-input"
            placeholder={t('guest.cardNumberPlaceholder')}
            maxLength={19}
            inputMode="numeric"
            autoComplete="cc-number"
            aria-label={t('guest.cardNumber')}
            value={form.cardNumber}
            onChange={(e) => setForm({ ...form, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
          />
        </div>
        <div className="guest-form-row">
          <div className="guest-form-field">
            <label>{t('guest.expiryDate')}</label>
            <input
              type="text"
              className="guest-input"
              placeholder={t('guest.expiryPlaceholder')}
              maxLength={5}
              inputMode="numeric"
              autoComplete="cc-exp"
              aria-label={t('guest.expiryDate')}
              value={form.expiry}
              onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            />
          </div>
          <div className="guest-form-field">
            <label>{t('guest.cvv')}</label>
            <input
              type="text"
              className="guest-input"
              placeholder={t('guest.cvvPlaceholder')}
              maxLength={4}
              inputMode="numeric"
              autoComplete="cc-csc"
              aria-label={t('guest.cvv')}
              value={form.cvv}
              onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </div>
        </div>
        <div className="guest-form-field">
          <label>{t('guest.cardHolder')}</label>
          <input
            type="text"
            className="guest-input"
            placeholder={t('guest.cardHolderPlaceholder')}
            autoComplete="cc-name"
            aria-label={t('guest.cardHolder')}
            value={form.holder}
            onChange={(e) => setForm({ ...form, holder: e.target.value })}
          />
        </div>
      </div>

      {paymentError && (
        <div className="guest-error-banner" role="alert">
          <p>{paymentError}</p>
        </div>
      )}

      <div className="guest-btn-row">
        <button className="guest-btn guest-btn-secondary" onClick={onBack} disabled={isProcessing} aria-label={t('guest.previousStep')}>{t('guest.previousStep')}</button>
        <button className="guest-btn guest-btn-primary" onClick={handleSubmit} disabled={!isValid || isProcessing} aria-label={t('guest.processPayment')}>
          {isProcessing ? <span className="guest-spinner" aria-label="Processing" /> : t('guest.processPayment')}
        </button>
      </div>
    </div>
  );
}
