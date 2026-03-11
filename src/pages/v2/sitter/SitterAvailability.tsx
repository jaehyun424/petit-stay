import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Save } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_KO = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_SLOTS = [
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

// Demo initial availability (Yuna's schedule)
const initialSlots: Record<string, string[]> = {
  Mon: ['18:00', '19:00', '20:00', '21:00'],
  Tue: ['18:00', '19:00', '20:00', '21:00'],
  Thu: ['18:00', '19:00', '20:00', '21:00', '22:00'],
  Fri: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
  Sat: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
};

export default function SitterAvailability() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [slots, setSlots] = useState<Record<string, string[]>>(initialSlots);
  const [saved, setSaved] = useState(false);

  const toggleSlot = (day: string, time: string) => {
    setSlots((prev) => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(time)
        ? daySlots.filter((t) => t !== time)
        : [...daySlots, time].sort();
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SitterV2Layout
      title="Availability"
      titleKo="가용시간"
      subtitle="Set your weekly schedule"
      subtitleKo="주간 가용 시간을 설정하세요"
      showBack
      pendingRequests={2}
    >
      {/* Calendar */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '주간 스케줄' : 'Weekly Schedule'}</h3>
        <div className="st-calendar">
          {DAYS.map((day, idx) => (
            <div key={day} className="st-calendar-day">
              <div className="st-calendar-day-label">
                {isKo ? DAYS_KO[idx] : day}
              </div>
              <div className="st-calendar-slots">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    className={`st-calendar-slot ${(slots[day] || []).includes(time) ? 'active' : ''}`}
                    onClick={() => toggleSlot(day, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="st-tip">
        <Lightbulb size={16} />
        <span>
          {isKo
            ? '가용 시간이 많을수록 예약 요청을 더 많이 받을 수 있어요'
            : 'More available hours means more booking requests'}
        </span>
      </div>

      {/* Save */}
      <button className="st-save-btn" onClick={handleSave}>
        <Save size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
        {saved ? (isKo ? '저장 완료!' : 'Saved!') : (isKo ? '스케줄 저장' : 'Save Schedule')}
      </button>
    </SitterV2Layout>
  );
}
