// ============================================
// Petit Stay - Skeleton Loading Components
// ============================================



// ----------------------------------------
// Types
// ----------------------------------------
interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

interface SkeletonCircleProps {
    size?: number;
    className?: string;
}

// ----------------------------------------
// Skeleton
// ----------------------------------------
export function Skeleton({
    width = '100%',
    height = '1rem',
    borderRadius = 'var(--radius-md)',
    className = '',
}: SkeletonProps) {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
    };

    return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// ----------------------------------------
// Skeleton Text
// ----------------------------------------
export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
    return (
        <div className={`skeleton-text ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? '70%' : '100%'}
                    height="0.875rem"
                    className="skeleton-line"
                />
            ))}
        </div>
    );
}

// ----------------------------------------
// Skeleton Circle
// ----------------------------------------
export function SkeletonCircle({ size = 40, className = '' }: SkeletonCircleProps) {
    return (
        <Skeleton
            width={size}
            height={size}
            borderRadius="50%"
            className={className}
        />
    );
}

// ----------------------------------------
// Card Skeleton
// ----------------------------------------
export function CardSkeleton() {
    return (
        <div className="card">
            <div className="flex gap-4">
                <SkeletonCircle size={48} />
                <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="1.25rem" />
                    <Skeleton width="40%" height="0.875rem" className="mt-2" />
                </div>
            </div>
            <div className="mt-4">
                <SkeletonText lines={2} />
            </div>
        </div>
    );
}

// ----------------------------------------
// List Skeleton
// ----------------------------------------
interface ListSkeletonProps {
    rows?: number;
    className?: string;
}

export function ListSkeleton({ rows = 4, className = '' }: ListSkeletonProps) {
    return (
        <div className={`skeleton-list ${className}`} aria-hidden="true">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-list-item">
                    <SkeletonCircle size={36} />
                    <div style={{ flex: 1 }}>
                        <Skeleton width={i % 2 === 0 ? '70%' : '55%'} height="0.875rem" />
                        <Skeleton width="40%" height="0.75rem" className="mt-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ----------------------------------------
// Table Skeleton
// ----------------------------------------
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
    return (
        <div className={`skeleton-table ${className}`} aria-hidden="true">
            <div className="skeleton-table-header">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} height="0.75rem" width={`${60 + (i % 3) * 15}%`} />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="skeleton-table-row">
                    {Array.from({ length: columns }).map((_, c) => (
                        <Skeleton key={c} height="0.875rem" width={`${50 + (c % 4) * 12}%`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ----------------------------------------
// Dashboard Skeleton (stat cards + chart area)
// ----------------------------------------
export function DashboardSkeleton() {
    return (
        <div className="skeleton-dashboard" aria-hidden="true">
            <div className="skeleton-dashboard-stats">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card">
                        <Skeleton width="40%" height="0.75rem" />
                        <Skeleton width="60%" height="1.5rem" className="mt-2" />
                        <Skeleton width="30%" height="0.625rem" className="mt-2" />
                    </div>
                ))}
            </div>
            <div className="skeleton-dashboard-main mt-6">
                <div className="card">
                    <Skeleton width="30%" height="1rem" />
                    <Skeleton width="100%" height="200px" className="mt-4" borderRadius="var(--radius-lg)" />
                </div>
            </div>
        </div>
    );
}