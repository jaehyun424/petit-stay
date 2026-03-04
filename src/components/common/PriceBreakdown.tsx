// ============================================
// Petit Stay - PriceBreakdown Component
// ============================================

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';

interface PriceItem {
  labelKey: string;
  amount: number;
  highlight?: boolean;
}

interface PriceBreakdownProps {
  items: PriceItem[];
  total: number;
}

export function PriceBreakdown({ items, total }: PriceBreakdownProps) {
  const { t } = useTranslation();

  return (
    <div className="price-breakdown">
      {items.map((item, i) => (
        <div key={i} className={`price-row${item.highlight ? ' price-row-highlight' : ''}`}>
          <span>{t(item.labelKey)}</span>
          <span>{formatCurrency(item.amount)}</span>
        </div>
      ))}
      <div className="price-row price-row-total">
        <span>{t('booking.totalCost')}</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
