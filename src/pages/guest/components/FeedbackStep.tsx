import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FeedbackStepProps {
  onSubmit: (rating: number, comment: string) => void;
}

export function FeedbackStep({ onSubmit }: FeedbackStepProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="guest-card guest-confirmation">
        <div className="guest-confirmation-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="guest-card-title">{t('guest.feedbackThankYou')}</h2>
      </div>
    );
  }

  return (
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
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
  );
}
