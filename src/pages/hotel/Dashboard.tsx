// ============================================
// Petit Stay - Hotel Dashboard
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Calendar, Radio, CheckCircle, DollarSign, Plus, ArrowRight, Clock, DoorOpen, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge, TierBadge, SafetyBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { PeriodSelector } from '../../components/common/DatePicker';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useHotelBookings } from '../../hooks/useBookings';
import { useHotelSessions } from '../../hooks/useSessions';
import { useHotelSitters } from '../../hooks/useSitters';
import type { DemoBooking } from '../../data/demo';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/hotel-dashboard.css';

// ----------------------------------------
// Stat Card Component
// ----------------------------------------
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'primary' | 'gold' | 'success' | 'warning';
  to?: string;
}

function StatCard({ icon, label, value, subValue, color, to }: StatCardProps) {
  const navigate = useNavigate();
  const colorClasses = {
    primary: 'stat-card-primary',
    gold: 'stat-card-gold',
    success: 'stat-card-success',
    warning: 'stat-card-warning',
  };

  return (
    <motion.div
      className={`stat-card ${colorClasses[color]} ${to ? 'stat-card-clickable' : ''}`}
      role="group"
      aria-label={label}
      onClick={to ? () => navigate(to) : undefined}
      style={to ? { cursor: 'pointer' } : undefined}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="stat-card-icon" aria-hidden="true">{icon}</div>
      <div className="stat-card-content">
        <div className="stat-card-value">
          {typeof value === 'number' ? <AnimatedCounter target={value} duration={1.5} /> : value}
        </div>
        <div className="stat-card-label">{label}</div>
        {subValue && <div className="stat-card-sub">{subValue}</div>}
      </div>
    </motion.div>
  );
}

