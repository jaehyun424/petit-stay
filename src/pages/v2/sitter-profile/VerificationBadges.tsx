import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart, UserCheck, Video } from 'lucide-react';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface VerificationBadgesProps {
  sitter: SitterProfileDetail;
}

const verificationItems = [
  { key: 'backgroundCheck' as const, icon: ShieldCheck, labelKey: 'sitterProfile.bgCheck' },
  { key: 'cpr' as const, icon: Heart, labelKey: 'sitterProfile.cprCert' },
  { key: 'reference' as const, icon: UserCheck, labelKey: 'sitterProfile.refCheck' },
  { key: 'videoIntro' as const, icon: Video, labelKey: 'sitterProfile.videoIntroLabel' },
];

export function VerificationBadges({ sitter }: VerificationBadgesProps) {
  const { t } = useTranslation();

  return (
    <section className="sp-section">
      <h2 className="sp-section-title">{t('sitterProfile.verifications')}</h2>
      <div className="sp-verify-grid">
        {verificationItems.map(({ key, icon: Icon, labelKey }) => {
          const verified = sitter.verifications[key];
          return (
            <div key={key} className={`sp-verify-item ${verified ? 'sp-verify-done' : 'sp-verify-pending'}`}>
              <Icon size={18} />
              <span>{t(labelKey)}</span>
              {verified ? (
                <span className="sp-verify-check">✓</span>
              ) : (
                <span className="sp-verify-dash">—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sp-lang-levels">
        <h3 className="sp-subsection-title">{t('sitterProfile.langLevels')}</h3>
        <div className="sp-lang-level-list">
          {sitter.languageLevels.map(({ lang, level }) => (
            <div key={lang} className="sp-lang-level-item">
              <span className="sp-lang-level-name">{lang}</span>
              <span className={`sp-lang-level-badge sp-level-${level.toLowerCase()}`}>
                {level} — {t(`sitterProfile.level${level}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
