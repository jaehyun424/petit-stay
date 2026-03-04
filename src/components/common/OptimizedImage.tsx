// ============================================
// Petit Stay - Optimized Image Component
// Lazy loading, WebP fallback, responsive srcset
// ============================================

import { useState, useRef, useEffect, type CSSProperties } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  webpSrc?: string;
  className?: string;
  style?: CSSProperties;
  placeholderColor?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  webpSrc,
  className,
  style,
  placeholderColor = 'var(--cream-200, #F0EFEA)',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: placeholderColor,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    ...style,
  };

  const imgStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {isInView && (
        <picture>
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            srcSet={srcSet}
            sizes={sizes}
            loading="lazy"
            decoding="async"
            style={imgStyle}
            onLoad={() => setIsLoaded(true)}
          />
        </picture>
      )}
    </div>
  );
}
