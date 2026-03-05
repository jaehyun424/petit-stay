import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/components/error-banner.css';

interface ErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorBanner({ error, onRetry, onDismiss, className = '' }: ErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className={`error-banner ${className}`}
          role="alert"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 'var(--space-4)' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="error-banner-content">
            <span className="error-banner-icon"><AlertTriangle size={16} strokeWidth={2} /></span>
            <span className="error-banner-message">{error}</span>
          </div>
          <div className="error-banner-actions">
            {onRetry && (
              <button className="error-banner-retry" onClick={onRetry}>
                <RefreshCw size={13} strokeWidth={2} />
                {t('common.retry', 'Retry')}
              </button>
            )}
            {onDismiss && (
              <button className="error-banner-dismiss" onClick={onDismiss} aria-label={t('common.dismiss', 'Dismiss')}>
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
