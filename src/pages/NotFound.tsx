// ============================================
// Petit Stay - 404 Not Found Page
// ============================================

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import '../styles/pages/not-found.css';

export default function NotFound() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <motion.div
                className="not-found-content"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <div className="not-found-logo">
                    <BrandLogo size="md" />
                </div>
                <div className="not-found-icon-wrapper">
                    <MapPin size={48} strokeWidth={1.5} />
                </div>
                <div className="not-found-code">{t('notFound.code')}</div>
                <h1 className="not-found-title">
                    {t('notFound.title')}
                </h1>
                <p className="not-found-desc">
                    {t('notFound.description')}
                </p>
                <div className="not-found-actions">
                    <Button variant="secondary" icon={<ArrowLeft size={18} strokeWidth={2} />} onClick={() => navigate(-1)}>
                        {t('notFound.goBack', 'Go Back')}
                    </Button>
                    <Link to="/">
                        <Button variant="gold" icon={<Home size={18} strokeWidth={2} />}>{t('notFound.goHome')}</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
