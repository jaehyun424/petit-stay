// ============================================
// Petit Stay - Avatar Component
// ============================================

import React, { memo } from 'react';

// ----------------------------------------
// Types
// ----------------------------------------
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'default' | 'gold';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    className?: string;
}

// ----------------------------------------
// Component
// ----------------------------------------
export const Avatar = memo(function Avatar({
    src,
    alt,
    name,
    size = 'md',
    variant = 'default',
    className = '',
}: AvatarProps) {
    const initials = name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    const sizeClass = size !== 'md' ? `avatar-${size}` : '';
    const variantClass = variant === 'gold' ? 'avatar-gold' : '';

    const classes = [
        'avatar',
        sizeClass,
        variantClass,
        className,
    ].filter(Boolean).join(' ');

    if (src) {
        return (
            <div className={classes}>
                <img src={src} alt={alt || name || 'Avatar'} />
            </div>
        );
    }

    return (
        <div className={classes}>
            {initials}
        </div>
    );
});

// ----------------------------------------
// Avatar Group
// ----------------------------------------
interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    size?: AvatarSize;
}

export function AvatarGroup({ children, max, size = 'md' }: AvatarGroupProps) {
    const childArray = React.Children.toArray(children);
    const displayedChildren = max ? childArray.slice(0, max) : childArray;
    const remaining = max ? childArray.length - max : 0;

    return (
        <div className={`avatar-group avatar-group-${size}`}>
            {displayedChildren.map((child, index) => (
                <div key={index} className="avatar-group-item">
                    {child}
                </div>
            ))}
            {remaining > 0 && (
                <div className={`avatar avatar-${size}`}>
                    +{remaining}
                </div>
            )}
        </div>
    );
}