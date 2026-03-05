// ============================================
// Petit Stay - Icon Wrapper Component
// Consistent sizing & styling for Lucide icons
// ============================================

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
}

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon = memo(function Icon({ icon: LucideIcon, size = 'md', className = '', strokeWidth = 1.75 }: IconProps) {
  const px = sizeMap[size];
  return (
    <LucideIcon
      size={px}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
});
