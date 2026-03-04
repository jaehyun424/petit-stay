// ============================================
// Petit Stay - Ops Console Reports (Enhanced)
// ============================================

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, BarChart3, Users, Calendar } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/ops-dashboard.css';

// ----------------------------------------
// Demo sitter utilization data
// ----------------------------------------
const DEMO_SITTER_UTILIZATION = [
    { name: 'Kim M.', utilization: 87, sessions: 34 },
    { name: 'Park S.', utilization: 72, sessions: 28 },
    { name: 'Lee J.', utilization: 91, sessions: 38 },
    { name: 'Choi Y.', utilization: 65, sessions: 22 },
    { name: 'Tanaka A.', utilization: 78, sessions: 30 },
    { name: 'Suzuki H.', utilization: 83, sessions: 32 },
];

// Demo demand heatmap: rows = days of week, cols = hours (8-22)
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const DEMO_DEMAND_HEATMAP: Record<string, number[]> = {
    mon: [1, 2, 3, 4, 3, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2],
    tue: [1, 2, 2, 3, 3, 2, 3, 4, 4, 3, 3, 4, 5, 4, 2],
    wed: [2, 3, 3, 4, 4, 3, 4, 5, 5, 4, 4, 5, 6, 4, 3],
    thu: [1, 2, 3, 3, 3, 2, 3, 4, 5, 4, 3, 5, 6, 4, 2],
    fri: [2, 3, 4, 5, 4, 3, 4, 6, 7, 6, 5, 7, 8, 6, 4],
    sat: [3, 4, 5, 6, 5, 4, 5, 7, 8, 7, 6, 8, 9, 7, 5],
    sun: [2, 3, 4, 5, 4, 3, 4, 6, 7, 5, 5, 6, 7, 5, 3],
};

function getHeatColor(value: number, max: number): string {
    const intensity = max > 0 ? value / max : 0;
    if (intensity < 0.2) return 'var(--glass-bg)';
    if (intensity < 0.4) return 'rgba(99, 102, 241, 0.15)';
    if (intensity < 0.6) return 'rgba(99, 102, 241, 0.3)';
    if (intensity < 0.8) return 'rgba(99, 102, 241, 0.5)';
    return 'rgba(99, 102, 241, 0.75)';
}

