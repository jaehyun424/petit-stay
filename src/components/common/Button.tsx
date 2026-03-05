// ============================================
// Petit Stay - Button Component
// ============================================



// ----------------------------------------
// Types
// ----------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    children: React.ReactNode;
}

// ----------------------------------------
// Component
// ----------------------------------------
export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const variantClass = `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';
    const widthClass = fullWidth ? 'btn-full' : '';

    const classes = [
        'btn',
        variantClass,
        sizeClass,
        widthClass,
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    <span className="btn-loading-text">{children}</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
                </>
            )}
        </button>
    );
}

// ----------------------------------------
// Icon Button
// ----------------------------------------
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon: React.ReactNode;
    'aria-label': string;
}

export function IconButton({
    variant = 'ghost',
    size = 'md',
    icon,
    className = '',
    ...props
}: IconButtonProps) {
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'sm' ? 'btn-icon-sm' : size === 'lg' ? 'btn-icon-lg' : '';

    const classes = [
        'btn',
        'btn-icon',
        variantClass,
        sizeClass,
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {icon}
        </button>
    );
}