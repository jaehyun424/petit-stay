import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldX, Camera, FileText, CheckSquare } from 'lucide-react';

export interface ConsentData {
  serviceScope: boolean;
  excludedServices: boolean;
  photoPolicy: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
}

interface ConsentStepProps {
  data: ConsentData;
  onChange: (data: ConsentData) => void;
}

export function ConsentStep({ data, onChange }: ConsentStepProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const includedServices = isKo
    ? ['놀이 활동', '식사 보조', '수면 루틴', '안전 관찰', '부모 보고']
    : ['Play activities', 'Meal assistance', 'Bedtime routine', 'Safety monitoring', 'Parent report'];

  const excludedServices = isKo
    ? ['투약 · 의료행위', '목욕', '숙박 동반', '수영장', '야외 이동', '차량 탑승']
    : ['Medication / medical care', 'Bathing', 'Overnight stay', 'Swimming pool', 'Outdoor trips', 'Vehicle transport'];

  return (
    <div className="bk-step">
      <h2 className="bk-step-title">
        {isKo ? '동의 및 확인' : 'Review & consent'}
      </h2>
      <p className="bk-step-desc">
        {isKo
          ? '안전한 돌봄을 위해 아래 내용을 확인해 주세요.'
          : 'Please review and agree to the following for a safe session.'}
      </p>

      {/* Included services */}
      <div className="bk-consent-section">
        <h3 className="bk-consent-heading">
          <ShieldCheck size={18} />
          {isKo ? '서비스 범위' : 'Service scope'}
        </h3>
        <ul className="bk-consent-list bk-consent-included">
          {includedServices.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <label className="bk-checkbox-label">
          <input
            type="checkbox"
            checked={data.serviceScope}
            onChange={e => onChange({ ...data, serviceScope: e.target.checked })}
          />
          <CheckSquare size={18} className={data.serviceScope ? 'bk-checked' : 'bk-unchecked'} />
          {isKo ? '위 서비스 범위를 확인했습니다' : 'I confirm the service scope above'}
        </label>
      </div>

      {/* Excluded services */}
      <div className="bk-consent-section">
        <h3 className="bk-consent-heading">
          <ShieldX size={18} />
          {isKo ? '제외 업무' : 'Not included'}
        </h3>
        <ul className="bk-consent-list bk-consent-excluded">
          {excludedServices.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <label className="bk-checkbox-label">
          <input
            type="checkbox"
            checked={data.excludedServices}
            onChange={e => onChange({ ...data, excludedServices: e.target.checked })}
          />
          <CheckSquare size={18} className={data.excludedServices ? 'bk-checked' : 'bk-unchecked'} />
          {isKo ? '위 업무는 포함되지 않음을 확인했습니다' : 'I understand these services are not included'}
        </label>
      </div>

      {/* Photo policy */}
      <label className="bk-checkbox-label bk-consent-item">
        <input
          type="checkbox"
          checked={data.photoPolicy}
          onChange={e => onChange({ ...data, photoPolicy: e.target.checked })}
        />
        <CheckSquare size={18} className={data.photoPolicy ? 'bk-checked' : 'bk-unchecked'} />
        <span>
          <Camera size={14} className="bk-consent-icon" />
          {isKo ? '사진 촬영 정책에 동의합니다' : 'I agree to the photo policy'}
        </span>
      </label>

      {/* Privacy */}
      <label className="bk-checkbox-label bk-consent-item">
        <input
          type="checkbox"
          checked={data.privacyPolicy}
          onChange={e => onChange({ ...data, privacyPolicy: e.target.checked })}
        />
        <CheckSquare size={18} className={data.privacyPolicy ? 'bk-checked' : 'bk-unchecked'} />
        <span>
          <FileText size={14} className="bk-consent-icon" />
          {isKo ? '개인정보 처리방침에 동의합니다' : 'I agree to the Privacy Policy'}
        </span>
      </label>

      {/* Terms */}
      <label className="bk-checkbox-label bk-consent-item">
        <input
          type="checkbox"
          checked={data.termsOfService}
          onChange={e => onChange({ ...data, termsOfService: e.target.checked })}
        />
        <CheckSquare size={18} className={data.termsOfService ? 'bk-checked' : 'bk-unchecked'} />
        <span>
          <FileText size={14} className="bk-consent-icon" />
          {isKo ? '이용약관에 동의합니다' : 'I agree to the Terms of Service'}
        </span>
      </label>
    </div>
  );
}
