import { useTranslation } from 'react-i18next';
import { Star, ShieldCheck } from 'lucide-react';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface ProfileHeaderProps {
  sitter: SitterProfileDetail;
}

export function ProfileHeader({ sitter }: ProfileHeaderProps) {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <section className="sp-header">
      <div className="sp-photo-wrap">
        <img
          src={sitter.photo.replace('w=400', 'w=800')}
          alt={isKo ? sitter.nameKo : sitter.name}
          className="sp-photo"
        />
        {sitter.certified && (
          <span className="sp-certified-badge" title="Certified Sitter">
            <ShieldCheck size={18} />
            Certified
          </span>
        )}
      </div>

      <div className="sp-header-info">
        <h1 className="sp-name">{isKo ? sitter.nameKo : sitter.name}</h1>
        <span className="sp-age-group">{sitter.ageGroup}</span>

        <p className="sp-bio">{isKo ? sitter.shortBioKo : sitter.shortBio}</p>

        <div className="sp-rating">
          <Star size={18} fill="var(--gold-400)" color="var(--gold-400)" />
          <span className="sp-rating-num">{sitter.rating}</span>
          <span className="sp-rating-count">
            ({sitter.reviewCount} {t('sitterProfile.reviews')})
          </span>
        </div>

        <div className="sp-langs">
          {sitter.languageLevels.map(({ lang, level }) => (
            <span key={lang} className={`sp-lang-chip sp-lang-${level.toLowerCase()}`}>
              {langLabel(lang)} · {level}
            </span>
          ))}
        </div>
      </div>

      {/* Video intro area */}
      <div className="sp-video-area">
        {sitter.introVideo ? (
          <div className="sp-video-placeholder">
            <div className="sp-video-play">▶</div>
            <span>{t('sitterProfile.watchIntro')}</span>
          </div>
        ) : (
          <div className="sp-video-placeholder sp-video-coming">
            <span>{t('sitterProfile.videoComingSoon')}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function langLabel(lang: string): string {
  const map: Record<string, string> = {
    English: 'EN',
    Japanese: 'JP',
    Chinese: 'ZH',
    Korean: 'KR',
  };
  return map[lang] || lang.slice(0, 2).toUpperCase();
}
