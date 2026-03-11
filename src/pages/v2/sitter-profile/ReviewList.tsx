import { useTranslation } from 'react-i18next';
import { Star, BadgeCheck } from 'lucide-react';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface ReviewListProps {
  sitter: SitterProfileDetail;
}

export function ReviewList({ sitter }: ReviewListProps) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <section className="sp-section">
      <h2 className="sp-section-title">
        {t('sitterProfile.verifiedReviews')}
        <span className="sp-review-count">({sitter.reviews.length})</span>
      </h2>

      <div className="sp-reviews-list">
        {sitter.reviews.map((review, idx) => (
          <div key={idx} className="sp-review-card">
            <div className="sp-review-header">
              <span className="sp-review-parent">{review.parentName}</span>
              <div className="sp-review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? 'var(--gold-400)' : 'none'}
                    color="var(--gold-400)"
                  />
                ))}
              </div>
            </div>
            <p className="sp-review-text">
              {isKo ? review.commentKo : review.comment}
            </p>
            <div className="sp-review-footer">
              <span className="sp-review-date">{review.date}</span>
              <span className="sp-review-verified">
                <BadgeCheck size={14} />
                {t('sitterProfile.verifiedSession')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
