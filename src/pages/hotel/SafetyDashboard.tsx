// ============================================
// Petit Stay - Safety Dashboard Page
// ============================================

import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ShieldCheck, ClipboardList, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { SafetyBadge, Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Select, Textarea, Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../hooks/useHotel';
import { useHotelIncidents } from '../../hooks/useIncidents';
import { useHotelBookings } from '../../hooks/useBookings';
import { useAllAuditLogs } from '../../hooks/useAuditLog';
import { useToast } from '../../contexts/ToastContext';
import type { AuditAction } from '../../services/auditLog';
import '../../styles/pages/hotel-safety.css';

// ----------------------------------------
// Types
// ----------------------------------------
type FilterTab = 'all' | 'open' | 'investigating' | 'resolved' | 'closed';

// ----------------------------------------
// Helpers
// ----------------------------------------
function getRelativeTime(date: Date, t: (key: string, opts?: Record<string, unknown>) => string): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t('safety.justNow');
    if (diffMins < 60) return t('safety.minAgo', { count: diffMins });
    if (diffHours < 24) return t('safety.hourAgo', { count: diffHours });
    if (diffDays === 1) return t('safety.dayAgo');
    return t('safety.daysAgo', { count: diffDays });
}

function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'low': return 'var(--success-500)';
        case 'medium': return 'var(--gold-500)';
        case 'high': return 'var(--warning-500)';
        case 'critical': return 'var(--error-500)';
        default: return 'var(--text-tertiary)';
    }
}

function getStatusVariant(status: string): 'warning' | 'primary' | 'success' | 'neutral' {
    switch (status) {
        case 'open': return 'warning';
        case 'investigating': return 'primary';
        case 'resolved': return 'success';
        case 'closed': return 'neutral';
        default: return 'neutral';
    }
}

