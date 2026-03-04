// ============================================
// Petit Stay - Reports & Analytics Page
// ============================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar, DollarSign, Radio, CheckCircle, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TierBadge, SafetyBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useHotelBookings } from '../../hooks/useBookings';
import { useHotelSessions } from '../../hooks/useSessions';
import { useHotelSitters } from '../../hooks/useSitters';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/pages/hotel-reports.css';

// ----------------------------------------
// Types
// ----------------------------------------
type Period = 'this_week' | 'this_month' | 'last_month';

interface RevenueDataPoint {
    label: string;
    revenue: number;
    bookings: number;
}

// ----------------------------------------
// Demo Revenue Data
// ----------------------------------------
const DEMO_REVENUE_WEEK: RevenueDataPoint[] = [
    { label: 'Mon', revenue: 4200000, bookings: 8 },
    { label: 'Tue', revenue: 3800000, bookings: 7 },
    { label: 'Wed', revenue: 5100000, bookings: 10 },
    { label: 'Thu', revenue: 4600000, bookings: 9 },
    { label: 'Fri', revenue: 6200000, bookings: 12 },
    { label: 'Sat', revenue: 7800000, bookings: 15 },
    { label: 'Sun', revenue: 6500000, bookings: 13 },
];

const DEMO_REVENUE_THIS_MONTH: RevenueDataPoint[] = [
    { label: 'Wk 1', revenue: 28500000, bookings: 52 },
    { label: 'Wk 2', revenue: 31200000, bookings: 58 },
    { label: 'Wk 3', revenue: 26800000, bookings: 48 },
    { label: 'Wk 4', revenue: 33500000, bookings: 62 },
];

const DEMO_REVENUE_LAST_MONTH: RevenueDataPoint[] = [
    { label: 'Wk 1', revenue: 24300000, bookings: 44 },
    { label: 'Wk 2', revenue: 27600000, bookings: 50 },
    { label: 'Wk 3', revenue: 29100000, bookings: 54 },
    { label: 'Wk 4', revenue: 25800000, bookings: 46 },
];

// Period labels moved into component to access t()

// ----------------------------------------
// Stat Card Component
// ----------------------------------------
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    color: 'primary' | 'gold' | 'success' | 'warning';
}

function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        primary: 'rpt-stat-card-primary',
        gold: 'rpt-stat-card-gold',
        success: 'rpt-stat-card-success',
        warning: 'rpt-stat-card-warning',
    };

    return (
        <div className={`rpt-stat-card ${colorClasses[color]}`} role="group" aria-label={label}>
            <div className="rpt-stat-card-icon" aria-hidden="true">{icon}</div>
            <div className="rpt-stat-card-content">
                <div className="rpt-stat-card-value">{value}</div>
                <div className="rpt-stat-card-label">{label}</div>
                {subValue && <div className="rpt-stat-card-sub">{subValue}</div>}
            </div>
        </div>
    );
}

