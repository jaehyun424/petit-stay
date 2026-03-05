import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { InfoLayout } from './InfoLayout';

const newsItems = [1, 2, 3, 4] as const;

export default function PressPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.press.title')} subtitle={t('info.press.subtitle')}>
      <h2>{t('info.press.recentNews')}</h2>
      <div className="info-card-grid">
        {newsItems.map((i) => (
          <motion.div
            key={i}
            className="info-card"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i - 1) * 0.06 }}
          >
            <span className="info-tag">{t(`info.press.news${i}Tag`)}</span>
            <h3>{t(`info.press.news${i}Title`)}</h3>
            <p>{t(`info.press.news${i}Desc`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('info.press.mediaKit')}</h2>
      <p>
        <Trans i18nKey="info.press.mediaKitDesc" components={{ a: <a href="mailto:press@petitstay.com" /> }} />
      </p>

      <h2>{t('info.press.inquiries')}</h2>
      <p>
        <Trans i18nKey="info.press.inquiriesDesc" components={{ a: <a href="mailto:press@petitstay.com" /> }} />
      </p>
    </InfoLayout>
  );
}
