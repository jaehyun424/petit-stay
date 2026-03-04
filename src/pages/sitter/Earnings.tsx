// Sitter Earnings Page

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { useAuth } from '../../contexts/AuthContext';
import { useSitterStats } from '../../hooks/useSitters';
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
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    const growth = growthPercent(DEMO_EARNINGS.thisMonth, DEMO_EARNINGS.lastMonth);
    const maxChartAmount = Math.max(...DEMO_MONTHLY_CHART.map((m) => m.amount));

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

            {/* Monthly Summary Card */}
            <Card className="earnings-summary" variant="gold">
                <CardBody>
                    <h3 className="earnings-summary-label">{t('earnings.thisMonth')}</h3>
                    <div className="earnings-amount">
                        <AnimatedCounter value={DEMO_EARNINGS.thisMonth} />
                    </div>
                    <div className="earnings-meta">
                        <span className="earnings-sessions">
                            {stats?.totalSessions ?? DEMO_EARNINGS.totalSessions} {t('earnings.sessionsCompleted')}
                        </span>
                        <span className={`earnings-growth ${growth >= 0 ? 'positive' : 'negative'}`}>
                            {growth >= 0 ? '▲' : '▼'} {t('earnings.vsLastMonth', { percent: Math.abs(growth) })}
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

            {/* Monthly Earnings Bar Chart */}
            <Card className="chart-card">
                <CardHeader>
                    <CardTitle>{t('earnings.monthlyEarnings')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="chart-container" role="img" aria-label="Monthly earnings bar chart">
                        {DEMO_MONTHLY_CHART.map((item, index) => {
                            const isCurrentMonth = index === DEMO_MONTHLY_CHART.length - 1;
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

            {/* Recent Payments */}
            <Card className="payments-card">
                <CardHeader>
                    <CardTitle>{t('earnings.recentPayments')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <motion.div className="payments-list" initial="hidden" animate="show" variants={staggerContainer}>
                        {DEMO_RECENT_PAYMENTS.map((payment) => (
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
