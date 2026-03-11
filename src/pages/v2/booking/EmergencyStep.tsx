import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare } from 'lucide-react';

export interface EmergencyData {
  parentPhone: string;
  emergencyContact: string;
  specialRequests: string;
}

interface EmergencyStepProps {
  data: EmergencyData;
  onChange: (data: EmergencyData) => void;
}

export function EmergencyStep({ data, onChange }: EmergencyStepProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <div className="bk-step">
      <h2 className="bk-step-title">
        {isKo ? '시터가 알아야 할 내용이 있나요?' : 'Emergency contact & requests'}
      </h2>
      <p className="bk-step-desc">
        {isKo
          ? '세션 중 연락이 필요할 때를 대비해 알려주세요.'
          : 'So the sitter can reach you during the session if needed.'}
      </p>

      <div className="bk-field">
        <label className="bk-label">
          <Phone size={16} />
          {isKo ? '부모 연락처' : 'Your phone number'} *
        </label>
        <input
          type="tel"
          className="bk-input"
          placeholder={isKo ? '+82 10-1234-5678' : '+1 555-123-4567'}
          value={data.parentPhone}
          onChange={e => onChange({ ...data, parentPhone: e.target.value })}
        />
      </div>

      <div className="bk-field">
        <label className="bk-label">
          <Phone size={16} />
          {isKo ? '추가 비상 연락처' : 'Additional emergency contact'}
        </label>
        <input
          type="tel"
          className="bk-input"
          placeholder={isKo ? '선택 사항' : 'Optional'}
          value={data.emergencyContact}
          onChange={e => onChange({ ...data, emergencyContact: e.target.value })}
        />
      </div>

      <div className="bk-field">
        <label className="bk-label">
          <MessageSquare size={16} />
          {isKo ? '특별 요청사항' : 'Special requests'}
        </label>
        <textarea
          className="bk-textarea"
          placeholder={isKo
            ? '시터에게 전달할 사항이 있으면 적어주세요'
            : 'Anything else the sitter should know'}
          value={data.specialRequests}
          onChange={e => onChange({ ...data, specialRequests: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
