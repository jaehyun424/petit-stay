import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Building, User } from 'lucide-react';

interface ConfirmationStepProps {
  reservation: {
    hotelName: string;
    date: string;
    time: string;
    sitterName?: string;
    confirmationCode: string;
  };
  onNext: () => void;
}

export function ConfirmationStep({ reservation, onNext }: ConfirmationStepProps) {
  const { t } = useTranslation();

  // Use actual confirmation code from reservation, fallback to generated code
  const displayCode = reservation.confirmationCode || (() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `PS-2026-${mm}${dd}-001`;
  })();

  const summaryItems = [
    { icon: <Calendar size={18} />, label: t('guest.dateLabel'), value: reservation.date },
    { icon: <Clock size={18} />, label: t('guest.timeLabel'), value: reservation.time },
    { icon: <Building size={18} />, label: t('guest.hotelLabel'), value: reservation.hotelName },
    ...(reservation.sitterName ? [{ icon: <User size={18} />, label: t('guest.sitterLabel'), value: reservation.sitterName }] : []),
  ];

  return (
    <div className="guest-card guest-confirmation">
      {/* Celebration animation */}
      <motion.div
        className="guest-confirmation-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
      >
        <CheckCircle size={64} color="var(--gold-500)" />
      </motion.div>

      <motion.h2
        className="guest-card-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {t('guest.confirmationTitle')}
      </motion.h2>

      <motion.p
        className="guest-confirmation-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {t('guest.confirmationMessage')}
      </motion.p>

      {/* Confirmation code */}
      <motion.div
        className="guest-confirmation-code"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="guest-info-label">{t('guest.confirmationCode')}</span>
        <span className="guest-code">{displayCode}</span>
      </motion.div>

      {/* Booking summary */}
      <motion.div
        className="guest-confirmation-summary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {summaryItems.map((item, i) => (
          <div key={i} className="guest-confirmation-summary-row">
            <span className="guest-confirmation-summary-icon">{item.icon}</span>
            <span className="guest-info-label">{item.label}</span>
            <span className="guest-info-value">{item.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Guide message */}
      <motion.p
        className="guest-confirmation-sitter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {t('guest.sitterArrival')}
      </motion.p>

      <motion.button
        className="guest-btn guest-btn-primary"
        onClick={onNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {t('guest.leaveFeedback')}
      </motion.button>
    </div>
  );
}
