import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, ShieldCheck, Send } from 'lucide-react';
import { sitterProfiles } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import '../../styles/pages/v2-review.css';

export default function ReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  // Demo: use first sitter as default
  const sitter = sitterProfiles['sitter-001'];
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rv-page">
        <nav className="rv-nav">
          <div className="rv-nav-inner">
            <Link to="/" className="rv-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
        </nav>
        <div className="rv-success">
          <div className="rv-success-icon">
            <ShieldCheck size={48} />
          </div>
          <h2 className="rv-success-title">
            {isKo ? '리뷰가 등록되었어요!' : 'Review submitted!'}
          </h2>
          <p className="rv-success-text">
            {isKo
              ? '소중한 후기 감사합니다. 시터에게 큰 도움이 됩니다.'
              : 'Thank you for your feedback. It helps our sitters improve.'}
          </p>
          <button className="rv-success-btn" onClick={() => navigate('/')}>
            {isKo ? '홈으로 돌아가기' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rv-page">
      {/* Nav */}
      <nav className="rv-nav">
        <div className="rv-nav-inner">
          <div className="rv-nav-left">
            <button className="rv-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="rv-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="rv-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="rv-header">
        <h1 className="rv-title">
          {isKo ? '돌봄은 어떠셨나요?' : 'How was the care?'}
        </h1>
        <p className="rv-subtitle">
          {isKo ? '솔직한 후기를 남겨주세요' : 'Share your honest experience'}
        </p>
      </div>

      {/* Content */}
      <div className="rv-content">
        {/* Sitter card */}
        <div className="rv-sitter">
          <img src={sitter.photo} alt={sitter.name} className="rv-sitter-photo" />
          <div>
            <p className="rv-sitter-name">{isKo ? sitter.nameKo : sitter.name}</p>
            <p className="rv-sitter-booking">#{bookingId || 'PS-2026-0315'}</p>
          </div>
        </div>

        {/* Star rating */}
        <div className="rv-rating-section">
          <p className="rv-rating-label">
            {isKo ? '별점을 선택해 주세요' : 'Select a rating'}
          </p>
          <div className="rv-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`rv-star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star size={36} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rv-rating-text">
              {rating === 5 ? (isKo ? '최고에요!' : 'Excellent!') :
               rating === 4 ? (isKo ? '좋았어요' : 'Great') :
               rating === 3 ? (isKo ? '보통이에요' : 'Average') :
               rating === 2 ? (isKo ? '아쉬웠어요' : 'Below average') :
               (isKo ? '별로였어요' : 'Poor')}
            </p>
          )}
        </div>

        {/* Text review */}
        <div className="rv-comment-section">
          <label className="rv-comment-label" htmlFor="review-comment">
            {isKo ? '후기를 작성해 주세요' : 'Write your review'}
          </label>
          <textarea
            id="review-comment"
            className="rv-textarea"
            placeholder={isKo
              ? '시터와의 경험을 자유롭게 적어주세요...'
              : 'Share your experience with the sitter...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={500}
          />
          <span className="rv-char-count">{comment.length}/500</span>
        </div>

        {/* Verified badge */}
        <div className="rv-verified">
          <ShieldCheck size={16} />
          <span>
            {isKo
              ? '이 리뷰는 완료된 유료 세션 후에 작성되었습니다'
              : 'This review is from a verified paid session'}
          </span>
        </div>

        {/* Submit */}
        <button
          className="rv-submit-btn"
          disabled={rating === 0}
          onClick={() => setSubmitted(true)}
        >
          <Send size={18} />
          {isKo ? '리뷰 제출' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
