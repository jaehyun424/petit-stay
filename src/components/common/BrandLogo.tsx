// ============================================
// Petit Stay - Brand Logo Component
// Rounded-square with gold gradient "P" lettermark
// ============================================

import { useId } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 52,
};

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const px = sizeMap[size];
  const gradId = useId();

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      className={`brand-logo ${className}`}
      aria-hidden="true"
    >
      {/* Rounded-square background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradId})`} />
      {/* Stylized "P" lettermark */}
      <path
        d="M16 36V12h8.5c2.8 0 4.9.7 6.4 2.1 1.5 1.4 2.2 3.3 2.2 5.7 0 2.4-.7 4.3-2.2 5.7-1.5 1.4-3.6 2.1-6.4 2.1H20.5V36H16z
           M20.5 24h4c1.5 0 2.6-.4 3.4-1.1.8-.8 1.2-1.8 1.2-3.1s-.4-2.3-1.2-3.1c-.8-.7-1.9-1.1-3.4-1.1h-4V24z"
        fill="white"
      />
      {/* Small star accent */}
      <path
        d="M34 10l.9 1.8 2 .3-1.5 1.4.4 2L34 14.5l-1.8 1 .4-2-1.5-1.4 2-.3z"
        fill="white"
        opacity="0.85"
      />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#D3B167" />
          <stop offset="100%" stopColor="#9E8047" />
        </linearGradient>
      </defs>
    </svg>
  );
}