// ----------------------------------------
// Main Component
// ----------------------------------------
export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookings: todayBookings, stats, isLoading: bookingsLoading, error: bookingsError, retry: retryBookings, createBooking } = useHotelBookings(user?.hotelId);
  const { sessions: activeSessions, isLoading: sessionsLoading, error: sessionsError, retry: retrySessions } = useHotelSessions(user?.hotelId);
  const { sitters } = useHotelSitters(user?.hotelId);
  const toast = useToast();
  const isLoading = bookingsLoading || sessionsLoading;
  const [period, setPeriod] = useState('today');

  // New Booking modal
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({ guestName: '', room: '', date: '', time: '18:00', duration: '4', childrenCount: '1' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateBookingForm = () => {
    const errors: Record<string, string> = {};
    if (!newBookingForm.guestName.trim()) errors.guestName = t('common.required', 'This field is required');
    if (!newBookingForm.room.trim()) errors.room = t('common.required', 'This field is required');
    if (!newBookingForm.date) {
      errors.date = t('common.required', 'This field is required');
    } else if (newBookingForm.date < new Date().toISOString().split('T')[0]) {
      errors.date = t('booking.dateMustBeFuture', 'Date must be today or later');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validateBookingForm()) return;
    const code = `KCP-${Date.now().toString(36).toUpperCase()}`;
    const startHour = parseInt(newBookingForm.time.split(':')[0], 10);
    const durationHrs = parseInt(newBookingForm.duration, 10);
    const endHour = startHour + durationHrs;
    const endTime = `${String(endHour).padStart(2, '0')}:00`;
    const baseRate = 75000;
    const total = baseRate * durationHrs;

    try {
      await createBooking({
        hotelId: user?.hotelId || '',
        parentId: '',
        confirmationCode: code,
        status: 'pending',
        schedule: {
          date: new Date(newBookingForm.date),
          startTime: newBookingForm.time,
          endTime,
          duration: durationHrs,
          timezone: 'Asia/Seoul',
        },
        location: {
          type: 'room',
          roomNumber: newBookingForm.room,
        },
        children: Array.from({ length: parseInt(newBookingForm.childrenCount, 10) }, (_, i) => ({
          childId: `child-${i}`,
          firstName: '',
          age: 0,
        })),
        requirements: {
          sitterTier: 'any',
          preferredLanguages: ['en'],
        },
        pricing: {
          baseRate,
          hours: durationHrs,
          baseTotal: total,
          nightSurcharge: 0,
          holidaySurcharge: 0,
          goldSurcharge: 0,
          subtotal: total,
          commission: Math.round(total * 0.15),
          total,
        },
        payment: { status: 'pending', method: 'card' },
        trustProtocol: {
          safeWord: Math.random().toString(36).slice(2, 8).toUpperCase(),
        },
        guestInfo: { name: newBookingForm.guestName, email: '', phone: '', nationality: '' },
        metadata: { source: 'concierge' },
      } as Omit<import('../../types').Booking, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success(t('booking.bookingConfirmed'), `${t('hotel.bookingCode')}: ${code}`);
      setShowNewBooking(false);
      setNewBookingForm({ guestName: '', room: '', date: '', time: '18:00', duration: '4', childrenCount: '1' });
      setFormErrors({});
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error(t('common.error'), t('booking.createFailed', 'Failed to create booking'));
    }
  };

  // Assign sitter modal
  const [assignTarget, setAssignTarget] = useState<DemoBooking | null>(null);

  const handleAssignSitter = (sitterName: string) => {
    toast.success(t('hotel.assign'), `${sitterName} → ${assignTarget?.confirmationCode}`);
    setAssignTarget(null);
  };

  if (isLoading) {
    return (
      <div className="dashboard animate-fade-in">
        <div className="dashboard-header">
          <Skeleton width="200px" height="2rem" />
          <Skeleton width="120px" height="40px" />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('nav.dashboard')}</h1>
          <p className="dashboard-subtitle">{t('hotel.todayOverview')}</p>
        </div>
        <div className="dashboard-header-actions">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button variant="gold" icon={<Plus size={20} strokeWidth={2} />} onClick={() => setShowNewBooking(true)}>
            {t('hotel.newBooking')}
          </Button>
        </div>
      </div>

      {/* Error Banners */}
      {bookingsError && <ErrorBanner error={bookingsError} onRetry={retryBookings} />}
      {sessionsError && <ErrorBanner error={sessionsError} onRetry={retrySessions} />}

      {/* Safety Record Banner */}
      <div className="safety-banner animate-fade-in-up">
        <div className="safety-banner-content">
          <SafetyBadge days={stats.safetyDays} />
          <span className="safety-banner-text">
            {t('hotel.safetyRecordCongrats')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="stats-grid"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        {[
          { icon: <Calendar size={20} strokeWidth={2} />, label: t('hotel.totalBookings'), value: stats.todayBookings, subValue: `${stats.pendingBookings} ${t('status.pending').toLowerCase()}`, color: 'primary' as const, to: '/hotel/bookings' },
          { icon: <Radio size={20} strokeWidth={2} />, label: t('hotel.activeSessions'), value: stats.activeNow, subValue: t('status.inProgress'), color: 'warning' as const, to: '/hotel/live' },
          { icon: <CheckCircle size={20} strokeWidth={2} />, label: t('status.completed'), value: stats.completedToday, color: 'success' as const, to: '/hotel/reports' },
          { icon: <DollarSign size={20} strokeWidth={2} />, label: t('hotel.totalRevenue'), value: formatCurrency(stats.todayRevenue), color: 'gold' as const, to: '/hotel/reports' },
        ].map((stat, i) => (
          <motion.div key={i} variants={staggerItem}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Today's Bookings */}
        <Card className="animate-fade-in-up stagger-2">
          <CardHeader action={
            <Link to="/hotel/bookings" className="card-link">
              {t('parent.viewAll')} <ArrowRight size={16} strokeWidth={2} />
            </Link>
          }>
            <CardTitle subtitle={t('hotel.upcomingAndInProgress')}>
              {t('hotel.todaysBookings')}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <motion.div className="booking-list" initial="hidden" animate="show" variants={staggerContainer}>
              {todayBookings.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={32} strokeWidth={1.5} />}
                  title={t('hotel.noBookingsToday')}
                  description={t('parent.noUpcomingBookings')}
                  action={
                    <Button variant="gold" size="sm" onClick={() => setShowNewBooking(true)}>
                      {t('hotel.newBooking')}
                    </Button>
                  }
                />
              ) : (
                todayBookings.map((booking) => (
                  <motion.div key={booking.id} className="booking-item" variants={staggerItem}>
                    <div className="booking-item-main">
                      <div className="booking-item-header">
                        <span className="booking-code">{booking.confirmationCode}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="booking-item-details">
                        <span><Clock size={16} strokeWidth={1.75} /> {booking.time}</span>
                        <span><DoorOpen size={16} strokeWidth={1.75} /> {t('common.room')} {booking.room}</span>
                        <span><User size={16} strokeWidth={1.75} /> {booking.parent.name}</span>
                      </div>
                      <div className="booking-item-children">
                        {booking.children.map((child, i) => (
                          <Badge key={i} variant="neutral" size="sm">
                            {child.name} ({child.age}y)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="booking-item-sitter">
                      {booking.sitter ? (
                        <>
                          <Avatar src={booking.sitter.avatar} name={booking.sitter.name} size="sm" variant={booking.sitter.tier === 'gold' ? 'gold' : 'default'} />
                          <div className="sitter-info">
                            <span className="sitter-name">{booking.sitter.name}</span>
                            <TierBadge tier={booking.sitter.tier} />
                            {booking.sitter.hotelVerified && <Badge variant="success" size="sm">Hotel Verified</Badge>}
                          </div>
                        </>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setAssignTarget(booking); }}>
                          {t('hotel.assign')}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </CardBody>
        </Card>

        {/* Live Monitor Preview */}
        <Card className="animate-fade-in-up stagger-3">
          <CardHeader action={
            <Link to="/hotel/live" className="card-link">
              {t('nav.liveMonitor')} <ArrowRight size={16} strokeWidth={2} />
            </Link>
          }>
            <CardTitle subtitle={t('hotel.recentActivity')}>
              <span className="live-monitor-title-row">
                {t('nav.liveMonitor')}
                <span className="status-dot status-dot-success" aria-hidden="true" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="live-list">
              {activeSessions.length === 0 ? (
                <EmptyState
                  icon={<Radio size={32} strokeWidth={1.5} />}
                  title={t('liveMonitor.noActiveSessions')}
                  description={t('liveMonitor.noActiveSessionsDesc')}
                />
              ) : (
                activeSessions.map((session) => (
                  <div key={session.id} className="live-item">
                    <div className="live-item-header">
                      <Avatar src={session.sitter.avatar ?? undefined} name={session.sitter.name} size="sm" variant={session.sitter.tier === 'gold' ? 'gold' : 'default'} />
                      <div className="live-item-info">
                        <span className="live-item-name">{session.sitter.name}</span>
                        <span className="live-item-room">{t('common.room')} {session.room}</span>
                      </div>
                      <div className="live-item-time">
                        <span className="live-item-elapsed">{session.elapsed}</span>
                        <span className="live-item-start">{t('hotel.started')} {session.startTime}</span>
                      </div>
                    </div>
                    <div className="live-item-activity">
                      <span className="status-dot status-dot-success" aria-hidden="true" />
                      {session.lastActivity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={showNewBooking}
        onClose={() => setShowNewBooking(false)}
        title={t('hotel.newBooking')}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowNewBooking(false); setFormErrors({}); }}>{t('common.cancel')}</Button>
            <Button variant="gold" onClick={handleCreateBooking} disabled={!newBookingForm.guestName.trim() || !newBookingForm.room.trim() || !newBookingForm.date}>{t('common.confirm')}</Button>
          </>
        }
      >
        <div className="modal-form-stack">
          <Input label={t('hotel.guestInfo')} value={newBookingForm.guestName} onChange={(e) => { setNewBookingForm({ ...newBookingForm, guestName: e.target.value }); if (formErrors.guestName) setFormErrors((prev) => { const { guestName: _, ...rest } = prev; return rest; }); }} placeholder={t('hotel.guestNamePlaceholder')} error={formErrors.guestName} />
          <Input label={t('common.room')} value={newBookingForm.room} onChange={(e) => { setNewBookingForm({ ...newBookingForm, room: e.target.value }); if (formErrors.room) setFormErrors((prev) => { const { room: _, ...rest } = prev; return rest; }); }} placeholder={t('booking.roomPlaceholder')} error={formErrors.room} />
          <Input label={t('common.date')} type="date" value={newBookingForm.date} onChange={(e) => { setNewBookingForm({ ...newBookingForm, date: e.target.value }); if (formErrors.date) setFormErrors((prev) => { const { date: _, ...rest } = prev; return rest; }); }} min={new Date().toISOString().split('T')[0]} error={formErrors.date} />
          <Select label={t('booking.startTime')} value={newBookingForm.time} onChange={(e) => setNewBookingForm({ ...newBookingForm, time: e.target.value })} options={[{ value: '18:00', label: '18:00' }, { value: '19:00', label: '19:00' }, { value: '20:00', label: '20:00' }, { value: '21:00', label: '21:00' }]} />
          <Select label={t('booking.duration')} value={newBookingForm.duration} onChange={(e) => setNewBookingForm({ ...newBookingForm, duration: e.target.value })} options={[{ value: '2', label: '2h' }, { value: '3', label: '3h' }, { value: '4', label: '4h' }, { value: '5', label: '5h' }]} />
          <Select label={t('hotel.childrenInfo')} value={newBookingForm.childrenCount} onChange={(e) => setNewBookingForm({ ...newBookingForm, childrenCount: e.target.value })} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
        </div>
      </Modal>

      {/* Assign Sitter Modal */}
      <Modal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`${t('hotel.assign')} - ${assignTarget?.confirmationCode || ''}`}
        size="md"
      >
        <div className="modal-form-stack-sm">
          {sitters.filter((s) => s.availability === 'Available').map((sitter) => (
            <div key={sitter.id} className="sitter-option-row" onClick={() => handleAssignSitter(sitter.name)}>
              <Avatar name={sitter.name} size="sm" variant={sitter.tier === 'gold' ? 'gold' : 'default'} />
              <div className="sitter-option-info">
                <div className="sitter-option-name">{sitter.name}</div>
                <div className="sitter-option-detail">{sitter.languages.join(', ')}</div>
              </div>
              <TierBadge tier={sitter.tier} />
            </div>
          ))}
          {sitters.filter((s) => s.availability === 'Available').length === 0 && (
            <p className="no-sitters-message">{t('sitterMgmt.noAvailableSitters')}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
