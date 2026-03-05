// ============================================
// Petit Stay - EmptyState Component
// Reusable empty state display for pages with no data
// ============================================

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import '../../styles/components/empty-state.css';

// ----------------------------------------
// Types
// ----------------------------------------
interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

// ----------------------------------------
// Component
// ----------------------------------------
export function EmptyState({
    icon,
    title,
    description,
    action,
    className = '',
    size = 'md',
}: EmptyStateProps) {
    const sizeClass = size !== 'md' ? `empty-state-${size}` : '';

    return (
        <motion.div
            className={`empty-state ${sizeClass} ${className}`}
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {icon && (
                <div className="empty-state-icon" aria-hidden="true">
                    {icon}
                </div>
            )}
            <h3 className="empty-state-title">{title}</h3>
            {description && (
                <p className="empty-state-description">{description}</p>
            )}
            {action && (
                <div className="empty-state-action">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