// ----------------------------------------
// Custom Tooltip
// ----------------------------------------
function OpsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rpt-custom-tooltip" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
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
export default function OpsReports() {
    const { t } = useTranslation();
    const { stats, hotels, isLoading } = useOpsData();

    const totalRevenue = hotels.reduce((sum, h) => sum + h.revenue, 0);
    const totalCommission = hotels.reduce((sum, h) => sum + h.commission, 0);

    // Cross-hotel comparison chart data
    const hotelComparisonData = useMemo(() => {
        return hotels.map((h) => ({
            name: h.name.length > 12 ? h.name.substring(0, 12) + '...' : h.name,
            [t('ops.revenue')]: h.revenue,
            [t('ops.commission')]: h.commission,
            [t('ops.bookings')]: h.bookingsThisMonth,
        }));
    }, [hotels, t]);

    // Max demand for heatmap color scaling
    const maxDemand = useMemo(() => {
        let max = 0;
        for (const day of DAY_KEYS) {
            for (const v of DEMO_DEMAND_HEATMAP[day]) {
                if (v > max) max = v;
            }
        }
        return max;
    }, []);

    // CSV export
    const handleExport = () => {
        const headers = [t('ops.hotel'), t('ops.revenue'), t('ops.commission'), t('ops.net')];
        const rows = hotels.map((h) => [h.name, String(h.revenue), String(h.commission), String(h.revenue - h.commission)]);
        const csvContent = [
            headers.join(','),
            ...rows.map((r) => r.join(',')),
            '',
            `${t('ops.total')},${totalRevenue},${totalCommission},${totalRevenue - totalCommission}`,
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `petit-stay-ops-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

    return (
        <div className="ops-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('ops.reports')}</h1>
                    <p className="page-subtitle">{t('ops.revenueBreakdown')}</p>
                </div>
                <Button variant="gold" icon={<Download size={20} />} onClick={handleExport}>{t('ops.exportData')}</Button>
            </div>

            {/* Cross-Hotel Revenue Comparison Chart */}
            <div className="ops-grid-2">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <BarChart3 size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.hotelComparison')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {hotels.length === 0 ? (
                            <EmptyState
                                icon={<BarChart3 size={32} strokeWidth={1.5} />}
                                title={t('ops.noData')}
                            />
                        ) : (
                            <div style={{ width: '100%', minHeight: 280 }}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={hotelComparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                                        <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                        <Tooltip content={<OpsTooltip />} />
                                        <Legend />
                                        <Bar dataKey={t('ops.revenue')} fill="#6366F1" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey={t('ops.commission')} fill="#C5A059" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* SLA Report */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ops.slaReport')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="ops-sla-grid">
                            <div className="ops-sla-item">
                                <div className="ops-sla-value" style={{ color: stats.slaCompliance >= 95 ? '#4A6F58' : stats.slaCompliance >= 80 ? '#C5A059' : '#9E4747' }}>{stats.slaCompliance}%</div>
                                <div className="ops-sla-label">{t('ops.slaCompliance')}</div>
                            </div>
                            <div className="ops-sla-item">
                                <div className="ops-sla-value" style={{ color: stats.avgSatisfaction >= 4.5 ? '#4A6F58' : stats.avgSatisfaction >= 3.5 ? '#C5A059' : '#9E4747' }}>{stats.avgSatisfaction}</div>
                                <div className="ops-sla-label">{t('ops.avgSatisfaction')}</div>
                            </div>
                            <div className="ops-sla-item">
                                <div className="ops-sla-value" style={{ color: stats.openIssues === 0 ? '#4A6F58' : stats.openIssues <= 3 ? '#C5A059' : '#9E4747' }}>{stats.openIssues}</div>
                                <div className="ops-sla-label">{t('ops.openIssues')}</div>
                            </div>
                            <div className="ops-sla-item">
                                <div className="ops-sla-value">{stats.totalBookingsThisMonth}</div>
                                <div className="ops-sla-label">{t('ops.monthlyBookings')}</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Sitter Utilization + Demand Heatmap */}
            <div className="ops-grid-2" style={{ marginTop: 'var(--space-6)' }}>
                {/* Sitter Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Users size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.sitterUtilization')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div style={{ width: '100%', minHeight: 280 }}>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={DEMO_SITTER_UTILIZATION} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <Tooltip content={<OpsTooltip />} />
                                    <Bar dataKey="utilization" name={t('reports.utilizationPercent')} fill="#6366F1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Demand Heatmap */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Calendar size={18} strokeWidth={2} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            {t('reports.demandHeatmap')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="ops-heatmap-wrapper">
                            <div className="ops-heatmap">
                                {/* Hour header */}
                                <div className="ops-heatmap-row">
                                    <div className="ops-heatmap-day-label" />
                                    {HOURS.map((h) => (
                                        <div key={h} className="ops-heatmap-hour-label">{h}</div>
                                    ))}
                                </div>
                                {/* Day rows */}
                                {DAY_KEYS.map((day) => (
                                    <div key={day} className="ops-heatmap-row">
                                        <div className="ops-heatmap-day-label">{t(`reports.day.${day}`)}</div>
                                        {DEMO_DEMAND_HEATMAP[day].map((val, i) => (
                                            <div
                                                key={i}
                                                className="ops-heatmap-cell"
                                                style={{ background: getHeatColor(val, maxDemand) }}
                                                title={`${t(`reports.day.${day}`)} ${HOURS[i]}:00 - ${val} ${t('reports.bookingsLabel')}`}
                                            >
                                                {val > 0 ? val : ''}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="ops-heatmap-legend">
                                <span className="ops-heatmap-legend-label">{t('reports.low')}</span>
                                <div className="ops-heatmap-legend-bar" />
                                <span className="ops-heatmap-legend-label">{t('reports.high')}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Revenue Table */}
            <Card style={{ marginTop: 'var(--space-6)' }}>
                <CardHeader>
                    <CardTitle>{t('ops.revenueBreakdown')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="ops-table-wrapper">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th>{t('ops.hotel')}</th>
                                    <th>{t('ops.revenue')}</th>
                                    <th>{t('ops.commission')}</th>
                                    <th>{t('ops.net')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hotels.length === 0 && (
                                    <tr><td colSpan={4}>
                                        <EmptyState
                                            icon={<BarChart3 size={32} strokeWidth={1.5} />}
                                            title={t('ops.noData')}
                                        />
                                    </td></tr>
                                )}
                                {hotels.map((hotel) => (
                                    <tr key={hotel.id} className="ops-table-row-hover">
                                        <td>{hotel.name}</td>
                                        <td>{formatCurrency(hotel.revenue)}</td>
                                        <td>{formatCurrency(hotel.commission)}</td>
                                        <td className="ops-amount-bold">{formatCurrency(hotel.revenue - hotel.commission)}</td>
                                    </tr>
                                ))}
                                <tr className="ops-table-total">
                                    <td><strong>{t('ops.total')}</strong></td>
                                    <td><strong>{formatCurrency(totalRevenue)}</strong></td>
                                    <td><strong>{formatCurrency(totalCommission)}</strong></td>
                                    <td className="ops-amount-bold"><strong>{formatCurrency(totalRevenue - totalCommission)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
