// InstallBanner - Shows when app is installable
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/common/useInstallPrompt';

const DISMISS_KEY = 'petit-stay-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallBanner() {
  const { t } = useTranslation();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) return;
    }
    setDismissed(false);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    await promptInstall();
    setDismissed(true);
  };

  if (!canInstall || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="install-banner"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 'env(safe-area-inset-bottom, 16px)',
          left: '1rem',
          right: '1rem',
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          background: 'var(--charcoal-900, #1C1C1C)',
          color: 'white',
          borderRadius: 'var(--radius-xl, 16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 998,
          fontSize: 'var(--text-sm)',
        }}
      >
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md, 8px)',
          background: 'var(--gold-500, #C5A059)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Download size={20} strokeWidth={1.75} color="white" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>
            {t('pwa.installTitle', 'Install Petit Stay')}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8 }}>
            {t('pwa.installDesc', 'Add to home screen for the best experience')}
          </div>
        </div>

        <button
          onClick={handleInstall}
          style={{
            background: 'var(--gold-500, #C5A059)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.5rem 0.875rem',
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: 36,
          }}
        >
          {t('pwa.install', 'Install')}
        </button>

        <button
          onClick={handleDismiss}
          aria-label={t('common.cancel')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '0.375rem',
            minWidth: 32,
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
