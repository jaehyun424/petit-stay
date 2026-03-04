// ============================================
// Petit Stay - Hotel Settings Page
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../hooks/useHotel';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Currency, CancellationPolicy } from '../../types';
import '../../styles/pages/hotel-settings.css';

export default function Settings() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { hotel, isLoading, updateHotel, error: hotelError, retry: retryHotel } = useHotel(user?.hotelId);
    const { success, error: toastError } = useToast();
    const { isDark, toggleTheme } = useTheme();

    // ----------------------------------------
    // Hotel Profile state
    // ----------------------------------------
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // ----------------------------------------
    // Service Settings state
    // ----------------------------------------
    const [autoAssign, setAutoAssign] = useState(false);
    const [requireGoldForInfant, setRequireGoldForInfant] = useState(false);
    const [minBookingHours, setMinBookingHours] = useState(2);
    const [maxAdvanceBookingDays, setMaxAdvanceBookingDays] = useState(30);
    const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('moderate');

    // ----------------------------------------
    // Pricing state
    // ----------------------------------------
    const [commission, setCommission] = useState(15);
    const [currency, setCurrency] = useState<Currency>('KRW');

    // ----------------------------------------
    // Notification state
    // ----------------------------------------
    const [notifyNewBooking, setNotifyNewBooking] = useState(true);
    const [notifySessionAlerts, setNotifySessionAlerts] = useState(true);
    const [notifyEmergency, setNotifyEmergency] = useState(true);
    const [notifyDailySummary, setNotifyDailySummary] = useState(false);

    // ----------------------------------------
    // Save state
    // ----------------------------------------
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // ----------------------------------------
    // Validation state
    // ----------------------------------------
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // ----------------------------------------
    // Populate form from hotel data
    // ----------------------------------------
    const populateForm = useCallback(() => {
        if (hotel) {
            setName(hotel.name);
            setEmail(hotel.contactEmail);
            setPhone(hotel.contactPhone);
            setAddress(hotel.address);
            setAutoAssign(hotel.settings.autoAssign);
            setRequireGoldForInfant(hotel.settings.requireGoldForInfant);
            setMinBookingHours(hotel.settings.minBookingHours);
            setMaxAdvanceBookingDays(hotel.settings.maxAdvanceBookingDays);
            setCancellationPolicy(hotel.settings.cancellationPolicy);
            setCommission(hotel.commission);
            setCurrency(hotel.currency);
            setFormErrors({});
            setIsDirty(false);
        }
    }, [hotel]);

    useEffect(() => {
        populateForm();
    }, [populateForm]);

    // ----------------------------------------
    // Mark form dirty on any change
    // ----------------------------------------
    const markDirty = () => { if (!isDirty) setIsDirty(true); };

    // ----------------------------------------
    // Clear a single field error
    // ----------------------------------------
    const clearError = (field: string) => {
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    // ----------------------------------------
    // Validate form
    // ----------------------------------------
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim()) {
            errors.name = t('settings.nameRequired');
        }
        if (!email.trim() || !emailRegex.test(email)) {
            errors.email = t('settings.emailRequired');
        }
        if (!phone.trim()) {
            errors.phone = t('settings.phoneRequired');
        }
        if (commission < 0 || commission > 100) {
            errors.commission = t('settings.commissionRange');
        }
        if (minBookingHours < 1) {
            errors.minBookingHours = t('settings.minOneHour');
        }
        if (maxAdvanceBookingDays < 1) {
            errors.maxAdvanceBookingDays = t('settings.minOneDay');
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ----------------------------------------
    // Cancel handler
    // ----------------------------------------
    const handleCancel = () => {
        populateForm();
    };

    // ----------------------------------------
    // Save handler
    // ----------------------------------------
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            await updateHotel({
                name,
                contactEmail: email,
                contactPhone: phone,
                address,
                commission,
                currency: currency as Currency,
                settings: {
                    autoAssign,
                    requireGoldForInfant,
                    minBookingHours,
                    maxAdvanceBookingDays,
                    cancellationPolicy,
                },
            });
            success(t('settings.settingsSaved'), t('settings.settingsSavedDesc'));
        } catch {
            toastError(t('settings.saveFailed'), t('settings.saveFailedDesc'));
        }
        setIsSaving(false);
    };

    // ----------------------------------------
    // Loading skeleton
    // ----------------------------------------
    if (isLoading) {
        return (
            <div className="settings-page animate-fade-in">
                <div className="page-header">
                    <Skeleton width="200px" height="2rem" />
                    <Skeleton width="350px" height="1rem" />
                </div>
                <div className="settings-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton width="50%" height="1.25rem" />
                            </CardHeader>
                            <CardBody>
                                <div className="form-stack">
                                    <Skeleton height="2.5rem" />
                                    <Skeleton height="2.5rem" />
                                    <Skeleton height="2.5rem" />
                                    <Skeleton height="2.5rem" />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="settings-page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('hotel.hotelSettings', 'Hotel Settings')}</h1>
                <p className="page-subtitle">{t('hotel.hotelSettingsSubtitle', "Manage your hotel's childcare service configuration")}</p>
            </div>

            {hotelError && <ErrorBanner error={hotelError} onRetry={retryHotel} />}

            <div className="settings-grid" role="form" aria-label="Hotel settings">
                {/* Hotel Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('hotel.hotelProfileSubtitle', 'Basic information about your hotel')}>{t('hotel.hotelProfile', 'Hotel Profile')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="form-stack">
                            <Input
                                label={t('settings.hotelName')}
                                value={name}
                                error={formErrors.name}
                                onChange={(e) => { setName(e.target.value); clearError('name'); markDirty(); }}
                                placeholder={t('settings.enterHotelName')}
                            />
                            <Input
                                label={t('settings.contactEmail')}
                                type="email"
                                value={email}
                                error={formErrors.email}
                                onChange={(e) => { setEmail(e.target.value); clearError('email'); markDirty(); }}
                                placeholder={t('settings.emailPlaceholder')}
                            />
                            <Input
                                label={t('settings.contactPhone')}
                                value={phone}
                                error={formErrors.phone}
                                onChange={(e) => { setPhone(e.target.value); clearError('phone'); markDirty(); }}
                                placeholder={t('settings.phonePlaceholder')}
                            />
                            <Textarea
                                label={t('settings.address')}
                                value={address}
                                onChange={(e) => { setAddress(e.target.value); markDirty(); }}
                                placeholder={t('settings.enterAddress')}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Service Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('hotel.serviceSettingsSubtitle', 'Customize service availability')}>{t('hotel.serviceSettings', 'Service Settings')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="form-stack">
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={autoAssign}
                                    onChange={(e) => { setAutoAssign(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.autoAssign')}</span>
                            </label>
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={requireGoldForInfant}
                                    onChange={(e) => { setRequireGoldForInfant(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.requireGoldTier')}</span>
                            </label>
                            <Input
                                label={t('settings.minBookingHours')}
                                type="number"
                                value={minBookingHours}
                                error={formErrors.minBookingHours}
                                onChange={(e) => { setMinBookingHours(Number(e.target.value)); clearError('minBookingHours'); markDirty(); }}
                                placeholder="2"
                            />
                            <Input
                                label={t('settings.maxAdvanceDays')}
                                type="number"
                                value={maxAdvanceBookingDays}
                                error={formErrors.maxAdvanceBookingDays}
                                onChange={(e) => { setMaxAdvanceBookingDays(Number(e.target.value)); clearError('maxAdvanceBookingDays'); markDirty(); }}
                                placeholder="30"
                            />
                            <Select
                                label={t('settings.cancellationPolicy')}
                                value={cancellationPolicy}
                                onChange={(e) => { setCancellationPolicy(e.target.value as CancellationPolicy); markDirty(); }}
                                options={[
                                    { value: 'flexible', label: t('settings.flexible') },
                                    { value: 'moderate', label: t('settings.moderate') },
                                    { value: 'strict', label: t('settings.strict') },
                                ]}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('hotel.pricingSettingsSubtitle', "Set your hotel's pricing")}>{t('hotel.pricingSettings', 'Pricing Configuration')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="form-stack">
                            <Input
                                label={t('settings.commissionRate')}
                                type="number"
                                value={commission}
                                error={formErrors.commission}
                                onChange={(e) => { setCommission(Number(e.target.value)); clearError('commission'); markDirty(); }}
                                placeholder="15"
                            />
                            <Select
                                label={t('settings.currency')}
                                value={currency}
                                onChange={(e) => { setCurrency(e.target.value as Currency); markDirty(); }}
                                options={[
                                    { value: 'KRW', label: t('settings.krw') },
                                    { value: 'USD', label: t('settings.usd') },
                                    { value: 'JPY', label: t('settings.jpy') },
                                ]}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Display */}
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('hotel.displaySettingsSubtitle', 'Appearance preferences')}>{t('common.theme', 'Theme')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={isDark}
                                onChange={toggleTheme}
                            />
                            <span>{isDark ? <><Moon size={20} strokeWidth={1.75} /> {t('common.dark')}</> : <><Sun size={20} strokeWidth={1.75} /> {t('common.light')}</>}</span>
                        </label>
                    </CardBody>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle subtitle={t('hotel.notificationSettingsSubtitle', 'Manage notification preferences')}>{t('hotel.notificationSettings', 'Notification Settings')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="notification-settings">
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={notifyNewBooking}
                                    onChange={(e) => { setNotifyNewBooking(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.newBookingNotif')}</span>
                            </label>
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={notifySessionAlerts}
                                    onChange={(e) => { setNotifySessionAlerts(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.sessionAlerts')}</span>
                            </label>
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={notifyEmergency}
                                    onChange={(e) => { setNotifyEmergency(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.emergencyAlerts')}</span>
                            </label>
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={notifyDailySummary}
                                    onChange={(e) => { setNotifyDailySummary(e.target.checked); markDirty(); }}
                                />
                                <span>{t('settings.dailySummary')}</span>
                            </label>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="settings-actions">
                <Button variant="secondary" onClick={handleCancel}>{t('common.cancel')}</Button>
                <Button variant="gold" onClick={handleSave} isLoading={isSaving} disabled={!isDirty}>
                    {t('settings.saveChanges')}
                </Button>
            </div>
        </div>
    );
}
