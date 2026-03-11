import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ShieldCheck } from 'lucide-react';
import type { DemoSitter } from '../../../data/v2-demo-sitters';

interface SitterCardProps {
  sitter: DemoSitter;
}

export function SitterCard({ sitter }: SitterCardProps) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <Link to={`/sitters/${sitter.id}`} className="search-sitter-card">
      <div className="search-sitter-photo-wrap">
        <img
          src={sitter.photo}
          alt={isKo ? sitter.nameKo : sitter.name}
          className="search-sitter-photo"
          loading="lazy"
        />
        {sitter.certified && (
          <span className="search-sitter-certified-badge" title="Certified">
            <ShieldCheck size={14} />
          </span>
        )}
      </div>

      <div className="search-sitter-body">
        <div className="search-sitter-top">
          <h3 className="search-sitter-name">{isKo ? sitter.nameKo : sitter.name}</h3>
          <div className="search-sitter-rating">
            <Star size={14} fill="var(--gold-400)" color="var(--gold-400)" />
            <span className="search-sitter-rating-num">{sitter.rating}</span>
            <span className="search-sitter-review-count">({sitter.reviewCount})</span>
          </div>
        </div>

        <p className="search-sitter-bio">{isKo ? sitter.shortBioKo : sitter.shortBio}</p>

        <div className="search-sitter-langs">
          {sitter.languages.map((lang) => (
            <span key={lang} className="search-lang-chip">
              {langCode(lang)}
            </span>
          ))}
        </div>

        <div className="search-sitter-badges">
          {sitter.badges.filter((b) => b !== 'Certified').slice(0, 3).map((badge) => (
            <span key={badge} className="search-badge-chip">{badge}</span>
          ))}
        </div>

        <div className="search-sitter-bottom">
          <span className="search-sitter-price">
            ₩{sitter.hourlyRate.toLocaleString()}
            <span className="search-sitter-price-unit">/{t('search.perHour')}</span>
          </span>
          <span className="search-sitter-view-btn">{t('search.viewProfile')}</span>
        </div>
      </div>
    </Link>
  );
}

function langCode(lang: string): string {
  const map: Record<string, string> = {
    English: 'EN',
    Japanese: 'JP',
    Chinese: 'ZH',
    Korean: 'KR',
  };
  return map[lang] || lang.slice(0, 2).toUpperCase();
}
