import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';

const CARD_TYPES = ['Visa', 'Mastercard', 'JCB'] as const;
type CardType = typeof CARD_TYPES[number];

interface PaymentMethodProps {
  selected: CardType | null;
  onSelect: (card: CardType) => void;
}

export function PaymentMethod({ selected, onSelect }: PaymentMethodProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <section className="co-section co-payment">
      <h2 className="co-section-title">
        <CreditCard size={20} />
        {isKo ? '결제 수단' : 'Payment method'}
      </h2>
      <p className="co-payment-desc">
        {isKo
          ? '해외 카드로 안전하게 결제하세요'
          : 'Pay securely with your international card'}
      </p>

      <div className="co-card-options">
        {CARD_TYPES.map((card) => (
          <button
            key={card}
            className={`co-card-btn ${selected === card ? 'selected' : ''}`}
            onClick={() => onSelect(card)}
          >
            <span className="co-card-name">{card}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export type { CardType };