// ----------------------------------------
// Main Component
// ----------------------------------------
export default function Reports() {
    const { t } = useTranslation();

    const PERIOD_LABELS: Record<Period, string> = {
        this_week: t('time.thisWeek'),
        this_month: t('time.thisMonth'),
        last_month: t('earnings.lastMonth'),
    };

    const { user } = useAuth();
    const { bookings, stats, isLoading: bookingsLoading, error: bookingsError, retry: retryBookings } = useHotelBookings(user?.hotelId);
    const { sessions, isLoading: sessionsLoading, error: sessionsError, retry: retrySessions } = useHotelSessions(user?.hotelId);
    const { sitters, isLoading: sittersLoading } = useHotelSitters(user?.hotelId);
    const { success } = useToast();

    const [period, setPeriod] = useState<Period>('this_week');

    const isLoading = bookingsLoading || sessionsLoading || sittersLoading;

    // Revenue chart data based on selected period
    const chartData = useMemo<RevenueDataPoint[]>(() => {
        switch (period) {
            case 'this_week':
                return DEMO_REVENUE_WEEK;
            case 'this_month':
                return DEMO_REVENUE_THIS_MONTH;
            case 'last_month':
                return DEMO_REVENUE_LAST_MONTH;
        }
    }, [period]);

    const maxRevenue = useMemo(() => {
        return Math.max(...chartData.map((d) => d.revenue));
    }, [chartData]);

    const totalChartRevenue = useMemo(() => {
        return chartData.reduce((sum, d) => sum + d.revenue, 0);
    }, [chartData]);

    const totalChartBookings = useMemo(() => {
        return chartData.reduce((sum, d) => sum + d.bookings, 0);
    }, [chartData]);

    // Period comparison: compare current period revenue vs previous period
    const periodComparison = useMemo(() => {
        const currentTotal = chartData.reduce((sum, d) => sum + d.revenue, 0);
        let prevTotal: number;
        switch (period) {
            case 'this_week':
                prevTotal = DEMO_REVENUE_LAST_MONTH.reduce((sum, d) => sum + d.revenue, 0) / 4; // approx weekly from last month
                break;
            case 'this_month':
                prevTotal = DEMO_REVENUE_LAST_MONTH.reduce((sum, d) => sum + d.revenue, 0);
                break;
            case 'last_month':
                prevTotal = DEMO_REVENUE_THIS_MONTH.reduce((sum, d) => sum + d.revenue, 0);
                break;
        }
        if (prevTotal === 0) return { percent: 0, isUp: true };
        const change = ((currentTotal - prevTotal) / prevTotal) * 100;
        return { percent: Math.abs(Math.round(change)), isUp: change >= 0 };
    }, [chartData, period]);

    // Booking stats derived from hook data
    const completionRate = useMemo(() => {
        if (bookings.length === 0) return 0;
        const completed = bookings.filter((b) => b.status === 'completed').length;
        return Math.round((completed / bookings.length) * 100);
    }, [bookings]);

    // Sitter averages
    const avgRating = useMemo(() => {
        if (sitters.length === 0) return 0;
        const total = sitters.reduce((sum, s) => sum + s.rating, 0);
        return (total / sitters.length).toFixed(2);
    }, [sitters]);

    // Format helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

    const formatCompact = (amount: number) => {
        if (amount >= 1000000) {
            return `${formatCurrency(Math.round(amount / 1000000))}M`;
        }
        if (amount >= 1000) {
            return `${formatCurrency(Math.round(amount / 1000))}K`;
        }
        return formatCurrency(amount);
    };

    // Export handler — real CSV download
    const handleExport = () => {
        const headers = [t('reports.period'), t('reports.revenue'), t('nav.bookings')];
        const rows = chartData.map((d) => [d.label, String(d.revenue), String(d.bookings)]);
        const sitterHeaders = [t('reports.sitter'), t('reports.tier'), t('reports.rating'), t('reports.sessionCount'), t('reports.safetyScore')];
        const sitterRows = sitters.map((s) => [s.name, s.tier, String(s.rating), String(s.sessionsCompleted), String(s.safetyDays)]);

        const csvContent = [
            `Report: ${PERIOD_LABELS[period]}`,
            '',
            t('reports.revenueData'),
            headers.join(','),
            ...rows.map((r) => r.join(',')),
            '',
            t('reports.sitterPerformanceCSV'),
            sitterHeaders.join(','),
            ...sitterRows.map((r) => r.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `petitstay-report-${period}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        success(t('reports.exportComplete'), t('reports.csvDownloaded'));
    };

    // ----------------------------------------
    // Loading State
    // ----------------------------------------
    if (isLoading) {
        return (
            <div className="reports-page animate-fade-in">
                <div className="page-header">
                    <div>
                        <Skeleton width="260px" height="2rem" />
                        <Skeleton width="200px" height="1rem" />
                    </div>
                    <Skeleton width="140px" height="40px" />
                </div>
                <div className="rpt-period-tabs">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} width="110px" height="36px" />
                    ))}
                </div>
                <div className="rpt-stats-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="120px" />
                    ))}
                </div>
                <div className="rpt-main-grid">
                    <Skeleton height="340px" />
                    <Skeleton height="340px" />
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="reports-page animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('reports.title')}</h1>
                    <p className="page-subtitle">{t('reports.subtitle')}</p>
                </div>
                <Button variant="gold" icon={<Download size={20} strokeWidth={2} />} onClick={handleExport}>
                    {t('reports.exportReport')}
                </Button>
            </div>

            {bookingsError && <ErrorBanner error={bookingsError} onRetry={retryBookings} />}
            {sessionsError && <ErrorBanner error={sessionsError} onRetry={retrySessions} />}

            {/* Period Selector */}
            <div className="rpt-period-tabs" role="tablist" aria-label="Report period">
                {(['this_week', 'this_month', 'last_month'] as Period[]).map((p) => (
                    <button
                        key={p}
                        role="tab"
                        aria-selected={period === p}
                        className={`rpt-period-tab ${period === p ? 'rpt-period-tab-active' : ''}`}
                        onClick={() => setPeriod(p)}
                    >
                        {PERIOD_LABELS[p]}
                    </button>
                ))}
            </div>

            {/* Booking Summary Cards */}
            <div className="rpt-stats-grid">
                <StatCard
                    icon={<Calendar size={20} strokeWidth={2} />}
                    label={t('reports.totalBookings')}
                    value={stats.todayBookings}
                    subValue={`${stats.pendingBookings} ${t('status.pending').toLowerCase()}`}
                    color="primary"
                />
                <StatCard
                    icon={<Radio size={20} strokeWidth={2} />}
                    label={t('reports.activeSessions')}
                    value={sessions.length}
                    subValue={t('reports.inProgressNow')}
                    color="warning"
                />
                <StatCard
                    icon={<CheckCircle size={20} strokeWidth={2} />}
                    label={t('reports.completionRate')}
                    value={`${completionRate}%`}
                    subValue={`${stats.completedToday} ${t('reports.completedToday')}`}
                    color="success"
                />
                <StatCard
                    icon={<DollarSign size={20} strokeWidth={2} />}
                    label={t('reports.todaysRevenue')}
                    value={formatCurrency(stats.todayRevenue)}
                    subValue={`${stats.safetyDays} ${t('reports.daysWithoutIncident')}`}
                    color="gold"
                />
            </div>

            {/* Main Content Grid */}
            <div className="rpt-main-grid">
                {/* Revenue Chart */}
                <Card className="animate-fade-in-up stagger-1">
                    <CardHeader>
                        <CardTitle subtitle={`${PERIOD_LABELS[period]} \u2014 ${totalChartBookings} ${t('reports.bookings')}`}>
                            {t('reports.revenueOverview')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="rpt-chart-summary">
                            <div className="rpt-chart-total">
                                <span className="rpt-chart-total-label">{t('reports.totalRevenue')}</span>
                                <span className="rpt-chart-total-value">{formatCompact(totalChartRevenue)}</span>
                                <span className={`rpt-chart-change ${periodComparison.isUp ? 'rpt-change-up' : 'rpt-change-down'}`}>
                                    {periodComparison.isUp ? '+' : '-'}{periodComparison.percent}%
                                </span>
                            </div>
                            <div className="rpt-chart-total">
                                <span className="rpt-chart-total-label">{t('nav.bookings')}</span>
                                <span className="rpt-chart-total-value">{totalChartBookings}</span>
                            </div>
                            <div className="rpt-chart-total">
                                <span className="rpt-chart-total-label">{t('reports.avgPerDay')}</span>
                                <span className="rpt-chart-total-value">
                                    {formatCompact(Math.round(totalChartRevenue / chartData.length))}
                                </span>
                            </div>
                        </div>
                        <div className="rpt-bar-chart">
                            {chartData.map((d) => {
                                const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={d.label} className="rpt-bar-col">
                                        <div className="rpt-bar-value">{formatCompact(d.revenue)}</div>
                                        <div className="rpt-bar-track">
                                            <div
                                                className="rpt-bar-fill"
                                                style={{ height: `${heightPct}%` }}
                                            />
                                        </div>
                                        <div className="rpt-bar-label">{d.label}</div>
                                        <div className="rpt-bar-bookings">{d.bookings} {t('reports.bkgs')}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Sitter Performance Table */}
                <Card className="animate-fade-in-up stagger-2">
                    <CardHeader>
                        <CardTitle subtitle={`${sitters.length} ${t('reports.sitters')} \u2014 ${t('reports.avgRating')} ${avgRating}`}>
                            {t('reports.sitterPerformance')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="rpt-table-wrapper">
                            <table className="rpt-table">
                                <thead>
                                    <tr>
                                        <th>{t('reports.sitter')}</th>
                                        <th>{t('reports.tier')}</th>
                                        <th>{t('reports.rating')}</th>
                                        <th>{t('reports.sessionCount')}</th>
                                        <th>{t('reports.safetyScore')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sitters.map((sitter) => (
                                        <tr key={sitter.id}>
                                            <td>
                                                <span className="rpt-sitter-name">{sitter.name}</span>
                                            </td>
                                            <td>
                                                <TierBadge tier={sitter.tier} />
                                            </td>
                                            <td>
                                                <span className="rpt-rating-cell">
                                                    <Star size={14} strokeWidth={1.75} fill="currentColor" className="rpt-rating-star" />
                                                    {sitter.rating.toFixed(1)}
                                                </span>
                                            </td>
                                            <td>{sitter.sessionsCompleted}</td>
                                            <td>
                                                <SafetyBadge days={sitter.safetyDays} />
                                            </td>
                                        </tr>
                                    ))}
                                    {sitters.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="rpt-table-empty">
                                                {t('reports.noSitterData')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
