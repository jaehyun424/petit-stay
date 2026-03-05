import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Users, UserCheck, UserX, FileText, Award, Star, Calendar, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Badge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';
import { DEMO_MODE } from '../../hooks/useDemo';
import '../../styles/pages/ops-dashboard.css';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { OnboardingStatus } from '../../types';

// ----------------------------------------
// Pending Sitter type (for onboarding approval)
// ----------------------------------------
interface PendingSitter {
  id: string;
  displayName: string;
  languages: string[];
  experience: number;
  specialties: string[];
  onboardingStatus: OnboardingStatus;
  quizScore?: number;
  documentsCount: number;
  appliedAt: Date;
}

// Demo pending sitters
const DEMO_PENDING_SITTERS: PendingSitter[] = [
  {
    id: 'ps1',
    displayName: 'Park Jihye',
    languages: ['Korean', 'English'],
    experience: 3,
    specialties: ['Infant Care', 'First Aid'],
    onboardingStatus: 'quiz_passed',
    quizScore: 1.0,
    documentsCount: 2,
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ps2',
    displayName: 'Tanaka Yui',
    languages: ['Japanese', 'English'],
    experience: 5,
    specialties: ['Toddler Activities', 'Music'],
    onboardingStatus: 'quiz_passed',
    quizScore: 0.8,
    documentsCount: 3,
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ----------------------------------------
// Hook: pending sitters
// ----------------------------------------
function usePendingSitters() {
  const [pending, setPending] = useState<PendingSitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (DEMO_MODE) {
      setPending(DEMO_PENDING_SITTERS);
      setIsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'sitters'),
        where('onboarding.status', '==', 'quiz_passed')
      );
      const snapshot = await getDocs(q);
      const items: PendingSitter[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          displayName: data.profile?.displayName || '',
          languages: data.profile?.languages || [],
          experience: data.profile?.experience || 0,
          specialties: data.profile?.specialties || [],
          onboardingStatus: data.onboarding?.status || 'applied',
          quizScore: data.onboarding?.quizScore,
          documentsCount: data.onboarding?.documents?.length || 0,
          appliedAt: data.onboarding?.appliedAt?.toDate?.() || new Date(),
        };
      });
      setPending(items);
    } catch (err) {
      console.error('Failed to load pending sitters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = useCallback(async (sitterId: string) => {
    if (!DEMO_MODE) {
      await updateDoc(doc(db, 'sitters', sitterId), {
        'onboarding.status': 'approved',
        'onboarding.approvedAt': serverTimestamp(),
        status: 'active',
        updatedAt: serverTimestamp(),
      });
    }
    setPending((prev) => prev.filter((s) => s.id !== sitterId));
  }, []);

  const reject = useCallback(async (sitterId: string) => {
    if (!DEMO_MODE) {
      await updateDoc(doc(db, 'sitters', sitterId), {
        'onboarding.status': 'rejected',
        'onboarding.rejectedAt': serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setPending((prev) => prev.filter((s) => s.id !== sitterId));
  }, []);

  return { pending, isLoading, approve, reject };
}

// ----------------------------------------
// Main Component
// ----------------------------------------
export default function OpsSitterManagement() {
  const { t } = useTranslation();
  const { sitters, isLoading } = useOpsData();
  const { pending, isLoading: pendingLoading, approve, reject } = usePendingSitters();
  const [searchQuery, setSearchQuery] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [selectedSitter, setSelectedSitter] = useState<typeof sitters[0] | null>(null);

  const sortedSitters = useMemo(() => {
    const order: Record<string, number> = { 'Available': 0, 'Busy': 1, 'On Leave': 2, 'Offline': 3 };
    return [...sitters]
      .filter((s) => {
        const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAvail = !availFilter || s.availability === availFilter;
        return matchesSearch && matchesAvail;
      })
      .sort((a, b) => (order[a.availability] ?? 9) - (order[b.availability] ?? 9));
  }, [sitters, searchQuery, availFilter]);

  const sitterCounts = useMemo(() => {
    const counts = { total: sitters.length, Available: 0, Busy: 0, 'On Leave': 0, Offline: 0 };
    for (const s of sitters) {
      if (s.availability in counts) counts[s.availability as keyof typeof counts]++;
    }
    return counts;
  }, [sitters]);

  if (isLoading) {
    return (
      <div className="ops-page animate-fade-in">
        <Skeleton width="240px" height="2rem" />
        <div className="ops-stats-grid" style={{ marginTop: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="80px" />)}
        </div>
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ops.sitterList')}</h1>
          <p className="page-subtitle">{t('ops.sitterCount', { count: sitters.length })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="ops-summary-bar mb-6">
        <div className="ops-summary-item">
          <div className="ops-summary-value">{sitterCounts.total}</div>
          <div className="ops-summary-label">{t('ops.total')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--success-500)' }}>{sitterCounts.Available}</div>
          <div className="ops-summary-label">{t('ops.available')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--warning-500)' }}>{sitterCounts.Busy}</div>
          <div className="ops-summary-label">{t('ops.busy')}</div>
        </div>
        <div className="ops-summary-item">
          <div className="ops-summary-value" style={{ color: 'var(--text-tertiary)' }}>{sitterCounts.Offline + sitterCounts['On Leave']}</div>
          <div className="ops-summary-label">{t('ops.offline')}</div>
        </div>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="filters-row">
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Select value={availFilter} onChange={(e) => setAvailFilter(e.target.value)} options={[
              { value: '', label: t('ops.allAvailability') },
              { value: 'Available', label: t('ops.available') },
              { value: 'Busy', label: t('ops.busy') },
              { value: 'On Leave', label: t('ops.onLeave') },
              { value: 'Offline', label: t('ops.offline') },
            ]} />
          </div>
        </CardBody>
      </Card>

      {/* Pending Onboarding Approvals */}
      {!pendingLoading && pending.length > 0 && (
        <div className="ops-pending-section">
          <h2 className="ops-pending-heading">
            {t('onboarding.pendingApprovals')} ({pending.length})
          </h2>
          <motion.div className="ops-card-grid" initial="hidden" animate="show" variants={staggerContainer}>
            {pending.map((ps) => (
              <motion.div key={ps.id} variants={staggerItem}>
                <Card className="ops-pending-sitter-card">
                  <CardBody>
                    <div className="ops-sitter-card">
                      <div className="ops-sitter-header">
                        <Avatar name={ps.displayName} size="md" />
                        <div>
                          <h3 className="ops-sitter-name">{ps.displayName}</h3>
                          <Badge variant="warning" size="sm">{t('onboarding.awaitingApproval')}</Badge>
                        </div>
                      </div>
                      <div className="ops-sitter-stats">
                        <div><strong>{ps.experience}</strong> {t('onboarding.yearsExp')}</div>
                        <div><strong>{ps.documentsCount}</strong> <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></div>
                        <div><strong>{ps.quizScore != null ? `${Math.round(ps.quizScore * 100)}%` : '-'}</strong> <Award size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></div>
                      </div>
                      <div className="ops-sitter-details">
                        <p>{ps.languages.join(', ')}</p>
                        <div className="ops-sitter-certs">
                          {ps.specialties.map((s) => (
                            <Badge key={s} variant="neutral" size="sm">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ops-sitter-actions">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => approve(ps.id)}
                        >
                          <UserCheck size={14} /> {t('onboarding.approve')}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => reject(ps.id)}
                        >
                          <UserX size={14} /> {t('onboarding.reject')}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Active Sitters */}
      {sortedSitters.length === 0 && pending.length === 0 ? (
        <EmptyState
          icon={<Users size={32} strokeWidth={1.5} />}
          title={t('ops.noSitters')}
          description={t('ops.noSittersDesc')}
        />
      ) : (
        <motion.div className="ops-card-grid" initial="hidden" animate="show" variants={staggerContainer}>
          {sortedSitters.map((sitter) => (
            <motion.div key={sitter.id} variants={staggerItem}>
            <Card className="ops-sitter-card-wrapper">
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
                    <div><Star size={14} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--gold-500)' }} /> <strong>{sitter.rating}</strong></div>
                    <div><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>{sitter.sessionsCompleted}</strong> {t('hotel.sessions')}</div>
                    <div><Shield size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>{sitter.safetyDays}</strong>d</div>
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
                    <Badge variant={sitter.availability === 'Available' ? 'success' : sitter.availability === 'Busy' ? 'warning' : 'neutral'} size="sm">{sitter.availability}</Badge>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedSitter(sitter)}>{t('ops.viewDetail')}</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Sitter Detail Modal */}
      <Modal
        isOpen={!!selectedSitter}
        onClose={() => setSelectedSitter(null)}
        title={selectedSitter?.name || ''}
        size="md"
      >
        {selectedSitter && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="ops-sitter-header">
              <Avatar name={selectedSitter.name} size="lg" variant={selectedSitter.tier === 'gold' ? 'gold' : 'default'} />
              <div>
                <h3 className="ops-sitter-name">{selectedSitter.name}</h3>
                <TierBadge tier={selectedSitter.tier} />
              </div>
            </div>
            <div className="ops-sla-grid">
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ color: 'var(--gold-500)' }}>{selectedSitter.rating}</div>
                <div className="ops-sla-label">{t('common.rating')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value">{selectedSitter.sessionsCompleted}</div>
                <div className="ops-sla-label">{t('hotel.sessions')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value" style={{ color: 'var(--success-500)' }}>{selectedSitter.safetyDays}</div>
                <div className="ops-sla-label">{t('sitter.safeDays')}</div>
              </div>
              <div className="ops-sla-item">
                <div className="ops-sla-value">
                  <Badge variant={selectedSitter.availability === 'Available' ? 'success' : 'warning'} size="sm">{selectedSitter.availability}</Badge>
                </div>
                <div className="ops-sla-label">{t('hotel.status')}</div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sitterMgmt.languages')}</p>
              <p style={{ fontWeight: 500 }}>{selectedSitter.languages.join(', ')}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sitterMgmt.certifications')}</p>
              <div className="ops-sitter-certs">
                {selectedSitter.certifications.map((cert) => (
                  <Badge key={cert} variant="neutral" size="sm">{cert}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
