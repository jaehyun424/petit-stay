// PullToRefresh - Pull-down gesture to trigger refresh
import { useState, useCallback, type ReactNode } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  pullThreshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  pullThreshold = 80,
  className = '',
}: PullToRefreshProps) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, pullThreshold * 1.5));
    }
  };

  const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
    if (info.offset.y >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(pullThreshold * 0.6);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        controls.start({ y: 0 });
      }
    } else {
      setPullDistance(0);
      controls.start({ y: 0 });
    }
  }, [onRefresh, pullThreshold, isRefreshing, controls]);

  const progress = Math.min(pullDistance / pullThreshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div className={`pull-to-refresh-wrapper ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {showIndicator && (
        <div
          className="pull-to-refresh-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: `${Math.max(pullDistance * 0.6, isRefreshing ? 48 : 0)}px`,
            overflow: 'hidden',
            transition: isRefreshing ? 'height 0.2s' : undefined,
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : progress * 180 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
          >
            <RefreshCw size={18} strokeWidth={1.75} />
          </motion.div>
          <span>
            {isRefreshing
              ? t('pwa.refreshing', 'Refreshing...')
              : progress >= 1
                ? t('pwa.releaseToRefresh', 'Release to refresh')
                : t('pwa.pullToRefresh', 'Pull to refresh')}
          </span>
        </div>
      )}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          touchAction: 'pan-x',
          transform: `translateY(${isRefreshing ? 48 : 0}px)`,
          transition: isRefreshing ? 'transform 0.2s' : undefined,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
