import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Users, UserCheck, UserX, FileText, Award } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Badge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpsData } from '../../hooks/useOpsData';
import { Skeleton } from '../../components/common/Skeleton';
import { DEMO_MODE } from '../../hooks/useDemo';
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

  const sortedSitters = useMemo(() => {
    const order: Record<string, number> = { 'Available': 0, 'Busy': 1, 'On Leave': 2, 'Offline': 3 };
    return [...sitters].sort((a, b) => (order[a.availability] ?? 9) - (order[b.availability] ?? 9));
  }, [sitters]);

  if (isLoading) return <div className="animate-fade-in"><Skeleton height="400px" /></div>;

  return (
    <div className="ops-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('ops.sitterList')}</h1>
      </div>

      {/* Pending Onboarding Approvals */}
      {!pendingLoading && pending.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
            {t('onboarding.pendingApprovals')} ({pending.length})
          </h2>
          <motion.div className="ops-card-grid" initial="hidden" animate="show" variants={staggerContainer}>
            {pending.map((ps) => (
              <motion.div key={ps.id} variants={staggerItem}>
                <Card style={{ borderLeft: '3px solid var(--primary-400)' }}>
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
                      <div className="ops-sitter-actions" style={{ gap: 'var(--space-2)' }}>
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
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
