// ============================================
// Petit Stay - Sitter Management Page
// ============================================


import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Star, Check, Users } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { TierBadge, Badge, SafetyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useHotelSitters } from '../../hooks/sitter/useSitters';
import { useHotelBookings } from '../../hooks/booking/useBookings';
import type { DemoSitter } from '../../data/demo';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/hotel-sitter-mgmt.css';

export default function SitterManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sitters, isLoading, error: sittersError, retry: retrySitters } = useHotelSitters(user?.hotelId);
  const { bookings } = useHotelBookings(user?.hotelId);
  const toast = useToast();

  // Filter state
  const [tierFilter, setTierFilter] = useState<'all' | 'gold' | 'silver'>('all');

  // Sort sitters: available > busy > offline, then filter by tier
  const sortedSitters = useMemo(() => {
    const order: Record<string, number> = { 'Available': 0, 'Busy': 1, 'On Leave': 2, 'Offline': 3 };
    let filtered = [...sitters];
    if (tierFilter !== 'all') {
      filtered = filtered.filter((s) => s.tier === tierFilter);
    }
    return filtered.sort((a, b) => (order[a.availability] ?? 9) - (order[b.availability] ?? 9));
  }, [sitters, tierFilter]);

  // Add New Sitter
  const [showAddSitter, setShowAddSitter] = useState(false);
  const [newSitterForm, setNewSitterForm] = useState({ name: '', languages: '', certifications: '', hourlyRate: '' });

  const handleAddSitter = () => {
    toast.success(t('sitterMgmt.sitterAdded'), t('sitterMgmt.sitterRegistered', { name: newSitterForm.name }));
    setShowAddSitter(false);
    setNewSitterForm({ name: '', languages: '', certifications: '', hourlyRate: '' });
  };

  // View Profile
  const [profileSitter, setProfileSitter] = useState<DemoSitter | null>(null);

  // Assign to Booking
  const [assignSitter, setAssignSitter] = useState<DemoSitter | null>(null);
  const unassignedBookings = bookings.filter((b) => !b.sitter && (b.status === 'pending' || b.status === 'confirmed'));

  const handleAssignToBooking = (bookingCode: string, sitterName: string) => {
    toast.success(t('sitterMgmt.sitterAssignedToast'), `${sitterName} → ${bookingCode}`);
    setAssignSitter(null);
  };

  if (isLoading) {
    return (
      <div className="sitter-management-page animate-fade-in">
        <div className="page-header">
          <div>
            <Skeleton width="200px" height="2rem" />
            <Skeleton width="160px" height="1rem" className="mt-2" />
          </div>
          <Skeleton width="160px" height="40px" borderRadius="var(--radius-lg)" />
        </div>
        <Skeleton width="280px" height="40px" borderRadius="var(--radius-lg)" />
        <div className="sitters-grid" style={{ marginTop: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="280px" borderRadius="var(--radius-xl)" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sitter-management-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('sitterMgmt.title')}</h1>
          <p className="page-subtitle">{t('sitterMgmt.sittersRegistered', { count: sitters.length })}</p>
        </div>
        <Button variant="gold" onClick={() => setShowAddSitter(true)}>{t('sitterMgmt.addNewSitter')}</Button>
      </div>

      {sittersError && <ErrorBanner error={sittersError} onRetry={retrySitters} />}

      {/* Tier Filter */}
      <div className="sitter-filter-tabs" role="tablist" aria-label={t('sitterMgmt.filterByTier', 'Filter by tier')}>
        {([
          { key: 'all' as const, label: t('common.all') },
          { key: 'gold' as const, label: t('sitterMgmt.goldTier', 'Gold') },
          { key: 'silver' as const, label: t('sitterMgmt.silverTier', 'Silver') },
        ]).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={tierFilter === tab.key}
            className={`sitter-filter-tab ${tierFilter === tab.key ? 'sitter-filter-tab-active' : ''}`}
            onClick={() => setTierFilter(tab.key)}
          >
            {tab.label}
            <span className="sitter-filter-count">
              {tab.key === 'all' ? sitters.length : sitters.filter((s) => s.tier === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {sortedSitters.length === 0 ? (
        <EmptyState
          icon={<Users size={32} strokeWidth={1.5} />}
          title={t('sitterMgmt.noSitters')}
          description={t('sitterMgmt.noSittersDesc')}
        />
      ) : (
      <motion.div className="sitters-grid" initial="hidden" animate="show" variants={staggerContainer}>
        {sortedSitters.map((sitter) => (
          <motion.div key={sitter.id} variants={staggerItem}>
          <Card className="sitter-card" aria-label={`Sitter: ${sitter.name}`}>
            <CardBody>
              <div className="sitter-header">
                <Avatar src={sitter.avatar} name={sitter.name} size="xl" variant={sitter.tier === 'gold' ? 'gold' : 'default'} />
                <div className="sitter-info">
                  <h3 className="sitter-name">{sitter.name}</h3>
                  <TierBadge tier={sitter.tier} />
                  <div className="sitter-rating">
                    <Star size={14} strokeWidth={1.75} fill="currentColor" /> {sitter.rating} ({t('sitterMgmt.sessionsCount', { count: sitter.sessionsCompleted })})
                    {sitter.tier === 'gold' && (
                      <span className="verified-badge">
                        <Check size={14} strokeWidth={2.5} /> {t('sitterMgmt.verified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sitter-status">
                <Badge variant={sitter.availability === 'Available' ? 'success' : 'warning'}>
                  {sitter.availability}
                </Badge>
                <SafetyBadge days={sitter.safetyDays} />
              </div>

              <div className="sitter-details">
                <div className="detail-row">
                  <span className="detail-label">{t('sitterMgmt.languages')}</span>
                  <span className="detail-value">{sitter.languages.join(', ')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('sitterMgmt.certifications')}</span>
                  <span className="detail-value">{sitter.certifications.join(', ')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('sitterMgmt.hourlyRate')}</span>
                  <span className="detail-value rate">{formatCurrency(sitter.hourlyRate)}{t('sitterMgmt.perHour')}</span>
                </div>
              </div>

              <div className="sitter-actions">
                <Button variant="secondary" size="sm" fullWidth onClick={() => setProfileSitter(sitter)}>
                  {t('sitterMgmt.viewProfile')}
                </Button>
                <Button variant="primary" size="sm" fullWidth disabled={sitter.availability !== 'Available'} onClick={() => setAssignSitter(sitter)}>
                  {t('sitterMgmt.assignToBooking')}
                </Button>
              </div>
            </CardBody>
          </Card>
          </motion.div>
        ))}
      </motion.div>
      )}

      {/* Add New Sitter Modal */}
      <Modal
        isOpen={showAddSitter}
        onClose={() => setShowAddSitter(false)}
        title={t('sitterMgmt.addNewSitter')}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddSitter(false)}>{t('common.cancel')}</Button>
            <Button variant="gold" onClick={handleAddSitter}>{t('sitterMgmt.addSitter')}</Button>
          </>
        }
      >
        <div className="modal-form-stack">
          <Input label={t('sitterMgmt.fullName')} value={newSitterForm.name} onChange={(e) => setNewSitterForm({ ...newSitterForm, name: e.target.value })} placeholder={t('sitterMgmt.namePlaceholder')} />
          <Input label={t('sitterMgmt.languages')} value={newSitterForm.languages} onChange={(e) => setNewSitterForm({ ...newSitterForm, languages: e.target.value })} placeholder={t('sitterMgmt.languagesPlaceholder')} hint={t('common.commaSeparated')} />
          <Input label={t('sitterMgmt.certifications')} value={newSitterForm.certifications} onChange={(e) => setNewSitterForm({ ...newSitterForm, certifications: e.target.value })} placeholder={t('sitterMgmt.certificationsPlaceholder')} hint={t('common.commaSeparated')} />
          <Input label={t('sitterMgmt.hourlyRateKRW')} type="number" value={newSitterForm.hourlyRate} onChange={(e) => setNewSitterForm({ ...newSitterForm, hourlyRate: e.target.value })} placeholder={t('sitterMgmt.ratePlaceholder')} />
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        isOpen={!!profileSitter}
        onClose={() => setProfileSitter(null)}
        title={profileSitter?.name || ''}
        size="lg"
      >
        {profileSitter && (
          <div className="modal-form-stack">
            <div className="modal-profile-header">
              <Avatar src={profileSitter.avatar} name={profileSitter.name} size="xl" variant={profileSitter.tier === 'gold' ? 'gold' : 'default'} />
              <div>
                <h3 className="modal-profile-name">{profileSitter.name}</h3>
                <TierBadge tier={profileSitter.tier} />
              </div>
            </div>
            <div className="modal-profile-grid">
              <div><strong>{t('sitterMgmt.sitterRating')}</strong> {profileSitter.rating}</div>
              <div><strong>{t('sitterMgmt.sitterSessions')}</strong> {profileSitter.sessionsCompleted}</div>
              <div><strong>{t('sitterMgmt.sitterSafeDays')}</strong> {profileSitter.safetyDays}</div>
              <div><strong>{t('sitterMgmt.sitterRate')}</strong> {formatCurrency(profileSitter.hourlyRate)}{t('sitterMgmt.perHour')}</div>
            </div>
            <div><strong>{t('sitterMgmt.languages')}:</strong> {profileSitter.languages.join(', ')}</div>
            <div>
              <strong>{t('sitterMgmt.certifications')}:</strong>
              <div className="modal-tags-row">
                {profileSitter.certifications.map((cert, i) => (
                  <Badge key={i} variant="success">{cert}</Badge>
                ))}
              </div>
            </div>
            <div><strong>{t('sitterMgmt.sitterAvailability')}</strong> <Badge variant={profileSitter.availability === 'Available' ? 'success' : 'warning'}>{profileSitter.availability}</Badge></div>
            <div>
              <strong>{t('sitterMgmt.availableHours', 'Available Hours')}:</strong>
              <p className="sitter-available-hours">{t('sitterMgmt.weekdayHours', 'Weekdays 17:00 - 23:00, Weekends 10:00 - 23:00')}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign to Booking Modal */}
      <Modal
        isOpen={!!assignSitter}
        onClose={() => setAssignSitter(null)}
        title={t('sitterMgmt.assignSitterToBooking', { name: assignSitter?.name || '' })}
        size="md"
      >
        <div className="modal-form-stack-sm">
          {unassignedBookings.length > 0 ? unassignedBookings.map((booking) => (
            <div key={booking.id} className="booking-option-row" onClick={() => handleAssignToBooking(booking.confirmationCode, assignSitter?.name || '')}>
              <div>
                <div className="booking-option-name">{booking.confirmationCode}</div>
                <div className="booking-option-detail">{booking.parent.name} - Room {booking.room}</div>
              </div>
              <Badge variant="neutral">{booking.time}</Badge>
            </div>
          )) : (
            <p className="no-items-message">{t('sitterMgmt.noUnassignedBookings')}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
