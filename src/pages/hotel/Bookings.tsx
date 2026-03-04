// ============================================
// Petit Stay - Hotel Bookings Page
// ============================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Badge, StatusBadge, TierBadge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination, usePagination } from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useHotelBookings } from '../../hooks/useBookings';
import { useHotelSitters } from '../../hooks/useSitters';
import { paymentService } from '../../services/payment';
import { bookingService } from '../../services/firestore';
import { calculatePrice } from '../../services/pricingEngine';
import type { PricingInput } from '../../services/pricingEngine';
import { PriceBreakdown } from '../../components/common/PriceBreakdown';
import type { DemoBooking } from '../../data/demo';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/hotel-bookings.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Icons
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export default function Bookings() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { bookings, error, retry } = useHotelBookings(user?.hotelId);
    const { sitters } = useHotelSitters(user?.hotelId);
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<DemoBooking | null>(null);

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

    const [guestLink, setGuestLink] = useState<string | null>(null);

    const [isCreating, setIsCreating] = useState(false);

    const handleCreateBooking = async () => {
        if (!validateBookingForm()) return;
        setIsCreating(true);

        try {
            if (DEMO_MODE) {
                // Demo mode: generate a fake link
                const code = `KCP-${Date.now().toString(36).toUpperCase()}`;
                const bookingId = `bk-${Date.now()}`;
                const token = `tk-${Math.random().toString(36).slice(2, 10)}`;
                const link = `${window.location.origin}/guest/${bookingId}?token=${token}&lang=en`;
                setGuestLink(link);
                toast.success(t('booking.bookingConfirmed'), `${t('hotel.bookingCode')}: ${code}`);
            } else {
                // Real mode: create booking in Firestore, then generate payment link
                const hotelId = user?.hotelId || '';
                const duration = parseInt(newBookingForm.duration);
                const computedPricing = pricePreview || calculatePrice({
                    baseRate: 75000,
                    hours: duration,
                    startTime: newBookingForm.time,
                    endTime: `${parseInt(newBookingForm.time) + duration}:00`,
                    date: new Date(newBookingForm.date),
                    childrenCount: parseInt(newBookingForm.childrenCount) || 1,
                    sitterTier: 'any',
                });
                const baseRate = computedPricing.baseRate;
                const total = computedPricing.total;

                const bookingId = await bookingService.createBooking({
                    hotelId,
                    parentId: '',
                    confirmationCode: `KCP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                    status: 'pending_guest_consent',
                    schedule: {
                        date: new Date(newBookingForm.date),
                        startTime: newBookingForm.time,
                        endTime: `${parseInt(newBookingForm.time) + duration}:00`,
                        duration,
                        timezone: 'Asia/Seoul',
                    },
                    location: {
                        type: 'room',
                        roomNumber: newBookingForm.room,
                    },
                    children: [],
                    requirements: {
                        sitterTier: 'any',
                        preferredLanguages: ['en'],
                    },
                    pricing: {
                        baseRate,
                        hours: duration,
                        baseTotal: baseRate * duration,
                        nightSurcharge: computedPricing.nightSurcharge,
                        holidaySurcharge: computedPricing.weekendSurcharge,
                        goldSurcharge: computedPricing.goldSitterSurcharge,
                        subtotal: computedPricing.subtotal,
                        commission: Math.round(total * 0.15),
                        total,
                    },
                    payment: {
                        status: 'pending',
                        method: 'card',
                    },
                    trustProtocol: {
                        safeWord: Math.random().toString(36).slice(2, 8).toUpperCase(),
                    },
                    guestInfo: {
                        name: newBookingForm.guestName,
                        email: '',
                        phone: '',
                        nationality: '',
                    },
                    metadata: {
                        source: 'concierge',
                    },
                });

                // Generate payment link via Stripe
                try {
                    const paymentUrl = await paymentService.generatePaymentLink({
                        bookingId,
                        hotelId,
                        amount: total,
                        currency: 'krw',
                        description: `Petit Stay Childcare - ${newBookingForm.guestName}`,
                    });
                    setGuestLink(paymentUrl);
                } catch {
                    // Fallback to guest page link without Stripe (e.g., Stripe not configured)
                    const link = `${window.location.origin}/guest/${bookingId}`;
                    setGuestLink(link);
                }

                toast.success(t('booking.bookingConfirmed'), `${t('hotel.bookingCode')}: ${bookingId.slice(0, 12)}`);
            }

            setShowNewBooking(false);
            setNewBookingForm({ guestName: '', room: '', date: '', time: '18:00', duration: '4', childrenCount: '1' });
            setFormErrors({});
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('common.error');
            toast.error(t('common.error'), message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyLink = () => {
        if (guestLink) {
            navigator.clipboard.writeText(guestLink).then(() => {
                toast.success(t('hotel.linkCopied'), t('hotel.guestLinkCopied'));
            });
        }
    };

    // Assign sitter modal
    const [assignTarget, setAssignTarget] = useState<DemoBooking | null>(null);

    const handleAssignSitter = (sitterName: string) => {
        toast.success(t('hotel.assign'), `${sitterName} → ${assignTarget?.confirmationCode}`);
        setAssignTarget(null);
    };

    // Real-time price preview for new booking form
    const pricePreview = useMemo(() => {
        if (!newBookingForm.date || !newBookingForm.time || !newBookingForm.duration) return null;
        const duration = parseInt(newBookingForm.duration);
        const startHour = parseInt(newBookingForm.time);
        const endTime = `${startHour + duration}:00`;
        const input: PricingInput = {
            baseRate: 75000,
            hours: duration,
            startTime: newBookingForm.time,
            endTime,
            date: new Date(newBookingForm.date),
            childrenCount: parseInt(newBookingForm.childrenCount) || 1,
            sitterTier: 'any',
        };
        return calculatePrice(input);
    }, [newBookingForm.date, newBookingForm.time, newBookingForm.duration, newBookingForm.childrenCount]);

    const previewPriceItems = useMemo(() => {
        if (!pricePreview) return [];
        return [
            { labelKey: 'pricing.baseRate', amount: pricePreview.baseRate * pricePreview.hours },
            ...(pricePreview.nightSurcharge > 0 ? [{ labelKey: 'pricing.nightSurcharge', amount: pricePreview.nightSurcharge }] : []),
            ...(pricePreview.weekendSurcharge > 0 ? [{ labelKey: 'pricing.weekendSurcharge', amount: pricePreview.weekendSurcharge }] : []),
            ...(pricePreview.urgentSurcharge > 0 ? [{ labelKey: 'pricing.urgentSurcharge', amount: pricePreview.urgentSurcharge }] : []),
            ...(pricePreview.additionalChildrenSurcharge > 0 ? [{ labelKey: 'pricing.additionalChildren', amount: pricePreview.additionalChildrenSurcharge }] : []),
            ...(pricePreview.goldSitterSurcharge > 0 ? [{ labelKey: 'pricing.goldSitter', amount: pricePreview.goldSitterSurcharge }] : []),
        ];
    }, [pricePreview]);

    const STATUS_OPTIONS = [
        { value: '', label: t('common.allStatuses') },
        { value: 'pending', label: t('status.pending') },
        { value: 'pending_guest_consent', label: t('status.pendingGuestConsent') },
        { value: 'pending_assignment', label: t('status.pendingAssignment') },
        { value: 'sitter_assigned', label: t('status.sitterAssigned') },
        { value: 'sitter_confirmed', label: t('status.sitterConfirmed') },
        { value: 'confirmed', label: t('status.confirmed') },
        { value: 'in_progress', label: t('status.inProgress') },
        { value: 'completed', label: t('status.completed') },
        { value: 'cancelled', label: t('status.cancelled') },
        { value: 'issue_reported', label: t('status.issueReported') },
    ];

    const [currentPage, setCurrentPage] = useState(1);

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.room.includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const { totalPages, getPageItems } = usePagination(filteredBookings, 10);
    const paginatedBookings = getPageItems(currentPage);

    return (
        <div className="bookings-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('nav.bookings')}</h1>
                    <p className="page-subtitle">{t('hotel.manageBookings')}</p>
                </div>
                <Button variant="gold" icon={<PlusIcon />} onClick={() => setShowNewBooking(true)}>
                    {t('hotel.newBooking')}
                </Button>
            </div>

            {error && <ErrorBanner error={error} onRetry={retry} />}

            {/* Filters */}
            <Card className="mb-6">
                <CardBody>
                    <div className="filters-row">
                        <Input
                            placeholder={t('hotel.searchByCodeNameRoom')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<SearchIcon />}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={STATUS_OPTIONS}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardBody>
                    {/* Desktop: semantic table */}
                    <div className="bookings-table-wrapper">
                        <table className="bookings-table" aria-label={t('aria.bookingsList')}>
                            <thead>
                                <tr>
                                    <th>{t('hotel.bookingCode')}</th>
                                    <th>{t('hotel.guestRoom')}</th>
                                    <th>{t('hotel.childrenInfo')}</th>
                                    <th>{t('auth.sitter')}</th>
                                    <th>{t('hotel.status')}</th>
                                    <th>{t('hotel.amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="table-row-clickable"
                                        tabIndex={0}
                                        onClick={() => setSelectedBooking(booking)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBooking(booking); } }}
                                    >
                                        <td>
                                            <span className="booking-code">{booking.confirmationCode}</span>
                                            <span className="booking-date">{booking.date}</span>
                                            <span className="booking-time">{booking.time}</span>
                                        </td>
                                        <td>
                                            <span className="guest-name">{booking.parent.name}</span>
                                            <span className="room-number">{t('common.room')} {booking.room}</span>
                                        </td>
                                        <td>
                                            <div className="children-badges">
                                                {booking.children.map((child, i) => (
                                                    <Badge key={i} variant="neutral" size="sm">
                                                        {child.name} ({child.age}y)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            {booking.sitter ? (
                                                <div className="sitter-cell">
                                                    <Avatar src={booking.sitter.avatar} name={booking.sitter.name} size="sm" variant={booking.sitter.tier === 'gold' ? 'gold' : 'default'} />
                                                    <div>
                                                        <span className="sitter-name">{booking.sitter.name}</span>
                                                        <TierBadge tier={booking.sitter.tier} />
                                                        {booking.sitter.hotelVerified && <Badge variant="success" size="sm">Hotel Verified</Badge>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setAssignTarget(booking); }}>{t('hotel.assign')}</Button>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td>
                                            <span className="amount">{formatCurrency(booking.totalAmount)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {paginatedBookings.length === 0 && (
                        <EmptyState
                            icon={<Calendar size={32} strokeWidth={1.5} />}
                            title={t('hotel.noBookingsFound')}
                            description={t('hotel.noBookingsFoundDesc')}
                        />
                    )}

                    {/* Mobile: card view */}
                    <div className="bookings-mobile">
                        {paginatedBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="booking-mobile-card"
                                onClick={() => setSelectedBooking(booking)}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBooking(booking); } }}
                            >
                                <div className="booking-mobile-header">
                                    <span className="booking-code">{booking.confirmationCode}</span>
                                    <StatusBadge status={booking.status} />
                                </div>
                                <div className="booking-mobile-body">
                                    <span>{booking.parent.name} - {t('common.room')} {booking.room}</span>
                                    <span>{booking.date} {booking.time}</span>
                                </div>
                                <div className="booking-mobile-footer">
                                    {booking.sitter && (
                                        <div className="sitter-cell">
                                            <Avatar src={booking.sitter.avatar} name={booking.sitter.name} size="sm" variant={booking.sitter.tier === 'gold' ? 'gold' : 'default'} />
                                            <span className="sitter-name">{booking.sitter.name}</span>
                                        </div>
                                    )}
                                    <span className="amount">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardBody>
            </Card>

            {/* Booking Detail Modal */}
            <Modal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                title={`${t('nav.bookings')} ${selectedBooking?.confirmationCode}`}
                size="lg"
            >
                {selectedBooking && (
                    <div className="booking-detail">
                        <div className="detail-section">
                            <h4>{t('hotel.guestInfo')}</h4>
                            <p><strong>{t('common.name')}:</strong> {selectedBooking.parent.name}</p>
                            <p><strong>{t('common.phone')}:</strong> {selectedBooking.parent.phone}</p>
                            <p><strong>{t('common.room')}:</strong> {selectedBooking.room}</p>
                        </div>
                        <div className="detail-section">
                            <h4>{t('hotel.childrenInfo')}</h4>
                            {selectedBooking.children.map((child, i) => (
                                <p key={i}>
                                    {child.name} ({child.age} {t('common.yearsOldShort', 'y')})
                                    {'allergies' in child && child.allergies && ` - ${t('common.allergies')}: ${child.allergies.join(', ')}`}
                                </p>
                            ))}
                        </div>
                        <div className="detail-section">
                            <h4>{t('hotel.scheduleInfo')}</h4>
                            <p><strong>{t('common.date')}:</strong> {selectedBooking.date}</p>
                            <p><strong>{t('common.time')}:</strong> {selectedBooking.time}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* New Booking Modal */}
            <Modal
                isOpen={showNewBooking}
                onClose={() => setShowNewBooking(false)}
                title={t('hotel.newBooking')}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setShowNewBooking(false); setFormErrors({}); }}>{t('common.cancel')}</Button>
                        <Button variant="gold" onClick={handleCreateBooking} disabled={isCreating || !newBookingForm.guestName.trim() || !newBookingForm.room.trim() || !newBookingForm.date} isLoading={isCreating}>{t('common.confirm')}</Button>
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
                    {pricePreview && (
                        <div className="booking-price-preview">
                            <h4>{t('pricing.breakdown')}</h4>
                            <PriceBreakdown items={previewPriceItems} total={pricePreview.total} />
                        </div>
                    )}
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
                            <Avatar src={sitter.avatar} name={sitter.name} size="sm" variant={sitter.tier === 'gold' ? 'gold' : 'default'} />
                            <div className="sitter-option-info">
                                <div className="sitter-option-name">{sitter.name}</div>
                                <div className="sitter-option-detail">{sitter.languages.join(', ')}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TierBadge tier={sitter.tier} />
                                {sitter.hotelVerified && <Badge variant="success" size="sm">Hotel Verified</Badge>}
                            </div>
                        </div>
                    ))}
                    {sitters.filter((s) => s.availability === 'Available').length === 0 && (
                        <p className="no-sitters-message">{t('sitterMgmt.noAvailableSitters')}</p>
                    )}
                </div>
            </Modal>

            {/* Guest Link Modal */}
            <Modal
                isOpen={!!guestLink}
                onClose={() => setGuestLink(null)}
                title={t('hotel.guestPageLink')}
                size="md"
            >
                {guestLink && (
                    <div className="modal-form-stack">
                        <p className="guest-link-desc">
                            {t('hotel.shareLinkDesc')}
                        </p>
                        <div className="guest-link-box">
                            {guestLink}
                        </div>
                        <Button variant="gold" onClick={handleCopyLink}>{t('hotel.copyLink')}</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
