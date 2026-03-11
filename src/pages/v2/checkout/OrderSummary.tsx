import { useTranslation } from 'react-i18next';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface ChildInfo {
  name: string;
  age: string;
}

interface OrderSummaryProps {
  sitter: SitterProfileDetail;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  children: ChildInfo[];
  hours: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export function OrderSummary({
  sitter, date, startTime, endTime, location,
  children, hours, subtotal, serviceFee, total,
}: OrderSummaryProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <section className="co-section co-order">
      <h2 className="co-section-title">
        {isKo ? '예약 요약' : 'Booking summary'}
      </h2>

      {/* Sitter */}
      <div className="co-sitter">
        <img src={sitter.photo} alt={sitter.name} className="co-sitter-photo" />
        <div className="co-sitter-info">
          <p className="co-sitter-name">{isKo ? sitter.nameKo : sitter.name}</p>
          <p className="co-sitter-rate">
            ₩{sitter.hourlyRate.toLocaleString()} / {isKo ? '시간' : 'hr'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="co-details">
        <div className="co-row">
          <span className="co-label">{isKo ? '날짜' : 'Date'}</span>
          <span className="co-value">{formattedDate}</span>
        </div>
        <div className="co-row">
          <span className="co-label">{isKo ? '시간' : 'Time'}</span>
          <span className="co-value">{startTime} — {endTime} ({hours}{isKo ? '시간' : 'h'})</span>
        </div>
        <div className="co-row">
          <span className="co-label">{isKo ? '숙소' : 'Location'}</span>
          <span className="co-value">{location}</span>
        </div>
        {children.map((child, i) => (
          <div className="co-row" key={i}>
            <span className="co-label">
              {isKo ? `아이 ${children.length > 1 ? i + 1 : ''}` : `Child${children.length > 1 ? ` ${i + 1}` : ''}`}
            </span>
            <span className="co-value">
              {child.name} ({child.age}{isKo ? '세' : ' yrs'})
            </span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="co-pricing">
        <div className="co-row">
          <span className="co-label">
            ₩{sitter.hourlyRate.toLocaleString()} × {hours}{isKo ? '시간' : 'h'}
          </span>
          <span className="co-value">₩{subtotal.toLocaleString()}</span>
        </div>
        <div className="co-row">
          <span className="co-label">{isKo ? '서비스 수수료' : 'Service fee'}</span>
          <span className="co-value">₩{serviceFee.toLocaleString()}</span>
        </div>
        <div className="co-row co-total">
          <span>{isKo ? '합계' : 'Total'}</span>
          <span>₩{total.toLocaleString()}</span>
        </div>
      </div>
    </section>
  );
}
