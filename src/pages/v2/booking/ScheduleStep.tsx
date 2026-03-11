import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleData {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface ScheduleStepProps {
  data: ScheduleData;
  onChange: (data: ScheduleData) => void;
}

const TIME_OPTIONS = [
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

export function ScheduleStep({ data, onChange }: ScheduleStepProps) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const today = new Date().toISOString().split('T')[0];

  const endTimeOptions = TIME_OPTIONS.filter(t => t > data.startTime);

  return (
    <div className="bk-step">
      <h2 className="bk-step-title">
        {isKo ? '예약 정보를 입력해 주세요' : 'Schedule your session'}
      </h2>
      <p className="bk-step-desc">
        {isKo
          ? '서울 지역, 18:00~23:00 사이에 예약할 수 있어요.'
          : 'Sessions are available in Seoul, between 18:00 and 23:00.'}
      </p>

      <div className="bk-field">
        <label className="bk-label">
          <Calendar size={16} />
          {isKo ? '날짜' : 'Date'}
        </label>
        <input
          type="date"
          className="bk-input"
          value={data.date}
          min={today}
          onChange={e => onChange({ ...data, date: e.target.value })}
        />
      </div>

      <div className="bk-field-row">
        <div className="bk-field">
          <label className="bk-label">
            <Clock size={16} />
            {isKo ? '시작 시간' : 'Start time'}
          </label>
          <select
            className="bk-select"
            value={data.startTime}
            onChange={e => onChange({ ...data, startTime: e.target.value, endTime: '' })}
          >
            <option value="">{isKo ? '선택' : 'Select'}</option>
            {TIME_OPTIONS.slice(0, -1).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="bk-field">
          <label className="bk-label">
            <Clock size={16} />
            {isKo ? '종료 시간' : 'End time'}
          </label>
          <select
            className="bk-select"
            value={data.endTime}
            onChange={e => onChange({ ...data, endTime: e.target.value })}
            disabled={!data.startTime}
          >
            <option value="">{isKo ? '선택' : 'Select'}</option>
            {endTimeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bk-field">
        <label className="bk-label">
          <MapPin size={16} />
          {isKo ? '장소' : 'Location'}
        </label>
        <input
          type="text"
          className="bk-input"
          placeholder={isKo ? '호텔 이름 또는 숙소 주소' : 'Hotel name or accommodation address'}
          value={data.location}
          onChange={e => onChange({ ...data, location: e.target.value })}
        />
      </div>
    </div>
  );
}
