// ============================================
// Petit Stay - Card Component (Motion)
// ============================================

import { motion } from 'framer-motion';

// ----------------------------------------
// Types
// ----------------------------------------
interface CardProps extends React.AriaAttributes {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'gold' | 'hover' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    subtitle?: string;
}

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

// ----------------------------------------
// Components
// ----------------------------------------
export function Card({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
    onClick,
    ...ariaProps
}: CardProps) {
    const variantMap: Record<string, string> = {
        gold: 'card-gold',
        hover: 'card-hoverable',
        elevated: 'card-elevated',
        outlined: 'card-outlined',
    };
    const variantClass = variantMap[variant] || '';
    const paddingClass = padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-sm' : padding === 'lg' ? 'p-lg' : '';
    const clickableClass = onClick ? 'card-clickable' : '';

    const classes = [
        'card',
        variantClass,
        paddingClass,
        clickableClass,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' }}
            transition={{ duration: 0.2 }}
            {...ariaProps}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
    return (
        <div className={`card-header ${className}`}>
            <div className="card-header-content">{children}</div>
            {action && <div className="card-header-action">{action}</div>}
        </div>
    );
}

export function CardTitle({ children, className = '', subtitle }: CardTitleProps) {
    return (
        <div className={className}>
            <h3 className="card-title">{children}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
    );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
    return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return <div className={`card-footer ${className}`}>{children}</div>;
}
