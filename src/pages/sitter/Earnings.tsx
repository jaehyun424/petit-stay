// Sitter Earnings Page

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { useAuth } from '../../contexts/AuthContext';
import { useSitterStats } from '../../hooks/useSitters';
import { TrendingUp, Award, Clock as ClockIcon, Filter, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import '../../styles/pages/sitter-earnings.css';
import {
    DEMO_EARNINGS,
    DEMO_MONTHLY_CHART,
    DEMO_RECENT_PAYMENTS,
    DEMO_HOTEL_BREAKDOWN,
} from '../../data/demo';
import { formatCurrency } from '../../utils/format';

type PeriodFilter = 'this_month' | 'last_3_months' | 'all_time';
type HotelFilter = 'all' | string;

const growthPercent = (current: number, previous: number) =>
    Math.round(((current - previous) / previous) * 100);

function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(0);

    useEffect(() => {
        const duration = 800;
        const start = performance.now();
        const from = 0;

        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value]);

    return <>{formatCurrency(display)}</>;
}

export default function Earnings() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const sitterId = user?.sitterInfo?.sitterId;
    const { stats, isLoading } = useSitterStats(sitterId);

    const [period, setPeriod] = useState<PeriodFilter>('this_month');
    const [hotelFilter, setHotelFilter] = useState<HotelFilter>('all');
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const growth = growthPercent(DEMO_EARNINGS.thisMonth, DEMO_EARNINGS.lastMonth);

    const chartData = period === 'this_month'
        ? DEMO_MONTHLY_CHART.slice(-1)
        : period === 'last_3_months'
            ? DEMO_MONTHLY_CHART.slice(-3)
            : DEMO_MONTHLY_CHART;
    const maxChartAmount = Math.max(...chartData.map((m) => m.amount));

    const filteredPayments = (() => {
        let payments = DEMO_RECENT_PAYMENTS;
        if (hotelFilter !== 'all') {
            payments = payments.filter((p) => p.hotel === hotelFilter);
        }
        if (period === 'this_month') {
            payments = payments.slice(0, 2);
        } else if (period === 'last_3_months') {
            payments = payments.slice(0, 4);
        }
        return payments;
    })();

    const paidCount = filteredPayments.filter((p) => p.status === 'paid').length;
    const pendingCount = filteredPayments.filter((p) => p.status === 'pending').length;

    const summaryAmount = period === 'this_month'
        ? DEMO_EARNINGS.thisMonth
        : period === 'last_3_months'
            ? DEMO_EARNINGS.thisMonth + DEMO_EARNINGS.lastMonth + 2100000
            : chartData.reduce((sum, m) => sum + m.amount, 0);

    if (isLoading) {
        return (
            <div className="earnings-page animate-fade-in">
                <Skeleton height="160px" borderRadius="var(--radius-2xl)" />
                <div className="stats-row mt-4">
                    <Skeleton height="80px" borderRadius="var(--radius-xl)" />
                    <Skeleton height="80px" borderRadius="var(--radius-xl)" />
                </div>
                <Skeleton height="260px" borderRadius="var(--radius-xl)" className="mt-4" />
                <Skeleton height="180px" borderRadius="var(--radius-xl)" className="mt-4" />
                <Skeleton height="240px" borderRadius="var(--radius-xl)" className="mt-4" />
            </div>
        );
    }

    return (
        <div className="earnings-page animate-fade-in">
            {/* Header + Period Filter */}
            <div className="earnings-header">
                <h1 className="earnings-page-title">{t('earnings.title')}</h1>
                <div className="earnings-header-actions">
                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        aria-label={t('common.filter')}
                    >
                        <Filter size={16} strokeWidth={1.75} />
                    </button>
                    <div className="period-filter" role="tablist" aria-label="Earnings period filter">
                        <Button
                            variant={period === 'this_month' ? 'gold' : 'ghost'}
                            size="sm"
                            onClick={() => setPeriod('this_month')}
                            role="tab"
                            aria-selected={period === 'this_month'}
                        >
                            {t('earnings.thisMonth')}
                        </Button>
                        <Button
                            variant={period === 'last_3_months' ? 'gold' : 'ghost'}
                            size="sm"
                            onClick={() => setPeriod('last_3_months')}
                            role="tab"
                            aria-selected={period === 'last_3_months'}
                        >
                            {t('earnings.last3Months')}
                        </Button>
                        <Button
                            variant={period === 'all_time' ? 'gold' : 'ghost'}
                            size="sm"
                            onClick={() => setPeriod('all_time')}
                            role="tab"
                            aria-selected={period === 'all_time'}
                        >
                            {t('earnings.allTime')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hotel Filter */}
            {showFilters && (
                <motion.div
                    className="hotel-filter-row"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="hotel-filter-label">{t('earnings.filterByHotel', 'Filter by Hotel')}</span>
                    <div className="hotel-filter-chips">
                        <button
                            className={`hotel-chip ${hotelFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setHotelFilter('all')}
                        >
                            {t('common.all')}
                        </button>
                        {DEMO_HOTEL_BREAKDOWN.map((h) => (
                            <button
                                key={h.hotel}
                                className={`hotel-chip ${hotelFilter === h.hotel ? 'active' : ''}`}
                                onClick={() => setHotelFilter(h.hotel)}
                            >
                                {h.hotel}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Monthly Summary Card */}
            <Card className="earnings-summary" variant="gold">
                <CardBody>
                    <h3 className="earnings-summary-label">
                        {period === 'this_month'
                            ? t('earnings.thisMonth')
                            : period === 'last_3_months'
                                ? t('earnings.last3Months')
                                : t('earnings.allTime')}
                    </h3>
                    <div className="earnings-amount">
                        <AnimatedCounter value={summaryAmount} />
                    </div>
                    <div className="earnings-meta">
                        <span className="earnings-sessions">
                            {stats?.totalSessions ?? DEMO_EARNINGS.totalSessions} {t('earnings.sessionsCompleted')}
                        </span>
                        <span className={`earnings-growth ${growth >= 0 ? 'positive' : 'negative'}`}>
                            <ArrowUpRight size={14} strokeWidth={2} />
                            {t('earnings.vsLastMonth', { percent: Math.abs(growth) })}
                        </span>
                    </div>
                </CardBody>
            </Card>

            {/* Stats Row */}
            <div className="stats-row">
                <Card>
                    <CardBody>
                        <span className="stat-label">{t('earnings.pending')}</span>
                        <span className="stat-value stat-pending">{formatCurrency(DEMO_EARNINGS.pending)}</span>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <span className="stat-label">{t('earnings.lastMonth')}</span>
                        <span className="stat-value">{formatCurrency(DEMO_EARNINGS.lastMonth)}</span>
                    </CardBody>
                </Card>
            </div>

            {/* Cumulative Stats */}
            <div className="cumulative-stats">
                <div className="cum-stat">
                    <span className="cum-stat-icon"><TrendingUp size={16} strokeWidth={1.75} /></span>
                    <div>
                        <span className="cum-stat-value">{formatCurrency(DEMO_EARNINGS.thisMonth + DEMO_EARNINGS.lastMonth)}</span>
                        <span className="cum-stat-label">{t('earnings.totalEarned', 'Total Earned')}</span>
                    </div>
                </div>
                <div className="cum-stat">
                    <span className="cum-stat-icon"><Award size={16} strokeWidth={1.75} /></span>
                    <div>
                        <span className="cum-stat-value">{formatCurrency(Math.round(DEMO_EARNINGS.thisMonth / (stats?.totalSessions ?? DEMO_EARNINGS.totalSessions)))}</span>
                        <span className="cum-stat-label">{t('earnings.avgPerSession', 'Avg / Session')}</span>
                    </div>
                </div>
                <div className="cum-stat">
                    <span className="cum-stat-icon"><ClockIcon size={16} strokeWidth={1.75} /></span>
                    <div>
                        <span className="cum-stat-value">{stats?.totalSessions ?? DEMO_EARNINGS.totalSessions}</span>
                        <span className="cum-stat-label">{t('earnings.totalSessions', 'Total Sessions')}</span>
                    </div>
                </div>
            </div>

            {/* Monthly Earnings Bar Chart */}
            <Card className="chart-card">
                <CardHeader>
                    <CardTitle>{t('earnings.monthlyEarnings')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="chart-container" role="img" aria-label="Monthly earnings bar chart">
                        {chartData.map((item, index) => {
                            const isCurrentMonth = index === chartData.length - 1;
                            const heightPercent = (item.amount / maxChartAmount) * 100;
                            const isHovered = hoveredBar === index;
                            return (
                                <div
                                    key={item.month}
                                    className="chart-bar-wrapper"
                                    aria-label={`${item.month}: ${formatCurrency(item.amount)}`}
                                    onMouseEnter={() => setHoveredBar(index)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    <span className={`chart-amount ${isHovered ? 'chart-amount-visible' : ''}`} aria-hidden="true">
                                        {formatCurrency(item.amount)}
                                    </span>
                                    <div
                                        className={`chart-bar ${isCurrentMonth ? 'chart-bar-current' : 'chart-bar-default'} ${isHovered ? 'chart-bar-hovered' : ''}`}
                                        style={{ height: `${heightPercent}%` }}
                                        aria-hidden="true"
                                    />
                                    <span className={`chart-label ${isCurrentMonth ? 'chart-label-current' : ''}`} aria-hidden="true">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>

            {/* Hotel Breakdown */}
            <Card className="breakdown-card">
                <CardHeader>
                    <CardTitle>{t('earnings.earningsByHotel')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="hotel-breakdown-list">
                        {DEMO_HOTEL_BREAKDOWN.map((hotel) => (
                            <div key={hotel.hotel} className="hotel-breakdown-row">
                                <div className="hotel-breakdown-info">
                                    <span className="hotel-breakdown-name">{hotel.hotel}</span>
                                    <span className="hotel-breakdown-sessions">{hotel.sessions} {t('earnings.sessions')}</span>
                                </div>
                                <div className="hotel-breakdown-right">
                                    <span className="hotel-breakdown-amount">{formatCurrency(hotel.amount)}</span>
                                    <div className="hotel-breakdown-bar-track">
                                        <div
                                            className="hotel-breakdown-bar-fill"
                                            style={{ width: `${hotel.percentage}%` }}
                                        />
                                    </div>
                                    <span className="hotel-breakdown-pct">{hotel.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Recent Payments with Settlement Status */}
            <Card className="payments-card">
                <CardHeader>
                    <div className="payments-header">
                        <CardTitle>{t('earnings.recentPayments')}</CardTitle>
                        <div className="settlement-summary">
                            <span className="settlement-badge settlement-paid">
                                <CheckCircle size={12} strokeWidth={2} /> {paidCount} {t('earnings.paid')}
                            </span>
                            <span className="settlement-badge settlement-pending">
                                <AlertCircle size={12} strokeWidth={2} /> {pendingCount} {t('earnings.pending')}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <motion.div className="payments-list" initial="hidden" animate="show" variants={staggerContainer}>
                        {filteredPayments.map((payment) => (
                            <motion.div key={payment.id} className="payment-row" variants={staggerItem}>
                                <div className="payment-info">
                                    <span className="payment-date">{payment.date}</span>
                                    <span className="payment-hotel">{payment.hotel}</span>
                                    <span className="payment-hours">{payment.hours} {t('earnings.hours')}</span>
                                </div>
                                <div className="payment-right">
                                    <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                                    <Badge
                                        variant={payment.status === 'paid' ? 'success' : 'warning'}
                                        size="sm"
                                    >
                                        {payment.status === 'paid' ? t('earnings.paid') : t('earnings.pending')}
                                    </Badge>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </CardBody>
            </Card>
        </div>
    );
}
