import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Save } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';

export default function SitterPricing() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [baseRate, setBaseRate] = useState('35000');
  const [nightRate, setNightRate] = useState('45000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SitterV2Layout
      title="Set Pricing"
      titleKo="가격 설정"
      subtitle="Parents see these rates on your profile"
      subtitleKo="이 가격은 프로필에 그대로 표시돼요"
      showBack
      pendingRequests={2}
    >
      {/* Base rate */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '기본 시급' : 'Hourly Rate'}</h3>
        <div className="st-price-input-group">
          <span className="st-price-prefix">₩</span>
          <input
            className="st-price-input"
            type="number"
            min="10000"
            max="100000"
            step="1000"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
          />
          <span className="st-price-suffix">/ {isKo ? '시간' : 'hr'}</span>
        </div>
      </div>

      {/* Night rate */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '야간 할증' : 'Night Surcharge'}</h3>
        <div className="st-price-input-group">
          <span className="st-price-prefix">₩</span>
          <input
            className="st-price-input"
            type="number"
            min="10000"
            max="150000"
            step="1000"
            value={nightRate}
            onChange={(e) => setNightRate(e.target.value)}
          />
          <span className="st-price-suffix">/ {isKo ? '시간' : 'hr'}</span>
        </div>
        <p className="st-form-hint" style={{ marginTop: '0.5rem' }}>
          {isKo ? '22시 이후 적용 (선택 사항)' : 'Applied after 22:00 (optional)'}
        </p>
      </div>

      {/* Recommended ranges */}
      <div className="st-price-recommend">
        <p className="st-price-recommend-title">
          {isKo ? '플랫폼 권장 가격 범위' : 'Recommended Price Range'}
        </p>
        <div className="st-price-tiers">
          <div className="st-price-tier">
            <span className="st-price-tier-name">{isKo ? '일반' : 'Standard'}</span>
            <span className="st-price-tier-range">₩15,000 ~ ₩25,000</span>
          </div>
          <div className="st-price-tier">
            <span className="st-price-tier-name">{isKo ? '스탠다드' : 'Professional'}</span>
            <span className="st-price-tier-range">₩25,000 ~ ₩35,000</span>
          </div>
          <div className="st-price-tier">
            <span className="st-price-tier-name">{isKo ? '프리미엄' : 'Premium'}</span>
            <span className="st-price-tier-range">₩35,000 ~ ₩50,000</span>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="st-price-notice">
        <Info size={16} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
        <span>
          {isKo
            ? '이 가격은 고객에게 그대로 표시됩니다. 플랫폼 수수료(15~20%)는 정산 시 차감됩니다.'
            : 'These rates are shown directly to parents. Platform fee (15-20%) is deducted at settlement.'}
        </span>
      </div>

      {/* Save */}
      <button className="st-save-btn" onClick={handleSave}>
        <Save size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
        {saved ? (isKo ? '저장 완료!' : 'Saved!') : (isKo ? '가격 저장' : 'Save Pricing')}
      </button>
    </SitterV2Layout>
  );
}
