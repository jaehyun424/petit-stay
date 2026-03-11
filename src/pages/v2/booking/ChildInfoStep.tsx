import { useTranslation } from 'react-i18next';
import { Baby, Plus, X } from 'lucide-react';

export interface ChildData {
  name: string;
  age: string;
  allergies: string;
  sleepRoutine: string;
  preferredActivities: string;
}

interface ChildInfoStepProps {
  children: ChildData[];
  onChange: (children: ChildData[]) => void;
}

const emptyChild: ChildData = {
  name: '',
  age: '',
  allergies: '',
  sleepRoutine: '',
  preferredActivities: '',
};

export function ChildInfoStep({ children, onChange }: ChildInfoStepProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const updateChild = (index: number, field: keyof ChildData, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addChild = () => {
    if (children.length < 2) {
      onChange([...children, { ...emptyChild }]);
    }
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      onChange(children.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bk-step">
      <h2 className="bk-step-title">
        {isKo ? '아이에 대해 알려주세요' : 'Tell us about your child'}
      </h2>
      <p className="bk-step-desc">
        {isKo
          ? '시터가 아이에게 맞는 돌봄을 준비할 수 있도록 알려주세요.'
          : 'This helps the sitter prepare the best care for your child.'}
      </p>

      {children.map((child, idx) => (
        <div key={idx} className="bk-child-card">
          <div className="bk-child-header">
            <span className="bk-child-label">
              <Baby size={16} />
              {isKo ? `아이 ${idx + 1}` : `Child ${idx + 1}`}
            </span>
            {children.length > 1 && (
              <button className="bk-remove-btn" onClick={() => removeChild(idx)} type="button">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="bk-field-row">
            <div className="bk-field">
              <label className="bk-label">{isKo ? '이름' : 'Name'} *</label>
              <input
                type="text"
                className="bk-input"
                placeholder={isKo ? '아이 이름' : "Child's name"}
                value={child.name}
                onChange={e => updateChild(idx, 'name', e.target.value)}
              />
            </div>
            <div className="bk-field bk-field-small">
              <label className="bk-label">{isKo ? '나이' : 'Age'} *</label>
              <select
                className="bk-select"
                value={child.age}
                onChange={e => updateChild(idx, 'age', e.target.value)}
              >
                <option value="">{isKo ? '선택' : 'Select'}</option>
                {[3, 4, 5, 6, 7, 8].map(a => (
                  <option key={a} value={a}>{a}{isKo ? '세' : ' yrs'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bk-field">
            <label className="bk-label">{isKo ? '알레르기' : 'Allergies'}</label>
            <input
              type="text"
              className="bk-input"
              placeholder={isKo ? '없으면 비워두세요' : 'Leave blank if none'}
              value={child.allergies}
              onChange={e => updateChild(idx, 'allergies', e.target.value)}
            />
          </div>

          <div className="bk-field">
            <label className="bk-label">
              {isKo ? '수면 루틴' : 'Bedtime routine'}
            </label>
            <input
              type="text"
              className="bk-input"
              placeholder={isKo ? '예: 21시에 재워주세요' : 'e.g., Bedtime at 9 PM'}
              value={child.sleepRoutine}
              onChange={e => updateChild(idx, 'sleepRoutine', e.target.value)}
            />
          </div>

          <div className="bk-field">
            <label className="bk-label">
              {isKo ? '선호 활동' : 'Preferred activities'}
            </label>
            <input
              type="text"
              className="bk-input"
              placeholder={isKo ? '예: 그림 그리기, 블록 놀이' : 'e.g., Drawing, building blocks'}
              value={child.preferredActivities}
              onChange={e => updateChild(idx, 'preferredActivities', e.target.value)}
            />
          </div>
        </div>
      ))}

      {children.length < 2 && (
        <button className="bk-add-child-btn" onClick={addChild} type="button">
          <Plus size={16} />
          {isKo ? '아이 추가 (최대 2명)' : 'Add another child (max 2)'}
        </button>
      )}
    </div>
  );
}
