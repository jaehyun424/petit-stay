import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function PartnerCTA() {
  const { t } = useTranslation();

  return (
    <section className="v2-partner section-padded">
      <div className="v2-partner-inner">
        <ScrollReveal>
          <div className="v2-partner-icon-wrap">
            <Building2 size={36} strokeWidth={1.5} />
          </div>
          <h2 className="v2-partner-title">{t('landing.partnerTitle')}</h2>
          <p className="v2-partner-desc">{t('landing.partnerDesc')}</p>
          <Link to="/register?role=partner" className="v2-partner-btn">
            {t('landing.partnerBtn')}
            <ArrowRight size={18} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
