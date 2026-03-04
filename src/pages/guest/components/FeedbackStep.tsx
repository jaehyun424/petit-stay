import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface FeedbackStepProps {
  onSubmit: (rating: number, comment: string) => void;
}

export function FeedbackStep({ onSubmit }: FeedbackStepProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setSubmitted(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (submitted) {
    return (
      <div className="guest-card guest-confirmation">
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
          {t('guest.feedbackThankYou')}
        </motion.h2>
        <motion.p
          className="guest-confirmation-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t('guest.feedbackThankYouDesc')}
        </motion.p>
      </div>
    );
  }

  return (
    <>
      <div className="guest-card">
        <h2 className="guest-card-title">{t('guest.feedbackTitle')}</h2>
        <p className="guest-subtitle">{t('guest.feedbackSubtitle')}</p>
        <div className="guest-rating">
          <label className="guest-info-label">{t('guest.ratingLabel')}</label>
          <div className="guest-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`guest-star ${star <= (hoverRating || rating) ? 'guest-star-active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} stars`}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="guest-form-field">
          <label>{t('guest.commentLabel')}</label>
          <textarea
            className="guest-textarea"
            rows={4}
            placeholder={t('guest.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button className="guest-btn guest-btn-primary" onClick={handleSubmit} disabled={rating === 0}>
          {t('guest.submitFeedback')}
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <motion.div
          className="guest-toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <CheckCircle size={18} />
          {t('guest.feedbackThankYou')}
        </motion.div>
      )}
    </>
  );
}
