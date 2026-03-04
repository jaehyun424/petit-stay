// ============================================
// Petit Stay - Sitter Management Page
// ============================================


import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Check } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { TierBadge, Badge, SafetyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useHotelSitters } from '../../hooks/useSitters';
import { useHotelBookings } from '../../hooks/useBookings';
import type { DemoSitter } from '../../data/demo';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/hotel-sitter-mgmt.css';

export default function SitterManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sitters, error: sittersError, retry: retrySitters } = useHotelSitters(user?.hotelId);
  const { bookings } = useHotelBookings(user?.hotelId);
  const toast = useToast();

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

      <div className="sitters-grid">
        {sitters.map((sitter) => (
          <Card key={sitter.id} className="sitter-card" aria-label={`Sitter: ${sitter.name}`}>
            <CardBody>
              <div className="sitter-header">
                <Avatar name={sitter.name} size="xl" variant={sitter.tier === 'gold' ? 'gold' : 'default'} />
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
        ))}
      </div>

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
              <Avatar name={profileSitter.name} size="xl" variant={profileSitter.tier === 'gold' ? 'gold' : 'default'} />
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
