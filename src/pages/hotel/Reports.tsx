// ============================================
// Petit Stay - Reports & Analytics Page (Enhanced)
// ============================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar, DollarSign, Radio, CheckCircle, Star, FileText, TrendingUp, Clock, Award } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { TierBadge, SafetyBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useHotelBookings } from '../../hooks/useBookings';
import { useHotelSessions } from '../../hooks/useSessions';
import { useHotelSitters } from '../../hooks/useSitters';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import { generateHotelMonthlyReport } from '../../services/reportGenerator';
import '../../styles/pages/hotel-reports.css';

// ----------------------------------------
// Types
// ----------------------------------------
type Period = 'this_week' | 'this_month' | 'last_month';

interface RevenueDataPoint {
    label: string;
    revenue: number;
    bookings: number;
    avgRevenue: number;
}

// ----------------------------------------
// Demo Revenue Data
// ----------------------------------------
const DEMO_REVENUE_WEEK: RevenueDataPoint[] = [
    { label: 'Mon', revenue: 4200000, bookings: 8, avgRevenue: 525000 },
    { label: 'Tue', revenue: 3800000, bookings: 7, avgRevenue: 542857 },
    { label: 'Wed', revenue: 5100000, bookings: 10, avgRevenue: 510000 },
    { label: 'Thu', revenue: 4600000, bookings: 9, avgRevenue: 511111 },
    { label: 'Fri', revenue: 6200000, bookings: 12, avgRevenue: 516667 },
    { label: 'Sat', revenue: 7800000, bookings: 15, avgRevenue: 520000 },
    { label: 'Sun', revenue: 6500000, bookings: 13, avgRevenue: 500000 },
];

const DEMO_REVENUE_THIS_MONTH: RevenueDataPoint[] = [
    { label: 'Wk 1', revenue: 28500000, bookings: 52, avgRevenue: 548077 },
    { label: 'Wk 2', revenue: 31200000, bookings: 58, avgRevenue: 537931 },
    { label: 'Wk 3', revenue: 26800000, bookings: 48, avgRevenue: 558333 },
    { label: 'Wk 4', revenue: 33500000, bookings: 62, avgRevenue: 540323 },
];

const DEMO_REVENUE_LAST_MONTH: RevenueDataPoint[] = [
    { label: 'Wk 1', revenue: 24300000, bookings: 44, avgRevenue: 552273 },
    { label: 'Wk 2', revenue: 27600000, bookings: 50, avgRevenue: 552000 },
    { label: 'Wk 3', revenue: 29100000, bookings: 54, avgRevenue: 538889 },
    { label: 'Wk 4', revenue: 25800000, bookings: 46, avgRevenue: 560870 },
];

// Demo SLA data
const DEMO_SLA_DATA = {
    avgResponseMinutes: 8.2,
    fulfillmentRate: 96.5,
    cancelRate: 3.2,
    avgSessionDuration: 3.8,
    repeatBookingRate: 42,
    onTimeRate: 98.1,
};

// ----------------------------------------
// Chart theme colors
// ----------------------------------------
const CHART_COLORS = {
    primary: '#6366F1',
    primaryLight: 'rgba(99, 102, 241, 0.2)',
    gold: '#C5A059',
    goldLight: 'rgba(197, 160, 89, 0.2)',
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.2)',
};

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
                <div className="rpt-stat-card-value">
                    {typeof value === 'number' ? <AnimatedCounter target={value} duration={1.5} /> : value}
                </div>
                <div className="rpt-stat-card-label">{label}</div>
                {subValue && <div className="rpt-stat-card-sub">{subValue}</div>}
            </div>
        </div>
    );
}

