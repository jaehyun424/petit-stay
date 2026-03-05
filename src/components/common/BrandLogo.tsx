// ============================================
// Petit Stay - Brand Logo Component
// Pure text logo in elegant serif font
// ============================================

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const sizeMap = {
  sm: '1rem',
  md: '1.25rem',
  lg: '1.75rem',
};

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const fontSize = sizeMap[size];

  return (
    <span className={`brand-logo-wrap brand-logo-text ${className}`}>
      <span className="brand-logo-name" style={{ fontSize }}>
        Petit<span className="brand-logo-name-gold">Stay</span>
      </span>
    </span>
  );
}
