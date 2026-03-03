import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Badge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';

export default function OpsSitterManagement() {
  const { t } = useTranslation();
  const { sitters, isLoading } = useOpsData();

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.sitterList')}</h1>
      </div>

      <div className="ops-card-grid">
        {sitters.map((sitter) => (
          <Card key={sitter.id}>
            <CardBody>
              <div className="ops-sitter-card">
                <div className="ops-sitter-header">
                  <Avatar name={sitter.name} size="md" variant={sitter.tier === 'gold' ? 'gold' : 'default'} />
                  <div>
                    <h3 className="ops-sitter-name">{sitter.name}</h3>
                    <TierBadge tier={sitter.tier} />
                  </div>
                </div>
                <div className="ops-sitter-stats">
                  <div><strong>{sitter.rating}</strong> {t('common.rating')}</div>
                  <div><strong>{sitter.sessionsCompleted}</strong> {t('hotel.sessions')}</div>
                  <div><strong>{sitter.safetyDays}</strong> {t('sitter.safeDays')}</div>
                </div>
                <div className="ops-sitter-details">
                  <p>{sitter.languages.join(', ')}</p>
                  <div className="ops-sitter-certs">
                    {sitter.certifications.map((cert) => (
                      <Badge key={cert} variant="neutral" size="sm">{cert}</Badge>
                    ))}
                  </div>
                </div>
                <div className="ops-sitter-actions">
                  <Badge variant={sitter.availability === 'Available' ? 'success' : 'warning'} size="sm">{sitter.availability}</Badge>
                  <Button variant="secondary" size="sm">{t('ops.viewDetail')}</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
