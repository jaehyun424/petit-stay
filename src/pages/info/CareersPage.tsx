import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { InfoLayout } from './InfoLayout';

const jobs = [1, 2, 3, 4, 5] as const;
const benefits = [1, 2, 3, 4, 5, 6] as const;
const processSteps = [1, 2, 3, 4] as const;

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.careers.title')} subtitle={t('info.careers.subtitle')}>
      <h2>{t('info.careers.whyTitle')}</h2>
      <p>{t('info.careers.whyDesc')}</p>

      <h2>{t('info.careers.cultureTitle')}</h2>
      <p>{t('info.careers.cultureDesc')}</p>

      <h2>{t('info.careers.lookingForTitle')}</h2>
      <ul>
        <li>{t('info.careers.lookingFor1')}</li>
        <li>{t('info.careers.lookingFor2')}</li>
        <li>{t('info.careers.lookingFor3')}</li>
        <li>{t('info.careers.lookingFor4')}</li>
      </ul>

      <h2>{t('info.careers.openPositions')}</h2>
      <div className="info-card-grid">
        {jobs.map((i) => (
          <motion.div
            key={i}
            className="info-card"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i - 1) * 0.06 }}
          >
            <span className="info-tag">{t(`info.careers.job${i}Tag`)}</span>
            <h3>{t(`info.careers.job${i}Title`)}</h3>
            <p>{t(`info.careers.job${i}Desc`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('info.careers.benefitsTitle')}</h2>
      <ul>
        {benefits.map((i) => (
          <li key={i}>{t(`info.careers.benefit${i}`)}</li>
        ))}
      </ul>

      <h2>{t('info.careers.processTitle')}</h2>
      <ol className="info-process-list">
        {processSteps.map((i) => (
          <li key={i}>{t(`info.careers.processStep${i}`)}</li>
        ))}
      </ol>

      <h2>{t('info.careers.howToApply')}</h2>
      <p>
        <Trans i18nKey="info.careers.applyEmail" components={{ a: <a href="mailto:careers@petitstay.com" /> }} />
      </p>
    </InfoLayout>
  );
}
