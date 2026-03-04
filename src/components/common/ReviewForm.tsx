// ============================================
// Petit Stay - Review Form Component
// ============================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import '../../styles/components/review-form.css';

interface ReviewFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: { rating: number; comment: string; tags: string[] }) => Promise<void>;
    bookingInfo?: { sitterName: string; date: string };
}

const REVIEW_TAG_KEYS = [
    'professional', 'punctual', 'creative', 'communicative',
    'attentive', 'fun', 'safe', 'experienced',
] as const;

const getReviewTags = (t: (key: string) => string) =>
    REVIEW_TAG_KEYS.map((key) => ({
        key,
        label: t(`review.tag${key.charAt(0).toUpperCase() + key.slice(1)}`),
    }));

export function ReviewForm({ isOpen, onClose, onSubmit, bookingInfo }: ReviewFormProps) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const reviewTags = getReviewTags(t);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ rating, comment, tags: selectedTags });
            setRating(0);
            setComment('');
            setSelectedTags([]);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('review.leaveReview')} size="md">
            <div className="review-form">
                {bookingInfo && (
                    <p className="review-form-intro">
                        {t('review.rateExperience', { sitterName: bookingInfo.sitterName, date: bookingInfo.date })}
                    </p>
                )}

                {/* Star Rating */}
                <div className="review-stars" role="group" aria-label={t('aria.rating')}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`review-star ${star <= (hoverRating || rating) ? 'review-star-active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        >
                            <Star
                                size={28}
                                strokeWidth={1.5}
                                fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                            />
                        </button>
                    ))}
                    <span className="review-stars-label">
                        {rating > 0 ? `${rating}/5` : t('review.selectRating')}
                    </span>
                </div>

                {/* Tags */}
                <div className="review-tags">
                    {reviewTags.map(({ key, label }) => (
                        <button
                            key={key}
                            className={`review-tag ${selectedTags.includes(key) ? 'review-tag-active' : ''}`}
                            onClick={() => toggleTag(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    className="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('review.experiencePlaceholder')}
                    rows={4}
                />

                <div className="review-form-actions">
                    <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button
                        variant="gold"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={rating === 0}
                    >
                        {t('review.submitReview')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// Star display component for showing existing reviews
interface StarRatingProps {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

const starSizeMap = { sm: 14, md: 18, lg: 22 };

export function StarRating({ rating, size = 'md', showValue = false }: StarRatingProps) {
    const px = starSizeMap[size];
    return (
        <span className={`star-rating star-rating-${size}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={px}
                    strokeWidth={1.5}
                    className={star <= rating ? 'star-filled' : 'star-empty'}
                    fill={star <= rating ? 'currentColor' : 'none'}
                    aria-hidden="true"
                />
            ))}
            {showValue && (
                <span className="star-value">
                    {rating.toFixed(1)}
                </span>
            )}
        </span>
    );
}
