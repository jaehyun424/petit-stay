// ============================================
// Petit Stay - Parent Booking Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import { useHotels } from '../../hooks/useHotel';
import { DEMO_MODE } from '../../hooks/useDemo';
import { bookingService } from '../../services/firestore';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/parent-booking.css';

const TIME_SLOTS = [
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
    { value: '20:00', label: '20:00' },
    { value: '21:00', label: '21:00' },
];

export default function Booking() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { children } = useChildren(user?.id);
    const { hotels } = useHotels();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        hotel: '',
        room: '',
        date: '',
        startTime: '',
        duration: '4',
        children: [] as string[],
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Initialize all children as selected when they load
    useEffect(() => {
        if (children.length > 0 && formData.children.length === 0) {
            setFormData((prev) => ({ ...prev, children: children.map((c) => c.id) }));
        }
    }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleChild = (childId: string) => {
        setFormData((prev) => ({
            ...prev,
            children: prev.children.includes(childId)
                ? prev.children.filter((id) => id !== childId)
                : [...prev.children, childId],
        }));
    };

    const validateStep1 = () => {
        const errors: Record<string, string> = {};
        if (!formData.date) errors.date = t('validation.dateRequired');
        else {
            const selected = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) errors.date = t('validation.pastDate');
        }
        if (!formData.startTime) errors.startTime = t('validation.startTimeRequired');
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const DURATION_OPTIONS = [
        { value: '2', label: `2 ${t('common.hours')}` },
        { value: '3', label: `3 ${t('common.hours')}` },
        { value: '4', label: `4 ${t('common.hours')}` },
        { value: '5', label: `5 ${t('common.hours')}` },
        { value: '6', label: `6 ${t('common.hours')}` },
    ];

    const STEP_LABELS = [
        t('booking.bookingDetails'),
        t('parent.children'),
        t('common.confirm')
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) {
            setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                await new Promise((r) => setTimeout(r, 1500));
            } else {
                const confirmationCode = `KCP-${Date.now().toString(36).toUpperCase()}`;
                const hours = parseInt(formData.duration) || 4;
                const baseRate = 70000;
                const baseTotal = baseRate * hours;

                await bookingService.createBooking({
                    hotelId: formData.hotel || 'grand-hyatt-seoul',
                    parentId: user?.id || '',
                    confirmationCode,
                    status: 'pending',
                    schedule: {
                        date: formData.date ? new Date(formData.date) : new Date(),
                        startTime: formData.startTime || '18:00',
                        endTime: '',
                        duration: hours,
                        timezone: 'Asia/Seoul',
                    },
                    location: {
                        type: 'room',
                        roomNumber: formData.room || '',
                    },
                    children: children.map((c) => ({
                        childId: c.id,
                        firstName: c.name,
                        age: c.age,
                    })),
                    requirements: {
                        sitterTier: 'any',
                        preferredLanguages: ['en'],
                        specialRequests: formData.notes || undefined,
                    },
                    pricing: {
                        baseRate,
                        hours,
                        baseTotal,
                        nightSurcharge: 0,
                        holidaySurcharge: 0,
                        goldSurcharge: 0,
                        subtotal: baseTotal,
                        commission: 0,
                        total: baseTotal,
                    },
                    payment: {
                        status: 'pending',
                        method: 'card',
                    },
                    trustProtocol: {
                        safeWord: '',
                    },
                    metadata: {
                        source: 'parent_app',
                    },
                });
            }
            success(t('booking.bookingConfirmed'), t('booking.bookingConfirmed'));
            navigate('/parent');
        } catch (err) {
            console.error('Booking creation failed:', err);
            showError(t('errors.unknownError', 'An error occurred'), t('booking.bookingFailed', 'Failed to create booking. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePricing = () => {
        const baseRate = 70000;
        const hours = parseInt(formData.duration) || 4;
        const baseTotal = baseRate * hours;
        const childrenCount = formData.children.length || 1;
        const additionalChildCharge = childrenCount > 1 ? (childrenCount - 1) * 20000 * hours : 0;
        const subtotal = baseTotal + additionalChildCharge;

        // Night surcharge: after 22:00
        const startHour = parseInt(formData.startTime?.split(':')[0] || '18');
        const endHour = startHour + hours;
        const nightHours = Math.max(0, endHour - 22);
        const nightSurcharge = nightHours > 0 ? nightHours * 15000 : 0;

        const total = subtotal + nightSurcharge;
        return { baseRate, hours, baseTotal, additionalChildCharge, childrenCount, nightSurcharge, subtotal, total };
    };

    const calculatePrice = () => calculatePricing().total;

    return (
        <div className="booking-page animate-fade-in">
            <h1 className="page-title">{t('booking.newBooking')}</h1>

            {/* Progress Steps */}
            <div className="progress-steps" role="group" aria-label="Booking progress">
                {STEP_LABELS.map((label, i) => (
                    <div key={i} className={`step ${i + 1 <= step ? 'step-active' : ''}`} aria-current={i + 1 === step ? 'step' : undefined}>
                        <span className="step-number" aria-hidden="true">{i + 1}</span>
                        <span className="step-label">{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Details */}
            {step === 1 && (
                <Card className="booking-card animate-fade-in">
                    <CardBody>
                        <h2>{t('booking.bookingDetails')}</h2>
                        <div className="form-stack">
                            <Select
                                label={t('booking.selectHotel')}
                                name="hotel"
                                value={formData.hotel}
                                onChange={handleInputChange}
                                options={hotels}
                                placeholder={t('booking.chooseHotel')}
                            />
                            <Input
                                label={t('common.room')}
                                name="room"
                                value={formData.room}
                                onChange={handleInputChange}
                                placeholder={t('booking.roomPlaceholder')}
                            />
                            <Input
                                label={t('common.date')}
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                error={formErrors.date}
                            />
                            <div className="time-row">
                                <Select
                                    label={t('booking.startTime')}
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    options={TIME_SLOTS}
                                    placeholder={t('common.search') + '...'}
                                    error={formErrors.startTime}
                                />
                                <Select
                                    label={t('booking.duration')}
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    options={DURATION_OPTIONS}
                                />
                            </div>
                        </div>
                        <Button variant="gold" fullWidth onClick={() => { if (validateStep1()) setStep(2); }}>
                            {t('common.next')}
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* Step 2: Children */}
            {step === 2 && (
                <Card className="booking-card animate-fade-in">
                    <CardBody>
                        <h2>{t('booking.selectChildren')}</h2>
                        <div className="children-selection">
                            {children.map((child) => (
                                <label key={child.id} className="child-option">
                                    <input
                                        type="checkbox"
                                        checked={formData.children.includes(child.id)}
                                        onChange={() => toggleChild(child.id)}
                                    />
                                    <div className="child-info">
                                        <span className="child-name">{child.name}</span>
                                        <span className="child-age">{child.age} {t('common.age')}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <Input
                            label={t('booking.specialRequests')}
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder={t('booking.allergiesOrNeeds')}
                        />
                        <div className="button-row">
                            <Button variant="secondary" onClick={() => setStep(1)}>{t('common.back')}</Button>
                            <Button variant="gold" onClick={() => setStep(3)}>{t('common.next')}</Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <Card className="booking-card animate-fade-in">
                    <CardBody>
                        <h2>{t('booking.reviewBooking')}</h2>
                        <div className="confirmation-summary">
                            <div className="summary-row">
                                <span>{t('booking.selectHotel')}</span>
                                <span>{hotels.find((h) => h.value === formData.hotel)?.label || 'Grand Hyatt Seoul'}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('common.room')}</span>
                                <span>{formData.room || '2305'}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('booking.dateTime')}</span>
                                <span>{formData.date || t('time.today')} {formData.startTime || '18:00'}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('booking.duration')}</span>
                                <span>{formData.duration} {t('common.hours')}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('parent.children')}</span>
                                <span>{children.filter(c => formData.children.includes(c.id)).map(c => c.name + ' (' + c.age + 'y)').join(', ')}</span>
                            </div>
                            {formData.notes && (
                                <div className="summary-row">
                                    <span>{t('booking.specialRequests')}</span>
                                    <span>{formData.notes}</span>
                                </div>
                            )}

                            {/* Pricing Breakdown */}
                            <div className="pricing-breakdown">
                                <div className="summary-row">
                                    <span>{t('booking.baseRate')} ({formatCurrency(calculatePricing().baseRate)} × {calculatePricing().hours}h)</span>
                                    <span>{formatCurrency(calculatePricing().baseTotal)}</span>
                                </div>
                                {calculatePricing().additionalChildCharge > 0 && (
                                    <div className="summary-row">
                                        <span>{t('booking.additionalChild')} ({calculatePricing().childrenCount - 1} × {formatCurrency(20000)}/h)</span>
                                        <span>{formatCurrency(calculatePricing().additionalChildCharge)}</span>
                                    </div>
                                )}
                                {calculatePricing().nightSurcharge > 0 && (
                                    <div className="summary-row">
                                        <span>{t('booking.nightSurcharge')}</span>
                                        <span>{formatCurrency(calculatePricing().nightSurcharge)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="summary-row total">
                                <span>{t('booking.totalCost')}</span>
                                <span className="price">{formatCurrency(calculatePrice())}</span>
                            </div>
                        </div>
                        <p className="terms-note">
                            {t('auth.termsAgreement')}
                        </p>
                        <div className="button-row">
                            <Button variant="secondary" onClick={() => setStep(2)}>{t('common.back')}</Button>
                            <Button variant="gold" onClick={handleSubmit} isLoading={isLoading}>
                                {t('booking.confirmBooking')}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
