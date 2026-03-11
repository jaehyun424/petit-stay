import { useTranslation } from 'react-i18next';
import { Palette, Moon, HeartPulse, Clock } from 'lucide-react';

interface Props {
  activities: string;
  activitiesKo: string;
  sleepNote: string;
  sleepNoteKo: string;
  healthNote: string;
  healthNoteKo: string;
  checkInTime: string;
  checkOutTime: string;
}

export function SessionReport({
  activities,
  activitiesKo,
  sleepNote,
  sleepNoteKo,
  healthNote,
  healthNoteKo,
  checkInTime,
  checkOutTime,
}: Props) {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const items = [
    {
      icon: Palette,
      title: isKo ? '활동 내역' : 'Activities',
      value: isKo ? activitiesKo : activities,
    },
    {
      icon: Moon,
      title: isKo ? '수면 상태' : 'Sleep',
      value: isKo ? sleepNoteKo : sleepNote,
    },
    {
      icon: HeartPulse,
      title: isKo ? '건강 / 특이사항' : 'Health Notes',
      value: isKo ? healthNoteKo : healthNote,
    },
    {
      icon: Clock,
      title: isKo ? '돌봄 시간' : 'Session Time',
      value: `${checkInTime} → ${checkOutTime}`,
    },
  ];

  return (
    <div className="bd-report">
      <h3 className="bd-report-title">
        {isKo ? '종료 리포트' : 'Session Report'}
      </h3>
      <div className="bd-report-items">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bd-report-item">
              <div className="bd-report-icon">
                <Icon size={18} />
              </div>
              <div className="bd-report-text">
                <span className="bd-report-label">{item.title}</span>
                <span className="bd-report-value">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
