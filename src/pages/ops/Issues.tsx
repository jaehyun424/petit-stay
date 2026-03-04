import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/useOpsData';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';

const severityBorderColor: Record<string, string> = {
  critical: 'var(--error-600)',
  high: 'var(--error-500)',
  medium: 'var(--warning-500)',
  low: 'var(--success-500)',
};

export default function OpsIssues() {
  const { t } = useTranslation();
  const { incidents, isLoading } = useOpsData();
  const toast = useToast();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => new Set(prev).add(id));
    toast.success(t('ops.issueResolved'), `#${id}`);
  };

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  const displayIncidents = incidents.map((inc) =>
    resolvedIds.has(inc.id) ? { ...inc, status: 'resolved' as const } : inc
  );

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.issueList')}</h1>
      </div>

      <Card>
        <CardBody>
          {displayIncidents.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={32} />}
              title={t('ops.noIssues')}
              description={t('ops.noIssuesDesc')}
            />
          ) : (
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
                      <td>#{inc.id}</td>
                      <td>
                        <Badge variant={inc.severity === 'high' || inc.severity === 'critical' ? 'error' : inc.severity === 'medium' ? 'warning' : 'neutral'} size="sm">
                          {inc.severity}
                        </Badge>
                      </td>
                      <td>{inc.category}</td>
                      <td>{inc.summary}</td>
                      <td>{inc.sitterName}</td>
                      <td>
                        <Badge variant={inc.status === 'resolved' || inc.status === 'closed' ? 'success' : 'warning'} size="sm">
                          {inc.status}
                        </Badge>
                      </td>
                      <td>
                        {(inc.status === 'open' || inc.status === 'investigating') && (
                          <Button variant="secondary" size="sm" onClick={() => handleResolve(inc.id)}>
                            {t('ops.resolveIssue')}
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
