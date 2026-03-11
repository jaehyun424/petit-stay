import { useTranslation } from 'react-i18next';
import { CheckCircle2, MapPin, Play, Flag, Star } from 'lucide-react';

type BookingStatus = 'confirmed' | 'in-progress' | 'completed';

interface Props {
  status: BookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
}

const steps = [
  { key: 'confirmed', icon: CheckCircle2 },
  { key: 'checkin', icon: MapPin },
  { key: 'in-progress', icon: Play },
  { key: 'completed', icon: Flag },
  { key: 'review', icon: Star },
] as const;

function getActiveIndex(status: BookingStatus): number {
  if (status === 'confirmed') return 0;
  if (status === 'in-progress') return 2;
  return 3; // completed
}

export function BookingTimeline({ status, checkInTime, checkOutTime }: Props) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const activeIdx = getActiveIndex(status);

  const labels: Record<string, { en: string; ko: string }> = {
    confirmed: { en: 'Confirmed', ko: '예약 확정' },
    checkin: { en: 'Check-in', ko: '체크인' },
    'in-progress': { en: 'In Progress', ko: '진행 중' },
    completed: { en: 'Completed', ko: '완료' },
    review: { en: 'Review', ko: '리뷰' },
  };

  return (
    <div className="bd-timeline">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <div key={step.key} className={`bd-timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
            {i > 0 && <div className={`bd-timeline-line ${done ? 'done' : ''}`} />}
            <div className="bd-timeline-dot">
              <Icon size={14} />
            </div>
            <span className="bd-timeline-label">
              {isKo ? labels[step.key].ko : labels[step.key].en}
              {step.key === 'checkin' && checkInTime && (
                <span className="bd-timeline-time">{checkInTime}</span>
              )}
              {step.key === 'completed' && checkOutTime && (
                <span className="bd-timeline-time">{checkOutTime}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
