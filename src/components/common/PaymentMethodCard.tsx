// ============================================
// Petit Stay - Payment Method Card Component
// ============================================

import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import { Button } from './Button';
import type { PaymentMethodCard as PaymentMethodType } from '../../types';

const BRAND_LABELS: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
};

interface PaymentMethodCardProps {
    card: PaymentMethodType;
    onRemove?: (id: string) => void;
}

export function PaymentMethodCardDisplay({ card, onRemove }: PaymentMethodCardProps) {
    const { t } = useTranslation();

    const brandLabel = BRAND_LABELS[card.brand] ?? t('payment.card');

    return (
        <div className="payment-card-item">
            <span className="payment-card-icon"><CreditCard size={20} strokeWidth={1.75} /></span>
            <div className="payment-card-info">
                <span className="payment-card-brand">
                    {brandLabel} **** {card.last4}
                </span>
                <span className="payment-card-expiry">
                    {t('profile.expiry')}: {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                </span>
            </div>
            {card.isDefault && <span className="payment-card-default">{t('payment.default')}</span>}
            {onRemove && (
                <Button variant="ghost" size="sm" onClick={() => onRemove(card.id)}>
                    {t('common.remove')}
                </Button>
            )}
        </div>
    );
}
