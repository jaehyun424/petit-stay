import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { sitterProfiles } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { ScheduleStep } from './booking/ScheduleStep';
import { ChildInfoStep, type ChildData } from './booking/ChildInfoStep';
import { EmergencyStep, type EmergencyData } from './booking/EmergencyStep';
import { ConsentStep, type ConsentData } from './booking/ConsentStep';
import { BookingSummary } from './booking/BookingSummary';
import '../../styles/pages/v2-booking.css';

const STEPS = 4;

export default function BookingPage() {
  const { sitterId } = useParams<{ sitterId: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';

  const sitter = sitterId ? sitterProfiles[sitterId] : undefined;

  const [step, setStep] = useState(1);

  // Step 1 — Schedule
  const [schedule, setSchedule] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  // Step 2 — Children
  const [children, setChildren] = useState<ChildData[]>([
    { name: '', age: '', allergies: '', sleepRoutine: '', preferredActivities: '' },
  ]);

  // Step 3 — Emergency
  const [emergency, setEmergency] = useState<EmergencyData>({
    parentPhone: '',
    emergencyContact: '',
    specialRequests: '',
  });

  // Step 4 — Consent
  const [consent, setConsent] = useState<ConsentData>({
    serviceScope: false,
    excludedServices: false,
    photoPolicy: false,
    privacyPolicy: false,
    termsOfService: false,
  });

  if (!sitter) {
    return (
      <div className="bk-page">
        <div className="bk-not-found">
          <h2>{isKo ? '시터를 찾을 수 없습니다' : 'Sitter not found'}</h2>
          <Link to="/search" className="bk-back-link">
            {isKo ? '시터 검색으로 돌아가기' : 'Back to search'}
          </Link>
        </div>
      </div>
    );
  }

  const canNext = () => {
    switch (step) {
      case 1:
        return schedule.date && schedule.startTime && schedule.endTime && schedule.location;
      case 2:
        return children.every(c => c.name.trim() && c.age);
      case 3:
        return emergency.parentPhone.trim().length > 0;
      case 4:
        return allConsented;
      default:
        return false;
    }
  };

  const allConsented = consent.serviceScope && consent.excludedServices
    && consent.photoPolicy && consent.privacyPolicy && consent.termsOfService;

  const handleSubmit = () => {
    const bookingId = `BK-${Date.now()}`;
    navigate(`/checkout/${bookingId}`, {
      state: {
        sitterId,
        schedule,
        children,
        emergency,
      },
    });
  };

  const stepLabels = isKo
    ? ['일정', '아이 정보', '비상 연락', '동의']
    : ['Schedule', 'Child info', 'Emergency', 'Consent'];

  return (
    <div className="bk-page">
      {/* Nav */}
      <nav className="bk-nav">
        <div className="bk-nav-inner">
          <div className="bk-nav-left">
            <button className="bk-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="bk-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="bk-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Step indicator */}
      <div className="bk-steps">
        <div className="bk-steps-inner">
          {stepLabels.map((label, idx) => {
            const num = idx + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={num} className={`bk-step-dot ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                <span className="bk-step-num">
                  {done ? <Check size={14} /> : num}
                </span>
                <span className="bk-step-label">{label}</span>
              </div>
            );
          })}
          <div className="bk-steps-line" />
        </div>
      </div>

      {/* Content layout */}
      <div className="bk-layout">
        <div className="bk-form-area">
          {step === 1 && <ScheduleStep data={schedule} onChange={setSchedule} />}
          {step === 2 && <ChildInfoStep children={children} onChange={setChildren} />}
          {step === 3 && <EmergencyStep data={emergency} onChange={setEmergency} />}
          {step === 4 && <ConsentStep data={consent} onChange={setConsent} />}

          {/* Navigation buttons */}
          <div className="bk-nav-buttons">
            {step > 1 && (
              <button className="bk-prev-btn" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} />
                {isKo ? '이전' : 'Back'}
              </button>
            )}
            {step < STEPS && (
              <button
                className="bk-next-btn"
                disabled={!canNext()}
                onClick={() => setStep(step + 1)}
              >
                {isKo ? '다음' : 'Next'}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="bk-sidebar">
          <BookingSummary
            sitter={sitter}
            date={schedule.date}
            startTime={schedule.startTime}
            endTime={schedule.endTime}
            allConsented={allConsented}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>
    </div>
  );
}
