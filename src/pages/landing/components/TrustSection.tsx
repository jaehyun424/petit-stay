import { useTranslation } from 'react-i18next';
import { ShieldCheck, Video, Star, CreditCard, FileText } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const trustItems = [
  { icon: <ShieldCheck size={28} strokeWidth={1.5} />, titleKey: 'trustVerified', descKey: 'trustVerifiedDesc' },
  { icon: <Video size={28} strokeWidth={1.5} />, titleKey: 'trustVideo', descKey: 'trustVideoDesc' },
  { icon: <Star size={28} strokeWidth={1.5} />, titleKey: 'trustReview', descKey: 'trustReviewDesc' },
  { icon: <CreditCard size={28} strokeWidth={1.5} />, titleKey: 'trustPayment', descKey: 'trustPaymentDesc' },
  { icon: <FileText size={28} strokeWidth={1.5} />, titleKey: 'trustReport', descKey: 'trustReportDesc' },
];

export function TrustSection() {
  const { t } = useTranslation();

  return (
    <section className="v2-trust">
      <ScrollReveal>
        <div className="v2-trust-header">
          <h2 className="v2-trust-title">{t('landing.trustTitle')}</h2>
          <p className="v2-trust-subtitle">{t('landing.trustSubtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="v2-trust-grid">
        {trustItems.map((item, i) => (
          <ScrollReveal key={item.titleKey} delay={i * 0.08} direction="up">
            <div className="v2-trust-card">
              <div className="v2-trust-icon">{item.icon}</div>
              <h3 className="v2-trust-card-title">{t(`landing.${item.titleKey}`)}</h3>
              <p className="v2-trust-card-desc">{t(`landing.${item.descKey}`)}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
