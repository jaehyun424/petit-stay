// ============================================
// Petit Stay - Brand Logo Component
// Navy + gold mark with integrated house-star motif
// ============================================

import { useId } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 52,
};

export function BrandLogo({ size = 'md', className = '', showName }: BrandLogoProps) {
  const px = sizeMap[size];
  const gradId = useId();
  const navyGradId = useId();

  return (
    <span className={`brand-logo-wrap ${showName ? 'brand-logo-with-name' : ''} ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        className="brand-logo"
        aria-hidden="true"
      >
        {/* Rounded-square background — deep navy */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${navyGradId})`} />

        {/* Small house silhouette — top-left corner accent */}
        <path
          d="M12 18l4-3.5 4 3.5v5h-2.5v-3h-3v3H12v-5z"
          fill={`url(#${gradId})`}
          opacity="0.85"
        />

        {/* Stylized "ps" ligature — lowercase italic Playfair feel */}
        <text
          x="26"
          y="32"
          textAnchor="middle"
          fill="white"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="600"
          fontStyle="italic"
          fontSize="22"
          letterSpacing="-0.5"
        >
          ps
        </text>

        {/* Small star accent — top right */}
        <path
          d="M37 9l.6 1.2 1.3.2-1 .9.3 1.3-1.2-.6-1.2.6.3-1.3-1-.9 1.3-.2z"
          fill={`url(#${gradId})`}
          opacity="0.9"
        />

        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#D3B167" />
            <stop offset="100%" stopColor="#C5A059" />
          </linearGradient>
          <linearGradient id={navyGradId} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
        </defs>
      </svg>
      {showName && (
        <span className="brand-logo-name">
          Petit<span className="brand-logo-name-gold">Stay</span>
        </span>
      )}
    </span>
  );
}
