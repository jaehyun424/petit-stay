// ============================================
// Petit Stay - 404 Not Found Page
// ============================================

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import '../styles/pages/not-found.css';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="not-found-page">
            <div className="not-found-icon">{t('notFound.code')}</div>
            <h1 className="not-found-title">
                {t('notFound.title')}
            </h1>
            <p className="not-found-desc">
                {t('notFound.description')}
            </p>
            <Link to="/">
                <Button variant="gold">{t('notFound.goHome')}</Button>
            </Link>
        </div>
    );
}
