import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PriceBreakdown } from '../../../components/common/PriceBreakdown';

interface PaymentStepProps {
  reservation: {
    totalAmount: number;
    children: { name: string; age: number }[];
    time: string;
  };
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ reservation, onNext, onBack }: PaymentStepProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', holder: '' });

  const isValid = form.cardNumber.length >= 16 && form.expiry.length >= 4 && form.cvv.length >= 3 && form.holder.length > 0;

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    onNext();
  };

  // Build price breakdown items
  const baseRate = 60000;
  const hours = Math.max(1, reservation.children.length >= 2 ? 2 : 1);
  const childSurcharge = reservation.children.length > 1 ? 15000 : 0;
  const subtotal = baseRate * hours + childSurcharge;
  const tax = Math.round(subtotal * 0.1);
  const total = reservation.totalAmount;

  const priceItems = [
    { labelKey: 'guest.priceBase', amount: baseRate * hours },
    ...(childSurcharge > 0 ? [{ labelKey: 'guest.priceChildSurcharge', amount: childSurcharge }] : []),
    { labelKey: 'guest.priceTax', amount: tax },
  ];

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.paymentTitle')}</h2>

      <div className="guest-price-section">
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
            value={form.holder}
            onChange={(e) => setForm({ ...form, holder: e.target.value })}
          />
        </div>
      </div>

      <div className="guest-btn-row">
        <button className="guest-btn guest-btn-secondary" onClick={onBack} disabled={isProcessing}>{t('guest.previousStep')}</button>
        <button className="guest-btn guest-btn-primary" onClick={handleSubmit} disabled={!isValid || isProcessing}>
          {isProcessing ? <span className="guest-spinner" /> : t('guest.processPayment')}
        </button>
      </div>
    </div>
  );
}