function formatCategory(category: string): string {
    return category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getAuditActionVariant(action: AuditAction): 'success' | 'primary' | 'warning' | 'error' | 'neutral' {
    switch (action) {
        case 'booking_created': return 'primary';
        case 'sitter_assigned':
        case 'sitter_confirmed': return 'success';
        case 'payment_received': return 'success';
        case 'payment_refunded': return 'warning';
        case 'incident_reported': return 'error';
        case 'insurance_claimed': return 'warning';
        case 'insurance_activated': return 'success';
        case 'booking_cancelled': return 'error';
        case 'check_in_completed':
        case 'check_out_completed': return 'success';
        default: return 'neutral';
    }
}

type AuditFilterType = 'all' | 'booking' | 'sitter' | 'payment' | 'incident' | 'insurance';

const AUDIT_ACTION_GROUPS: Record<AuditFilterType, AuditAction[]> = {
    all: [],
    booking: ['booking_created', 'status_changed', 'booking_cancelled', 'booking_extended', 'guest_consent_given'],
    sitter: ['sitter_assigned', 'sitter_confirmed', 'check_in_completed', 'check_out_completed'],
    payment: ['payment_received', 'payment_refunded'],
    incident: ['incident_reported'],
    insurance: ['insurance_activated', 'insurance_claimed'],
};

// ----------------------------------------
// Component
// ----------------------------------------
export default function SafetyDashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const hotelId = user?.hotelId;
    const { hotel, isLoading: hotelLoading } = useHotel(hotelId);
    const { incidents, isLoading: incidentsLoading, createIncident, updateIncidentStatus, error: incidentsError, retry: retryIncidents } = useHotelIncidents(hotelId);
    const { stats, isLoading: bookingsLoading } = useHotelBookings(hotelId);
    const { entries: auditEntries, isLoading: auditLoading } = useAllAuditLogs();
    const toast = useToast();

    const SEVERITY_OPTIONS = [
        { value: 'low', label: t('safety.low') },
        { value: 'medium', label: t('safety.medium') },
        { value: 'high', label: t('safety.high') },
        { value: 'critical', label: t('safety.critical') },
    ];

    const CATEGORY_OPTIONS = [
        { value: 'injury', label: t('safety.injury') },
        { value: 'illness', label: t('safety.illness') },
        { value: 'property_damage', label: t('safety.propertyDamage') },
        { value: 'complaint', label: t('safety.complaint') },
        { value: 'safety_concern', label: t('safety.safetyConcern') },
        { value: 'other', label: t('safety.other') },
    ];

    const FILTER_TABS: { key: FilterTab; label: string }[] = [
        { key: 'all', label: t('common.all') },
        { key: 'open', label: t('safety.open') },
        { key: 'investigating', label: t('safety.investigating') },
        { key: 'resolved', label: t('safety.resolved') },
        { key: 'closed', label: t('safety.closed') },
    ];

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formSeverity, setFormSeverity] = useState('low');
    const [formCategory, setFormCategory] = useState('injury');
    const [formSitterName, setFormSitterName] = useState('');
    const [formSummary, setFormSummary] = useState('');
    const [formSummaryError, setFormSummaryError] = useState('');
    const summaryRef = useRef<HTMLTextAreaElement>(null);

    // Filter state
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [auditFilter, setAuditFilter] = useState<AuditFilterType>('all');
    const [auditBookingFilter, setAuditBookingFilter] = useState('');

    // Derived data
    const safetyDays = hotel?.stats?.safetyDays ?? 0;
    const isLoading = hotelLoading || incidentsLoading || bookingsLoading || auditLoading;

    const filteredIncidents = useMemo(() => {
        if (activeFilter === 'all') return incidents;
        return incidents.filter((inc) => inc.status === activeFilter);
    }, [incidents, activeFilter]);

    const monthlyIncidentCount = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return incidents.filter((inc) => inc.reportedAt >= startOfMonth).length;
    }, [incidents]);

    const complianceRate = monthlyIncidentCount === 0 ? 100 : Math.max(0, Math.round(100 - (monthlyIncidentCount * 2)));

    const filteredAuditEntries = useMemo(() => {
        let filtered = auditEntries;
        if (auditFilter !== 'all') {
            const actions = AUDIT_ACTION_GROUPS[auditFilter];
            filtered = filtered.filter((e) => actions.includes(e.action));
        }
        if (auditBookingFilter.trim()) {
            const q = auditBookingFilter.trim().toLowerCase();
            filtered = filtered.filter((e) => e.bookingId.toLowerCase().includes(q));
        }
        return filtered;
    }, [auditEntries, auditFilter, auditBookingFilter]);

    // Handlers
    const openModal = () => {
        setFormSeverity('low');
        setFormCategory('injury');
        setFormSitterName('');
        setFormSummary('');
        setFormSummaryError('');
        // Use setTimeout to ensure state resets complete before opening modal
        setTimeout(() => setIsModalOpen(true), 0);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        if (!formSummary.trim() || formSummary.trim().length < 10) {
            const errorMsg = !formSummary.trim()
                ? t('common.required', 'This field is required')
                : t('safety.summaryTooShort', 'Summary must be at least 10 characters');
            setFormSummaryError(errorMsg);
            summaryRef.current?.focus();
            return;
        }
        setFormSummaryError('');

        setIsSubmitting(true);
        try {
            await createIncident({
                severity: formSeverity as 'low' | 'medium' | 'high' | 'critical',
                category: formCategory as 'injury' | 'illness' | 'property_damage' | 'complaint' | 'safety_concern' | 'other',
                sitterId: formSitterName,
                report: {
                    summary: formSummary.trim(),
                    details: '',
                    reportedBy: 'hotel',
                    reportedAt: new Date(),
                },
            });
            toast.success(t('safety.incidentReported'), t('safety.reportedSuccess'));
            closeModal();
        } catch {
            toast.error(t('common.failed'), t('safety.reportFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (incidentId: string, newStatus: 'investigating' | 'resolved' | 'closed') => {
        try {
            await updateIncidentStatus(incidentId, newStatus);
            toast.success(t('safety.statusUpdated'), t('safety.statusChangedTo', { status: newStatus }));
        } catch {
            toast.error(t('common.failed'), t('safety.statusUpdateFailed'));
        }
    };

    // ----------------------------------------
    // Render Loading State
    // ----------------------------------------
    if (isLoading) {
        return (
            <div className="safety-page animate-fade-in">
                <div className="page-header">
                    <div>
                        <Skeleton width="300px" height="2rem" />
                        <Skeleton width="250px" height="1rem" />
                    </div>
                </div>
                <Skeleton width="100%" height="140px" borderRadius="var(--radius-2xl)" />
                <div className="safety-grid" style={{ marginTop: 'var(--space-6)' }}>
                    <Skeleton width="100%" height="200px" borderRadius="var(--radius-xl)" />
                    <Skeleton width="100%" height="200px" borderRadius="var(--radius-xl)" />
                    <Skeleton width="100%" height="200px" borderRadius="var(--radius-xl)" />
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="safety-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('safety.title')}</h1>
                    <p className="page-subtitle">{t('safety.subtitle')}</p>
                </div>
                <div className="safety-header-actions">
                    <SafetyBadge days={safetyDays} />
                    <Button
                        variant="danger"
                        size="sm"
                        icon={<Plus size={16} strokeWidth={2.5} />}
                        onClick={openModal}
                    >
                        {t('safety.reportIncident')}
                    </Button>
                </div>
            </div>

            {incidentsError && <ErrorBanner error={incidentsError} onRetry={retryIncidents} />}

            {/* Main Safety Banner */}
            <div className="safety-main-banner">
                <div className="safety-number" aria-live="polite">
                    <AnimatedCounter target={safetyDays} duration={2} className="safety-number-counter" />
                </div>
                <div className="safety-text">
                    <h2>{t('safety.consecutiveDays')}</h2>
                    <p>
                        {safetyDays >= 100
                            ? t('safety.excellentRecord')
                            : safetyDays >= 30
                                ? t('safety.goodProgress')
                                : t('safety.buildingRecord')}
                    </p>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="safety-stats-row">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('safety.currentMonth')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="safety-stat">
                            <span className="number">{stats.completedToday}</span>
                            <span className="label">{t('safety.sessionsCompleted')}</span>
                        </div>
                        <div className="safety-stat">
                            <span className={`number ${monthlyIncidentCount === 0 ? 'text-success' : 'text-error'}`}>
                                {monthlyIncidentCount}
                            </span>
                            <span className="label">{t('safety.incidentsThisMonth')}</span>
                        </div>
                        <div className="safety-stat">
                            <span className="number text-gold">{complianceRate}%</span>
                            <span className="label">{t('safety.complianceRate')}</span>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('safety.trustProtocolStats')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="protocol-list">
                            <div className="protocol-item">
                                <span>{t('safety.digitalBadge')}</span>
                                <Badge variant="success">156/156</Badge>
                            </div>
                            <div className="protocol-item">
                                <span>{t('safety.safeWordConfirmed')}</span>
                                <Badge variant="success">156/156</Badge>
                            </div>
                            <div className="protocol-item">
                                <span>{t('safety.jointChecklist')}</span>
                                <Badge variant="success">154/156</Badge>
                            </div>
                            <div className="protocol-item">
                                <span>{t('safety.emergencyConsent')}</span>
                                <Badge variant="success">156/156</Badge>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Incident List Section */}
            <Card>
                <CardHeader
                    action={
                        <Button variant="ghost" size="sm" icon={<Plus size={16} strokeWidth={2.5} />} onClick={openModal}>
                            {t('safety.reportNewIncident')}
                        </Button>
                    }
                >
                    <CardTitle subtitle={t('safety.totalIncidentsOnRecord', { count: incidents.length })}>
                        {t('safety.incidentHistory')}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    {/* Filter Tabs */}
                    <div className="incident-filter-tabs" role="tablist" aria-label="Incident status filter">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={activeFilter === tab.key}
                                className={`incident-filter-tab ${activeFilter === tab.key ? 'incident-filter-tab-active' : ''}`}
                                onClick={() => setActiveFilter(tab.key)}
                            >
                                {tab.label}
                                {tab.key !== 'all' && (
                                    <span className="incident-filter-count">
                                        {incidents.filter((i) => i.status === tab.key).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Incident List */}
                    {filteredIncidents.length === 0 ? (
                        <div className="empty-incidents">
                            <span className="empty-icon"><ShieldCheck size={48} strokeWidth={1.5} /></span>
                            <h4>{t('safety.noIncidents')}</h4>
                            <p>
                                {activeFilter === 'all'
                                    ? t('safety.noIncidentsDesc')
                                    : t('safety.noFilteredIncidents', { filter: activeFilter })}
                            </p>
                        </div>
                    ) : (
                        <div className="incident-list">
                            {filteredIncidents.map((incident) => (
                                <div key={incident.id} className="incident-row" style={{ borderLeft: `4px solid ${getSeverityColor(incident.severity)}` }}>
                                    <div className="incident-row-left">
                                        <span
                                            className="incident-severity-dot"
                                            style={{ backgroundColor: getSeverityColor(incident.severity) }}
                                            title={incident.severity}
                                            role="img"
                                            aria-label={`Severity: ${incident.severity}`}
                                        />
                                        <div className="incident-row-info">
                                            <div className="incident-row-header">
                                                <span className="incident-category">{formatCategory(incident.category)}</span>
                                                <Badge variant={getStatusVariant(incident.status)} size="sm">
                                                    {incident.status}
                                                </Badge>
                                            </div>
                                            <p className="incident-summary">{incident.summary}</p>
                                            <div className="incident-meta">
                                                {incident.sitterName && (
                                                    <span className="incident-meta-item">{t('safety.sitter', { name: incident.sitterName })}</span>
                                                )}
                                                {incident.childName && (
                                                    <span className="incident-meta-item">{t('safety.child', { name: incident.childName })}</span>
                                                )}
                                                <span className="incident-meta-item">
                                                    {getRelativeTime(incident.reportedAt, t)}
                                                </span>
                                                <span className="incident-meta-item incident-date-full">
                                                    {incident.reportedAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="incident-row-actions">
                                        {incident.status === 'open' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleStatusChange(incident.id, 'investigating')}
                                            >
                                                {t('safety.investigate')}
                                            </Button>
                                        )}
                                        {incident.status === 'investigating' && (
                                            <Button
                                                variant="gold"
                                                size="sm"
                                                onClick={() => handleStatusChange(incident.id, 'resolved')}
                                            >
                                                {t('safety.resolve')}
                                            </Button>
                                        )}
                                        {incident.status === 'resolved' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleStatusChange(incident.id, 'closed')}
                                            >
                                                {t('safety.close')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Audit Log Section */}
            <Card>
                <CardHeader
                    action={
                        <div className="audit-header-controls">
                            <Input
                                placeholder={t('audit.filterByBooking')}
                                value={auditBookingFilter}
                                onChange={(e) => setAuditBookingFilter(e.target.value)}
                                style={{ width: '160px', margin: 0 }}
                            />
                        </div>
                    }
                >
                    <CardTitle
                        subtitle={t('audit.totalEntries', { count: filteredAuditEntries.length })}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <ClipboardList size={18} />
                            {t('audit.title')}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    {/* Audit Filter Tabs */}
                    <div className="incident-filter-tabs" role="tablist" aria-label="Audit action filter">
                        {(['all', 'booking', 'sitter', 'payment', 'incident', 'insurance'] as AuditFilterType[]).map((key) => (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={auditFilter === key}
                                className={`incident-filter-tab ${auditFilter === key ? 'incident-filter-tab-active' : ''}`}
                                onClick={() => setAuditFilter(key)}
                            >
                                <Filter size={12} />
                                {t(`audit.filter_${key}`)}
                            </button>
                        ))}
                    </div>

                    {/* Audit Timeline */}
                    {filteredAuditEntries.length === 0 ? (
                        <div className="empty-incidents">
                            <span className="empty-icon"><ClipboardList size={48} strokeWidth={1.5} /></span>
                            <h4>{t('audit.noEntries')}</h4>
                            <p>{t('audit.noEntriesDesc')}</p>
                        </div>
                    ) : (
                        <div className="audit-timeline">
                            {filteredAuditEntries.map((entry) => (
                                <div key={entry.id} className="audit-timeline-item">
                                    <div className="audit-timeline-dot" />
                                    <div className="audit-timeline-content">
                                        <div className="audit-timeline-header">
                                            <Badge variant={getAuditActionVariant(entry.action)} size="sm">
                                                {t(`audit.action_${entry.action}`)}
                                            </Badge>
                                            <span className="audit-booking-id">{entry.bookingId}</span>
                                        </div>
                                        <p className="audit-details">{entry.details}</p>
                                        <div className="audit-meta">
                                            <span>{entry.userName}</span>
                                            <span>{entry.timestamp.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Incident Report Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={t('safety.reportNewIncident')}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="danger" onClick={handleSubmit} isLoading={isSubmitting}>
                            {t('safety.submitReport')}
                        </Button>
                    </>
                }
            >
                <div className="incident-form">
                    <div className="incident-form-row">
                        <Select
                            label={t('safety.severity')}
                            options={SEVERITY_OPTIONS}
                            value={formSeverity}
                            onChange={(e) => setFormSeverity(e.target.value)}
                        />
                        <Select
                            label={t('safety.category')}
                            options={CATEGORY_OPTIONS}
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                        />
                    </div>
                    <Input
                        label={t('safety.sitterNameOptional')}
                        placeholder={t('safety.enterSitterName')}
                        value={formSitterName}
                        onChange={(e) => setFormSitterName(e.target.value)}
                    />
                    <Textarea
                        ref={summaryRef}
                        label={t('safety.incidentSummary')}
                        placeholder={t('safety.describeSummary')}
                        value={formSummary}
                        onChange={(e) => { setFormSummary(e.target.value); if (formSummaryError) setFormSummaryError(''); }}
                        rows={5}
                        error={formSummaryError}
                    />
                </div>
            </Modal>
        </div>
    );
}