// ----------------------------------------
// Custom Tooltip
// ----------------------------------------
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rpt-custom-tooltip">
            <p className="rpt-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} className="rpt-tooltip-value">
                    {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                        ? formatCurrency(entry.value)
                        : entry.value}
                </p>
            ))}
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
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

    const totalChartRevenue = useMemo(() => {
        return chartData.reduce((sum, d) => sum + d.revenue, 0);
    }, [chartData]);

    const totalChartBookings = useMemo(() => {
        return chartData.reduce((sum, d) => sum + d.bookings, 0);
    }, [chartData]);

    // Period comparison
    const periodComparison = useMemo(() => {
        const currentTotal = chartData.reduce((sum, d) => sum + d.revenue, 0);
        let prevTotal: number;
        switch (period) {
            case 'this_week':
                prevTotal = DEMO_REVENUE_LAST_MONTH.reduce((sum, d) => sum + d.revenue, 0) / 4;
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

    // Booking stats
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

    // Sitter radar chart data
    const sitterRadarData = useMemo(() => {
        return sitters.slice(0, 5).map((s) => ({
            name: s.name.split(' ')[0],
            [t('reports.rating')]: s.rating,
            [t('reports.sessionCount')]: Math.min(s.sessionsCompleted / 10, 5),
            [t('reports.safetyScore')]: Math.min(s.safetyDays / 60, 5),
        }));
    }, [sitters, t]);

    // SLA metrics
    const slaData = DEMO_SLA_DATA;

    const formatCompact = (amount: number) => {
        if (amount >= 1000000) {
            return `${formatCurrency(Math.round(amount / 1000000))}M`;
        }
        if (amount >= 1000) {
            return `${formatCurrency(Math.round(amount / 1000))}K`;
        }
        return formatCurrency(amount);
    };

    // CSV Export
    const handleExport = () => {
        const headers = [t('reports.period'), t('reports.revenue'), t('nav.bookings')];
        const rows = chartData.map((d) => [d.label, String(d.revenue), String(d.bookings)]);
        const sitterHeaders = [t('reports.sitter'), t('reports.tier'), t('reports.rating'), t('reports.sessionCount'), t('reports.safetyScore')];
        const sitterRows = sitters.map((s) => [s.name, s.tier, String(s.rating), String(s.sessionsCompleted), String(s.safetyDays)]);

        const csvContent = [
            `Report: ${PERIOD_LABELS[period]}`,
            '',
            t('reports.revenueOverview'),
            headers.join(','),
            ...rows.map((r) => r.join(',')),
            '',
            t('reports.sitterPerformance'),
            sitterHeaders.join(','),
            ...sitterRows.map((r) => r.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const today = new Date().toISOString().split('T')[0];
        link.download = `petit-stay-report-${today}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        success(t('reports.exportComplete'), t('reports.csvDownloaded'));
    };

    // PDF Export
    const handlePdfExport = async () => {
        setIsGeneratingPdf(true);
        try {
            const blob = generateHotelMonthlyReport({
                hotelName: 'Petit Stay Hotel',
                month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                revenueData: chartData,
                totalRevenue: totalChartRevenue,
                totalBookings: totalChartBookings,
                completionRate,
                sitters: sitters.map((s) => ({
                    name: s.name,
                    tier: s.tier,
                    rating: s.rating,
                    sessions: s.sessionsCompleted,
                    safetyDays: s.safetyDays,
                })),
                slaMetrics: slaData,
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = new Date().toISOString().split('T')[0];
            link.download = `petit-stay-monthly-report-${today}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            success(t('reports.pdfGenerated'), t('reports.pdfDownloaded'));
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setIsGeneratingPdf(false);
        }
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
                <div className="rpt-header-actions">
                    <Button variant="secondary" icon={<FileText size={20} strokeWidth={2} />} onClick={handlePdfExport} disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? t('reports.generating') : t('reports.downloadPdf')}
                    </Button>
                    <Button variant="gold" icon={<Download size={20} strokeWidth={2} />} onClick={handleExport}>
                        {t('reports.exportReport')}
                    </Button>
                </div>
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

            {/* Revenue & Avg Revenue Charts */}
            <div className="rpt-main-grid">
                {/* Revenue Bar Chart (recharts) */}
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
                        <div className="rpt-recharts-container">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                    <Tooltip content={<RevenueTooltip />} />
                                    <Bar dataKey="revenue" name={t('reports.revenue')} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Average Revenue Trend (Line Chart) */}
                <Card className="animate-fade-in-up stagger-2">
                    <CardHeader>
                        <CardTitle subtitle={t('reports.avgRevenueDesc')}>
                            <TrendingUp size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.avgRevenuePerBooking')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="rpt-recharts-container">
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                    <Tooltip content={<RevenueTooltip />} />
                                    <Line type="monotone" dataKey="avgRevenue" name={t('reports.avgRevenue')} stroke={CHART_COLORS.gold} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.gold }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Sitter Performance & SLA */}
            <div className="rpt-main-grid" style={{ marginTop: 'var(--space-6)' }}>
                {/* Sitter Rating Radar Chart */}
                <Card className="animate-fade-in-up stagger-3">
                    <CardHeader>
                        <CardTitle subtitle={`${sitters.length} ${t('reports.sitters')} \u2014 ${t('reports.avgRating')} ${avgRating}`}>
                            <Award size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.sitterComparison')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {sitterRadarData.length > 0 ? (
                            <div className="rpt-recharts-container">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart data={sitterRadarData}>
                                        <PolarGrid stroke="var(--border-color)" />
                                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                                        <Radar name={t('reports.rating')} dataKey={t('reports.rating')} stroke={CHART_COLORS.primary} fill={CHART_COLORS.primaryLight} />
                                        <Radar name={t('reports.sessionCount')} dataKey={t('reports.sessionCount')} stroke={CHART_COLORS.gold} fill={CHART_COLORS.goldLight} />
                                        <Radar name={t('reports.safetyScore')} dataKey={t('reports.safetyScore')} stroke={CHART_COLORS.success} fill={CHART_COLORS.successLight} />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="rpt-table-empty">{t('reports.noSitterData')}</p>
                        )}
                    </CardBody>
                </Card>

                {/* SLA Metrics */}
                <Card className="animate-fade-in-up stagger-4">
                    <CardHeader>
                        <CardTitle subtitle={t('reports.slaDesc')}>
                            <Clock size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.slaMetrics')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="rpt-sla-grid">
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value" style={{ color: slaData.avgResponseMinutes <= 10 ? '#4A6F58' : '#C5A059' }}>
                                    {slaData.avgResponseMinutes}{t('reports.min')}
                                </div>
                                <div className="rpt-sla-label">{t('reports.avgResponseTime')}</div>
                            </div>
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value" style={{ color: slaData.fulfillmentRate >= 95 ? '#4A6F58' : '#C5A059' }}>
                                    {slaData.fulfillmentRate}%
                                </div>
                                <div className="rpt-sla-label">{t('reports.fulfillmentRate')}</div>
                            </div>
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value" style={{ color: slaData.cancelRate <= 5 ? '#4A6F58' : '#9E4747' }}>
                                    {slaData.cancelRate}%
                                </div>
                                <div className="rpt-sla-label">{t('reports.cancellationRate')}</div>
                            </div>
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value">{slaData.avgSessionDuration}h</div>
                                <div className="rpt-sla-label">{t('reports.avgSessionDuration')}</div>
                            </div>
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value" style={{ color: '#6366F1' }}>{slaData.repeatBookingRate}%</div>
                                <div className="rpt-sla-label">{t('reports.repeatBookingRate')}</div>
                            </div>
                            <div className="rpt-sla-item">
                                <div className="rpt-sla-value" style={{ color: slaData.onTimeRate >= 95 ? '#4A6F58' : '#C5A059' }}>
                                    {slaData.onTimeRate}%
                                </div>
                                <div className="rpt-sla-label">{t('reports.onTimeRate')}</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Sitter Performance Table */}
            <div className="rpt-section-gap">
            <Card className="animate-fade-in-up stagger-5">
                <CardHeader>
                    <CardTitle subtitle={`${sitters.length} ${t('reports.sitters')}`}>
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
