import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { AlertTriangle, Eye } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/ops/useOpsData';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';
import '../../styles/pages/ops-dashboard.css';

export default function OpsIssues() {
  const { t } = useTranslation();
  const { incidents, isLoading } = useOpsData();
  const toast = useToast();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<typeof incidents[0] | null>(null);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const inc of incidents) {
      if (inc.severity in counts) counts[inc.severity as keyof typeof counts]++;
    }
    return counts;
  }, [incidents]);

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => new Set(prev).add(id));
    toast.success(t('ops.issueResolved'), `#${id}`);
  };

  if (isLoading) {
    return (
      <div className="ops-page animate-fade-in">
        <Skeleton width="240px" height="2rem" />
        <Skeleton height="48px" />
        <Skeleton height="400px" />
      </div>
    );
  }

  const displayIncidents = incidents
    .map((inc) => resolvedIds.has(inc.id) ? { ...inc, status: 'resolved' as const } : inc)
    .filter((inc) => {
      const matchesSeverity = !severityFilter || inc.severity === severityFilter;
      const matchesStatus = !statusFilter || inc.status === statusFilter;
      const matchesSearch = !searchQuery || String(inc.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(inc.sitterName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesStatus && matchesSearch;
    });

  const severityBorderColor: Record<string, string> = {
    critical: 'var(--error-500)',
    high: 'var(--warning-500)',
    medium: 'var(--gold-500)',
    low: 'var(--success-500)',
  };

  const getSeverityVariant = (severity: string) => {
    return severity === 'high' || severity === 'critical' ? 'error' as const : severity === 'medium' ? 'warning' as const : 'neutral' as const;
  };

  const getStatusVariant = (status: string) => {
    return status === 'resolved' || status === 'closed' ? 'success' as const : 'warning' as const;
  };

  const formatDate = (d: unknown): string => {
    if (!d) return '-';
    try {
      if (d instanceof Date) return d.toLocaleDateString();
      if (typeof d === 'object' && d !== null && 'toDate' in d) {
        return (d as { toDate: () => Date }).toDate().toLocaleDateString();
      }
      if (typeof d === 'string') return new Date(d).toLocaleDateString();
      if (typeof d === 'number') return new Date(d).toLocaleDateString();
    } catch { /* ignore */ }
    return '-';
  };

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.issueList')}</h1>
          <p className="page-subtitle">{t('ops.issueCount', { count: incidents.length })}</p>
        </div>
      </div>

      {/* Severity Quick Stats */}
      <div className="ops-summary-bar mb-6">
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--error-500)' }}>{severityCounts.critical}</div>
          <div className="ops-summary-label">{t('safety.critical')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--warning-500)' }}>{severityCounts.high}</div>
          <div className="ops-summary-label">{t('safety.high')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--gold-500)' }}>{severityCounts.medium}</div>
          <div className="ops-summary-label">{t('safety.medium')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--success-500)' }}>{severityCounts.low}</div>
          <div className="ops-summary-label">{t('safety.low')}</div>
        </div>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="filters-row filters-row-3">
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} options={[
              { value: '', label: t('ops.allSeverities') },
              { value: 'critical', label: t('safety.critical') },
              { value: 'high', label: t('safety.high') },
              { value: 'medium', label: t('safety.medium') },
              { value: 'low', label: t('safety.low') },
            ]} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: '', label: t('ops.allStatuses') },
              { value: 'open', label: t('safety.open') },
              { value: 'investigating', label: t('safety.investigating') },
              { value: 'resolved', label: t('safety.resolved') },
              { value: 'closed', label: t('safety.closed') },
            ]} />
          </div>
        </CardBody>
      </Card>

      {displayIncidents.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<AlertTriangle size={32} />}
              title={t('ops.noIssues')}
              description={t('ops.noIssuesDesc')}
            />
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="ops-desktop-only">
            <CardBody>
              <div className="ops-table-wrapper">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>{t('ops.id')}</th>
                      <th>{t('ops.severity')}</th>
                      <th>{t('ops.category')}</th>
                      <th>{t('ops.summary')}</th>
                      <th>{t('ops.sitter')}</th>
                      <th>{t('ops.status')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <motion.tbody initial="hidden" animate="show" variants={staggerContainer}>
                    {displayIncidents.map((inc) => (
                      <motion.tr
                        key={inc.id}
                        variants={staggerItem}
                        className="ops-table-row-hover"
                        style={{ borderLeft: `3px solid ${severityBorderColor[inc.severity] || 'var(--border-color)'}` }}
                      >
                        <td>#{String(inc.id)}</td>
                        <td>
                          <Badge variant={getSeverityVariant(inc.severity)} size="sm">
                            {String(inc.severity)}
                          </Badge>
                        </td>
                        <td>{String(inc.category || '')}</td>
                        <td>{String(inc.summary || '')}</td>
                        <td>{String(inc.sitterName || '')}</td>
                        <td>
                          <Badge variant={getStatusVariant(inc.status)} size="sm">
                            {String(inc.status)}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="secondary" size="sm" onClick={() => setSelectedIncident(inc)}>
                              <Eye size={14} />
                            </Button>
                            {(inc.status === 'open' || inc.status === 'investigating') && (
                              <Button variant="secondary" size="sm" onClick={() => handleResolve(inc.id)}>
                                {t('ops.resolveIssue')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Mobile Card List */}
          <motion.div className="ops-mobile-card-list ops-mobile-only-block" initial="hidden" animate="show" variants={staggerContainer}>
            {displayIncidents.map((inc) => (
              <motion.div key={inc.id} variants={staggerItem}>
                <div
                  className="ops-mobile-card"
                  style={{ borderLeft: `3px solid ${severityBorderColor[inc.severity] || 'var(--border-color)'}` }}
                  onClick={() => setSelectedIncident(inc)}
                >
                  <div className="ops-mobile-card-header">
                    <span className="ops-mobile-card-code">#{String(inc.id)}</span>
                    <Badge variant={getStatusVariant(inc.status)} size="sm">
                      {String(inc.status)}
                    </Badge>
                  </div>
                  <div className="ops-mobile-card-body">
                    <p className="ops-mobile-card-title">{String(inc.summary || '')}</p>
                  </div>
                  <div className="ops-mobile-card-footer">
                    <div className="ops-mobile-card-meta">
                      <Badge variant={getSeverityVariant(inc.severity)} size="sm">
                        {String(inc.severity)}
                      </Badge>
                      <span className="ops-mobile-card-sub">{String(inc.sitterName || '')}</span>
                    </div>
                    {(inc.status === 'open' || inc.status === 'investigating') && (
                      <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); handleResolve(inc.id); }}>
                        {t('ops.resolveIssue')}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Issue Detail Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? `#${String(selectedIncident.id)} - ${String(selectedIncident.summary || '')}` : ''}
        size="md"
        footer={
          selectedIncident && (selectedIncident.status === 'open' || selectedIncident.status === 'investigating') ? (
            <Button variant="primary" onClick={() => { handleResolve(selectedIncident.id); setSelectedIncident(null); }}>
              {t('ops.resolveIssue')}
            </Button>
          ) : undefined
        }
      >
        {selectedIncident && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant={getSeverityVariant(selectedIncident.severity)} size="sm">
                {String(selectedIncident.severity).toUpperCase()}
              </Badge>
              <Badge variant={getStatusVariant(selectedIncident.status)} size="sm">
                {String(selectedIncident.status)}
              </Badge>
              <Badge variant="neutral" size="sm">{String(selectedIncident.category || '')}</Badge>
            </div>
            <div className="ops-sla-grid">
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ fontSize: '1rem' }}>{String(selectedIncident.sitterName || '-')}</div>
                <div className="ops-sla-label">{t('ops.sitter')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ fontSize: '1rem' }}>{String(selectedIncident.childName || '-')}</div>
                <div className="ops-sla-label">{t('ops.child')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ fontSize: '1rem' }}>{formatDate(selectedIncident.reportedAt)}</div>
                <div className="ops-sla-label">{t('ops.reportedAt')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ fontSize: '1rem' }}>
                  <Badge variant={selectedIncident.severity === 'critical' ? 'error' : 'warning'} size="sm">{String(selectedIncident.severity)}</Badge>
                </div>
                <div className="ops-sla-label">{t('ops.severity')}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('ops.summary')}</div>
              <div style={{ lineHeight: 1.6 }}>{String(selectedIncident.summary || '')}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
