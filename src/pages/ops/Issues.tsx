import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';

export default function OpsIssues() {
  const { t } = useTranslation();
  const { incidents, isLoading } = useOpsData();

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.issueList')}</h1>
      </div>

      <Card>
        <CardBody>
          {incidents.length === 0 ? (
            <p className="ops-empty">{t('ops.noData')}</p>
          ) : (
            <div className="ops-table-wrapper">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Severity</th>
                    <th>Category</th>
                    <th>Summary</th>
                    <th>Sitter</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc.id}>
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
                          <Button variant="secondary" size="sm">{t('ops.resolveIssue')}</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
