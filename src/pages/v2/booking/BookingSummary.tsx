import { useTranslation } from 'react-i18next';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface BookingSummaryProps {
  sitter: SitterProfileDetail;
  date: string;
  startTime: string;
  endTime: string;
  allConsented: boolean;
  onSubmit: () => void;
}

function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

const SERVICE_FEE_RATE = 0.15;

export function BookingSummary({ sitter, date, startTime, endTime, allConsented, onSubmit }: BookingSummaryProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const hours = calcHours(startTime, endTime);
  const subtotal = hours * sitter.hourlyRate;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <div className="bk-summary">
      <h3 className="bk-summary-title">
        {isKo ? '예약 요약' : 'Booking summary'}
      </h3>

      {/* Sitter info */}
      <div className="bk-summary-sitter">
        <img
          src={sitter.photo}
          alt={sitter.name}
          className="bk-summary-photo"
        />
        <div>
          <p className="bk-summary-name">{isKo ? sitter.nameKo : sitter.name}</p>
          <p className="bk-summary-rate">
            ₩{sitter.hourlyRate.toLocaleString()} / {isKo ? '시간' : 'hr'}
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="bk-summary-row">
        <span className="bk-summary-label">{isKo ? '날짜' : 'Date'}</span>
        <span className="bk-summary-value">{formattedDate}</span>
      </div>
      <div className="bk-summary-row">
        <span className="bk-summary-label">{isKo ? '시간' : 'Time'}</span>
        <span className="bk-summary-value">
          {startTime && endTime ? `${startTime} — ${endTime}` : '—'}
        </span>
      </div>
      {hours > 0 && (
        <div className="bk-summary-row">
          <span className="bk-summary-label">{isKo ? '시간' : 'Duration'}</span>
          <span className="bk-summary-value">
            {hours}{isKo ? '시간' : 'h'}
          </span>
        </div>
      )}

      {/* Pricing */}
      {hours > 0 && (
        <div className="bk-summary-pricing">
          <div className="bk-summary-row">
            <span className="bk-summary-label">
              ₩{sitter.hourlyRate.toLocaleString()} × {hours}{isKo ? '시간' : 'h'}
            </span>
            <span className="bk-summary-value">₩{subtotal.toLocaleString()}</span>
          </div>
          <div className="bk-summary-row">
            <span className="bk-summary-label">
              {isKo ? '서비스 수수료' : 'Service fee'}
            </span>
            <span className="bk-summary-value">₩{serviceFee.toLocaleString()}</span>
          </div>
          <div className="bk-summary-row bk-summary-total">
            <span>{isKo ? '합계' : 'Total'}</span>
            <span>₩{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        className="bk-submit-btn"
        disabled={!allConsented || hours <= 0}
        onClick={onSubmit}
      >
        {isKo ? '예약 요청하기' : 'Request booking'}
      </button>
    </div>
  );
}
