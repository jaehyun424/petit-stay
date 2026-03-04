// ============================================
// Petit Stay - Badge Component
// ============================================

import { Star, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ----------------------------------------
// Types
// ----------------------------------------
type BadgeVariant = 'primary' | 'gold' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
    className?: string;
}

interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'active' | 'emergency' | 'pending_guest_consent' | 'pending_assignment' | 'sitter_assigned' | 'sitter_confirmed' | 'issue_reported';
}

interface TierBadgeProps {
    tier: 'gold' | 'silver';
    showLabel?: boolean;
}

// ----------------------------------------
// Badge Component
// ----------------------------------------
export function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    icon,
    className = '',
}: BadgeProps) {
    const classes = [
        'badge',
        `badge-${variant}`,
        size === 'sm' ? 'badge-sm' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {icon && <span className="badge-icon">{icon}</span>}
            {children}
        </span>
    );
}

// ----------------------------------------
// Status Badge
// ----------------------------------------
const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeVariant; labelKey: string }> = {
    pending: { variant: 'warning', labelKey: 'status.pending' },
    confirmed: { variant: 'primary', labelKey: 'status.confirmed' },
    in_progress: { variant: 'primary', labelKey: 'status.inProgress' },
    active: { variant: 'success', labelKey: 'status.active' },
    completed: { variant: 'success', labelKey: 'status.completed' },
    cancelled: { variant: 'neutral', labelKey: 'status.cancelled' },
    no_show: { variant: 'error', labelKey: 'status.noShow' },
    emergency: { variant: 'error', labelKey: 'status.emergency' },
    pending_guest_consent: { variant: 'warning', labelKey: 'status.pendingGuestConsent' },
    pending_assignment: { variant: 'warning', labelKey: 'status.pendingAssignment' },
    sitter_assigned: { variant: 'primary', labelKey: 'status.sitterAssigned' },
    sitter_confirmed: { variant: 'success', labelKey: 'status.sitterConfirmed' },
    issue_reported: { variant: 'error', labelKey: 'status.issueReported' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation();
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant}>
            <span className={`status-dot status-dot-${config.variant === 'success' ? 'success' : config.variant === 'error' ? 'error' : config.variant === 'warning' ? 'warning' : 'neutral'}`} />
            {t(config.labelKey)}
        </Badge>
    );
}

// ----------------------------------------
// Tier Badge
// ----------------------------------------
export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
    const { t } = useTranslation();
    const isGold = tier === 'gold';

    return (
        <span className={`badge-tier-${tier}`}>
            <Star size={14} strokeWidth={0} fill="currentColor" />
            {showLabel && <span style={{ marginLeft: '4px' }}>{isGold ? t('common.tierGold') : t('common.tierSilver')}</span>}
        </span>
    );
}

// ----------------------------------------
// Safety Record Badge
// ----------------------------------------
interface SafetyBadgeProps {
    days: number;
}

export function SafetyBadge({ days }: SafetyBadgeProps) {
    const { t } = useTranslation();
    return (
        <div className="safety-badge">
            <span className="safety-badge-icon"><Shield size={16} strokeWidth={1.75} /></span>
            <span className="safety-badge-text">
                <strong style={{ marginRight: '4px' }}>{days}</strong>
                {t('hotel.daysWithoutIncident').replace('{{count}}', '')}
            </span>
        </div>
    );
}
