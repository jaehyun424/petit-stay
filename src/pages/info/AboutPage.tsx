import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Heart, Globe, Eye, Users, Award } from 'lucide-react';
import { InfoLayout } from './InfoLayout';

const values = [
  { icon: Shield, key: 'safety' },
  { icon: Heart, key: 'trust' },
  { icon: Globe, key: 'accessibility' },
  { icon: Eye, key: 'transparency' },
  { icon: Users, key: 'partnership' },
  { icon: Award, key: 'excellence' },
] as const;

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.about.title')} subtitle={t('info.about.subtitle')}>
      {/* Mission & Vision Section */}
      <section className="info-section info-section-split">
        <div>
          <h2>{t('info.about.missionTitle')}</h2>
          <p>{t('info.about.missionDesc')}</p>
        </div>
        <div>
          <h2>{t('info.about.visionTitle')}</h2>
          <p>{t('info.about.visionDesc')}</p>
        </div>
      </section>

      {/* Story Section - distinct background */}
      <section className="info-section info-section-alt">
        <h2>{t('info.about.storyTitle')}</h2>
        <p>{t('info.about.storyDesc1')}</p>
        <p>{t('info.about.storyDesc2')}</p>
      </section>

      {/* How We Work Section */}
      <section className="info-section">
        <h2>{t('info.about.howWeWorkTitle')}</h2>
        <p>{t('info.about.howWeWorkDesc')}</p>
        <ul>
          <li>{t('info.about.bullet1')}</li>
          <li>{t('info.about.bullet2')}</li>
          <li>{t('info.about.bullet3')}</li>
          <li>{t('info.about.bullet4')}</li>
        </ul>
      </section>

      {/* Values Grid Section - distinct background */}
      <section className="info-section info-section-alt">
        <h2>{t('info.about.valuesTitle')}</h2>
        <div className="info-values-grid">
          {values.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              className="info-value-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Icon size={24} className="info-value-icon" />
              <h3>{t(`info.about.value_${key}`)}</h3>
              <p>{t(`info.about.value_${key}Desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Operations Section */}
      <section className="info-section">
        <h2>{t('info.about.whereTitle')}</h2>
        <p>{t('info.about.whereDesc')}</p>
      </section>

      {/* Team Section - distinct background */}
      <section className="info-section info-section-alt">
        <h2>{t('info.about.teamTitle')}</h2>
        <p>{t('info.about.teamDesc')}</p>
      </section>
    </InfoLayout>
  );
}
