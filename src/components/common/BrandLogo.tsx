// ============================================
// Petit Stay V2 - Brand Logo
// Pink rabbit face + Playfair Display text
// ============================================

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const sizeMap = {
  sm: { icon: 24, fontSize: '0.875rem', gap: '0.375rem' },
  md: { icon: 32, fontSize: '1.125rem', gap: '0.5rem' },
  lg: { icon: 48, fontSize: '1.5rem', gap: '0.625rem' },
};

function RabbitIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left ear */}
      <ellipse cx="22" cy="16" rx="7" ry="14" fill="#F5A9B8" />
      <ellipse cx="22" cy="16" rx="4" ry="10" fill="#FFD1DC" />
      {/* Right ear */}
      <ellipse cx="42" cy="16" rx="7" ry="14" fill="#F5A9B8" />
      <ellipse cx="42" cy="16" rx="4" ry="10" fill="#FFD1DC" />
      {/* Face */}
      <circle cx="32" cy="40" r="20" fill="#F5A9B8" />
      {/* Left eye */}
      <circle cx="25" cy="37" r="2.5" fill="#1C1C1C" />
      {/* Right eye */}
      <circle cx="39" cy="37" r="2.5" fill="#1C1C1C" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="2.5" ry="2" fill="#FFD1DC" />
    </svg>
  );
}

export function BrandLogo({ size = 'md', className = '', showName = true }: BrandLogoProps) {
  const dims = sizeMap[size];

  return (
    <span
      className={`brand-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
      }}
    >
      <RabbitIcon size={dims.icon} />
      {showName && (
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: dims.fontSize,
            fontWeight: 600,
            color: '#1C1C1C',
            letterSpacing: '-0.01em',
          }}
        >
          Petit<span style={{ color: '#C5A059' }}>Stay</span>
        </span>
      )}
    </span>
  );
}
