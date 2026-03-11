import { useTranslation } from 'react-i18next';
import { ShieldCheck, Clock } from 'lucide-react';

export function SafetyNotice() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <section className="co-section co-safety">
      {/* Escrow */}
      <div className="co-safety-block">
        <div className="co-safety-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3 className="co-safety-title">
            {isKo ? '안전 결제' : 'Secure payment'}
          </h3>
          <p className="co-safety-text">
            {isKo
              ? '에스크로 방식으로 안전하게 결제됩니다. 돌봄 완료 후 시터에게 정산됩니다.'
              : 'Your payment is held in escrow. Funds are released to the sitter only after the session is complete.'}
          </p>
        </div>
      </div>

      {/* Cancellation */}
      <div className="co-safety-block">
        <div className="co-safety-icon">
          <Clock size={22} />
        </div>
        <div>
          <h3 className="co-safety-title">
            {isKo ? '취소 정책' : 'Cancellation policy'}
          </h3>
          <ul className="co-cancel-list">
            <li>
              {isKo
                ? '24시간 전 취소 시 전액 환불'
                : 'Full refund if cancelled 24 hours before'}
            </li>
            <li>
              {isKo
                ? '당일 취소 시 50% 환불'
                : '50% refund for same-day cancellation'}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
