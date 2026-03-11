import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';
import { sitterProfiles } from '../../../data/v2-demo-sitters';

const DEMO = sitterProfiles['sitter-001'];

function StarRow({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.125rem', color: 'var(--gold-500)' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={s <= count ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

export default function SitterMyReviews() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const reviews = DEMO.reviews;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <SitterV2Layout
      title="My Reviews"
      titleKo="내 리뷰"
      showBack
      pendingRequests={2}
    >
      {/* Summary */}
      <div className="st-card">
        <div className="st-review-summary">
          <span className="st-review-avg">{avgRating}</span>
          <div className="st-review-meta">
            <StarRow count={Math.round(Number(avgRating))} size={16} />
            <span className="st-review-count">
              {reviews.length} {isKo ? '개 리뷰' : `review${reviews.length > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Review list */}
        {reviews.map((review, i) => (
          <div key={i} className="st-review-item">
            <div className="st-review-item-header">
              <span className="st-review-parent-name">{review.parentName}</span>
              <span className="st-review-date">{review.date}</span>
            </div>
            <StarRow count={review.rating} />
            <p className="st-review-comment" style={{ marginTop: '0.5rem' }}>
              {isKo ? review.commentKo : review.comment}
            </p>
          </div>
        ))}
      </div>
    </SitterV2Layout>
  );
}
