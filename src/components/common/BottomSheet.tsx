// BottomSheet - Draggable bottom sheet with snap points
import { type ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, type PanInfo, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

type SnapPoint = 'collapsed' | 'half' | 'full';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  initialSnap?: SnapPoint;
  className?: string;
}

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  collapsed: 0,
  half: 50,
  full: 90,
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  initialSnap = 'half',
  className = '',
}: BottomSheetProps) {
  const { t } = useTranslation();
  const controls = useAnimation();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      controls.start({ y: `${100 - SNAP_HEIGHTS[initialSnap]}%` });
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSnap, controls]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocityY = info.velocity.y;
    const offsetY = info.offset.y;

    // Fast downward swipe → close
    if (velocityY > 500 || offsetY > 200) {
      controls.start({ y: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } });
      setTimeout(onClose, 200);
      return;
    }

    // Fast upward swipe → full
    if (velocityY < -500) {
      controls.start({ y: `${100 - SNAP_HEIGHTS.full}%` });
      return;
    }

    // Snap to nearest point based on current position
    const el = sheetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const visiblePercent = ((viewportHeight - rect.top) / viewportHeight) * 100;

    let nearestSnap: SnapPoint = 'half';
    let minDist = Infinity;
    for (const [snap, height] of Object.entries(SNAP_HEIGHTS) as [SnapPoint, number][]) {
      const dist = Math.abs(visiblePercent - height);
      if (dist < minDist) {
        minDist = dist;
        nearestSnap = snap;
      }
    }

    if (nearestSnap === 'collapsed') {
      controls.start({ y: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } });
      setTimeout(onClose, 200);
    } else {
      controls.start({ y: `${100 - SNAP_HEIGHTS[nearestSnap]}%` });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              zIndex: 999,
            }}
          />
          <motion.div
            ref={sheetRef}
            className={`bottom-sheet ${className}`}
            initial={{ y: '100%' }}
            animate={controls}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              height: '92vh',
              background: 'var(--bg-card, white)',
              borderTopLeftRadius: 'var(--radius-xl, 16px)',
              borderTopRightRadius: 'var(--radius-xl, 16px)',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'none',
            }}
          >
            {/* Drag handle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0.75rem 0 0.25rem',
              cursor: 'grab',
            }}>
              <div style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: 'var(--charcoal-300, #B0B0B0)',
              }} />
            </div>

            {/* Header */}
            {title && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem 0.75rem',
                borderBottom: '1px solid var(--border-light, #f0ece7)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label={t('common.cancel')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'var(--text-secondary)',
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              WebkitOverflowScrolling: 'touch',
            }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
