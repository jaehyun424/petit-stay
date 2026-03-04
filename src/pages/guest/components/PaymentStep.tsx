import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentStepProps {
  totalAmount: number;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ totalAmount, onNext, onBack }: PaymentStepProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', holder: '' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

  const isValid = form.cardNumber.length >= 16 && form.expiry.length >= 4 && form.cvv.length >= 3 && form.holder.length > 0;

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    onNext();
  };

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.paymentTitle')}</h2>
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
      <div className="guest-payment-total">
        <span>{t('guest.totalAmount')}</span>
        <span className="guest-payment-amount">{formatCurrency(totalAmount)}</span>
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
