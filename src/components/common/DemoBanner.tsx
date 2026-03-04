// ============================================
// Petit Stay - Demo Mode Banner
// ============================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DEMO_MODE } from '../../hooks/useDemo';

export function DemoBanner() {
    const { t } = useTranslation();
    const [dismissed, setDismissed] = useState(false);

    if (!DEMO_MODE || dismissed) return null;

    return (
        <div className="demo-banner" role="status">
            <span className="demo-banner-text">{t('common.demoBanner')}</span>
            <button
                className="demo-banner-dismiss"
                onClick={() => setDismissed(true)}
                aria-label={t('common.dismiss')}
            >
                <X size={14} />
            </button>
        </div>
    );
}
