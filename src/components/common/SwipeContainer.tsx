// SwipeContainer - Reusable swipe gesture wrapper
import { type ReactNode } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  className = '',
}: SwipeContainerProps) {
  const controls = useAnimation();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (offset.x < -threshold || swipe < -10000) {
      onSwipeLeft?.();
    } else if (offset.x > threshold || swipe > 10000) {
      onSwipeRight?.();
    }

    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </motion.div>
  );
}
