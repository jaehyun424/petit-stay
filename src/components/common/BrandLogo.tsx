// ============================================
// Petit Stay - Brand Logo Component
// Rounded-square with gold gradient "ps" ligature
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
        {/* Rounded-square background */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradId})`} />
        {/* Stylized "ps" ligature — lowercase italic Playfair feel */}
        <text
          x="24"
          y="31"
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
        {/* Small star accent — minimal */}
        <path
          d="M37 9l.6 1.2 1.3.2-1 .9.3 1.3-1.2-.6-1.2.6.3-1.3-1-.9 1.3-.2z"
          fill="white"
          opacity="0.7"
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#D3B167" />
            <stop offset="100%" stopColor="#9E8047" />
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
