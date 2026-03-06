// Parent Profile Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Globe, Moon, Sun, CreditCard, FileText, Lock, HelpCircle, Baby } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Modal, ConfirmModal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { PaymentMethodCardDisplay } from '../../components/common/PaymentMethodCard';
import { useAuth } from '../../contexts/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DEMO_PAYMENT_METHODS, type DemoPaymentMethod } from '../../data/demo';
import type { DemoChild } from '../../data/demo';
import '../../styles/pages/parent-profile.css';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const getGenderOptions = (t: (key: string) => string) => [
    { value: 'female', label: t('profile.female') },
    { value: 'male', label: t('profile.male') },
    { value: 'other', label: t('profile.otherGender') },
];

const GENDER_AVATAR: Record<string, string> = {
    female: 'F',
    male: 'M',
    other: 'O',
};

type ChildFormData = {
    name: string;
    age: string;
    gender: 'male' | 'female' | 'other';
    allergies: string;
};

const EMPTY_FORM: ChildFormData = { name: '', age: '', gender: 'female', allergies: '' };

export default function Profile() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { t, i18n } = useTranslation();
    const { children, isLoading, addChild, updateChild, removeChild, error: childrenError, retry: retryChildren } = useChildren(user?.id);
    const toast = useToast();
    const { toggleTheme, isDark } = useTheme();

    // Modal state
    const [showChildModal, setShowChildModal] = useState(false);
    const [editingChild, setEditingChild] = useState<DemoChild | null>(null);
    const [childForm, setChildForm] = useState<ChildFormData>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<Partial<ChildFormData>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Remove confirmation
    const [removeTarget, setRemoveTarget] = useState<DemoChild | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Language picker
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    // Notification preferences modal
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [notifPrefs, setNotifPrefs] = useState({
        push: user?.notifications?.push ?? true,
        email: user?.notifications?.email ?? true,
        sms: user?.notifications?.sms ?? false,
    });

    // Payment methods modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<DemoPaymentMethod[]>(DEMO_PAYMENT_METHODS);
    const [showAddCard, setShowAddCard] = useState(false);
    const [cardForm, setCardForm] = useState({ number: '', expiry: '', holder: '' });

    // --- Child modal helpers ---

    const openAddModal = () => {
        setEditingChild(null);
        setChildForm(EMPTY_FORM);
        setFormErrors({});
        setShowChildModal(true);
    };

    const openEditModal = (child: DemoChild) => {
        setEditingChild(child);
        setChildForm({
            name: child.name,
            age: String(child.age),
            gender: child.gender,
            allergies: child.allergies.join(', '),
        });
        setFormErrors({});
        setShowChildModal(true);
    };

    const closeChildModal = () => {
        setShowChildModal(false);
        setEditingChild(null);
        setChildForm(EMPTY_FORM);
        setFormErrors({});
    };

    const validateForm = (): boolean => {
        const errors: Partial<ChildFormData> = {};
        if (!childForm.name.trim()) errors.name = t('common.required') || 'Required';
        const ageNum = Number(childForm.age);
        if (!childForm.age || isNaN(ageNum) || ageNum < 0 || ageNum > 17) {
            errors.age = t('common.invalid') || 'Enter a valid age (0-17)';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChildSubmit = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const allergiesArr = childForm.allergies
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean);

            if (editingChild) {
                await updateChild(editingChild.id, {
                    name: childForm.name.trim(),
                    age: Number(childForm.age),
                    gender: childForm.gender,
                    allergies: allergiesArr,
                });
                toast.success(t('common.save'), childForm.name.trim());
            } else {
                await addChild({
                    name: childForm.name.trim(),
                    age: Number(childForm.age),
                    gender: childForm.gender,
                    allergies: allergiesArr,
                });
                toast.success(t('parent.addChild'), childForm.name.trim());
            }
            closeChildModal();
        } catch {
            toast.error(t('common.error') || 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveChild = async () => {
        if (!removeTarget) return;
        setIsRemoving(true);
        try {
            await removeChild(removeTarget.id);
            toast.success(t('common.remove') || 'Removed', removeTarget.name);
            setRemoveTarget(null);
        } catch {
            toast.error(t('common.error') || 'Error');
        } finally {
            setIsRemoving(false);
        }
    };

    // --- Language picker ---

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setShowLanguagePicker(false);
        const lang = LANGUAGES.find((l) => l.code === code);
        toast.success(t('auth.preferredLanguage'), lang?.label || code);
    };

    // --- Notification preferences ---

    const handleSaveNotifPrefs = () => {
        toast.success(t('profile.notificationPreferences'), t('common.save'));
        setShowNotifModal(false);
    };

    // --- Payment methods ---

    const handleAddCard = () => {
        if (!cardForm.number || !cardForm.expiry || !cardForm.holder) return;
        const last4 = cardForm.number.replace(/\s/g, '').slice(-4);
        const [mm, yy] = cardForm.expiry.split('/');
        const newCard: DemoPaymentMethod = {
            id: `pm_${Date.now()}`,
            brand: 'visa',
            last4,
            expiryMonth: parseInt(mm) || 1,
            expiryYear: 2000 + (parseInt(yy) || 25),
            holderName: cardForm.holder,
            isDefault: paymentMethods.length === 0,
        };
        setPaymentMethods([...paymentMethods, newCard]);
        setCardForm({ number: '', expiry: '', holder: '' });
        setShowAddCard(false);
        toast.success(t('profile.addPaymentMethod'), `**** ${last4}`);
    };

    const handleRemoveCard = (id: string) => {
        setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
    };

    // --- Sign out ---

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // --- Render ---

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    return (
        <div className="profile-page animate-fade-in">
            {childrenError && <ErrorBanner error={childrenError} onRetry={retryChildren} />}
            {/* User Info */}
            <Card className="profile-card">
                <CardBody>
                    <div className="profile-header">
                        <Avatar name={`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`} size="xl" />
                        <div className="profile-info">
                            <h2>{user?.profile?.firstName} {user?.profile?.lastName}</h2>
                            <span className="email">{user?.email || ''}</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Children */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('parent.myChildren')}</h3>
                    <div className="children-list">
                        {isLoading ? (
                            <div className="profile-empty-state">
                                <Skeleton width="100%" height="60px" />
                                <Skeleton width="100%" height="60px" />
                            </div>
                        ) : children.length === 0 ? (
                            <EmptyState
                                icon={<Baby size={28} strokeWidth={1.5} />}
                                title={t('parent.noChildrenYet', 'No children added yet')}
                                description={t('parent.noChildrenYetDesc', 'Add your children\'s information for a personalized care experience')}
                                size="sm"
                            />
                        ) : (
                            children.map((child) => (
                                <div className="child-item" key={child.id}>
                                    <span className="child-avatar">{GENDER_AVATAR[child.gender] || 'O'}</span>
                                    <div className="child-info">
                                        <span className="child-name">{child.name}</span>
                                        <span className="child-age">{t('common.yearsOld', { count: child.age })}</span>
                                        {child.allergies.length > 0 && (
                                            <span className="child-allergies">
                                                {t('common.allergies') || 'Allergies'}: {child.allergies.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="child-actions">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(child)}>
                                            {t('common.edit')}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(child)}>
                                            {t('common.remove') || 'Remove'}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <Button variant="secondary" fullWidth onClick={openAddModal}>
                        + {t('parent.addChild')}
                    </Button>
                </CardBody>
            </Card>

            {/* Settings Menu */}
            <Card>
                <CardBody>
                    <div className="settings-menu" role="navigation" aria-label="Settings">
                        <button className="menu-item" onClick={() => setShowNotifModal(true)}><span aria-hidden="true"><Bell size={20} strokeWidth={1.75} /></span> {t('parent.notifications')}</button>
                        <button className="menu-item" onClick={() => setShowLanguagePicker(true)}>
                            <span aria-hidden="true"><Globe size={20} strokeWidth={1.75} /></span> {t('auth.preferredLanguage')}
                            <span className="menu-item-value">
                                {currentLang.flag} {currentLang.label}
                            </span>
                        </button>
                        <button className="menu-item" onClick={toggleTheme}>
                            <span aria-hidden="true">{isDark ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}</span> {t('common.theme')}
                            <span className="menu-item-value">
                                {isDark ? t('common.dark') : t('common.light')}
                            </span>
                        </button>
                        <button className="menu-item" onClick={() => setShowPaymentModal(true)}><span aria-hidden="true"><CreditCard size={20} strokeWidth={1.75} /></span> {t('parent.paymentMethods')}</button>
                        <button className="menu-item" onClick={() => navigate('/terms')}><span aria-hidden="true"><FileText size={20} strokeWidth={1.75} /></span> {t('parent.termsOfService')}</button>
                        <button className="menu-item" onClick={() => navigate('/privacy')}><span aria-hidden="true"><Lock size={20} strokeWidth={1.75} /></span> {t('parent.privacyPolicy')}</button>
                        <button className="menu-item" onClick={() => navigate('/help')}><span aria-hidden="true"><HelpCircle size={20} strokeWidth={1.75} /></span> {t('parent.help')}</button>
                    </div>
                </CardBody>
            </Card>

            <Button variant="secondary" fullWidth onClick={handleSignOut}>
                {t('auth.signOut')}
            </Button>

            {/* Add/Edit Child Modal */}
            <Modal
                isOpen={showChildModal}
                onClose={closeChildModal}
                title={editingChild ? t('common.edit') : t('parent.addChild')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={closeChildModal} disabled={isSaving}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleChildSubmit} disabled={isSaving}>
                            {isSaving ? <span className="spinner spinner-sm" /> : t('common.save')}
                        </Button>
                    </>
                }
            >
                <div className="profile-form-stack">
                    <Input
                        label={t('common.name')}
                        value={childForm.name}
                        onChange={(e) => setChildForm((f) => ({ ...f, name: e.target.value }))}
                        error={formErrors.name}
                        placeholder={t('profile.namePlaceholder')}
                    />
                    <Input
                        label={t('common.age')}
                        type="number"
                        min={0}
                        max={17}
                        value={childForm.age}
                        onChange={(e) => setChildForm((f) => ({ ...f, age: e.target.value }))}
                        error={formErrors.age}
                        placeholder={t('profile.agePlaceholder')}
                    />
                    <Select
                        label={t('common.gender') || 'Gender'}
                        value={childForm.gender}
                        onChange={(e) => setChildForm((f) => ({ ...f, gender: e.target.value as 'male' | 'female' | 'other' }))}
                        options={getGenderOptions(t)}
                    />
                    <Input
                        label={t('common.allergies') || 'Allergies'}
                        value={childForm.allergies}
                        onChange={(e) => setChildForm((f) => ({ ...f, allergies: e.target.value }))}
                        placeholder={t('booking.allergiesOrNeeds') || 'e.g. peanuts, dairy'}
                        hint={t('common.commaSeparated') || 'Comma-separated'}
                    />
                </div>
            </Modal>

            {/* Remove Child Confirmation */}
            <ConfirmModal
                isOpen={!!removeTarget}
                onClose={() => setRemoveTarget(null)}
                onConfirm={handleRemoveChild}
                title={t('common.remove') || 'Remove'}
                message={`${t('common.confirmRemove') || 'Are you sure you want to remove'} ${removeTarget?.name || ''}?`}
                confirmText={t('common.remove') || 'Remove'}
                cancelText={t('common.cancel')}
                variant="danger"
                isLoading={isRemoving}
            />

            {/* Language Picker Modal */}
            <Modal
                isOpen={showLanguagePicker}
                onClose={() => setShowLanguagePicker(false)}
                title={t('auth.preferredLanguage')}
                size="sm"
            >
                <div className="language-picker-list">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-picker-item ${lang.code === i18n.language ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="language-picker-flag">{lang.flag}</span>
                            <span className="language-picker-label">{lang.label}</span>
                            {lang.code === i18n.language && (
                                <span className="language-picker-check" aria-hidden="true">&#10003;</span>
                            )}
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Notification Preferences Modal */}
            <Modal
                isOpen={showNotifModal}
                onClose={() => setShowNotifModal(false)}
                title={t('profile.notificationPreferences')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowNotifModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" onClick={handleSaveNotifPrefs}>{t('common.save')}</Button>
                    </>
                }
            >
                <div className="profile-form-stack">
                    <label className="toggle-option">
                        <input type="checkbox" checked={notifPrefs.push} onChange={(e) => setNotifPrefs({ ...notifPrefs, push: e.target.checked })} />
                        <span>{t('profile.pushNotifications')}</span>
                    </label>
                    <label className="toggle-option">
                        <input type="checkbox" checked={notifPrefs.email} onChange={(e) => setNotifPrefs({ ...notifPrefs, email: e.target.checked })} />
                        <span>{t('profile.emailNotifications')}</span>
                    </label>
                    <label className="toggle-option">
                        <input type="checkbox" checked={notifPrefs.sms} onChange={(e) => setNotifPrefs({ ...notifPrefs, sms: e.target.checked })} />
                        <span>{t('profile.smsNotifications')}</span>
                    </label>
                </div>
            </Modal>

            {/* Payment Methods Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => { setShowPaymentModal(false); setShowAddCard(false); }}
                title={t('parent.paymentMethods')}
                size="sm"
            >
                <div className="profile-form-stack">
                    {paymentMethods.length === 0 ? (
                        <p className="profile-empty-state">
                            {t('profile.noPaymentMethods')}
                        </p>
                    ) : (
                        paymentMethods.map((card) => (
                            <PaymentMethodCardDisplay
                                key={card.id}
                                card={card}
                                onRemove={handleRemoveCard}
                            />
                        ))
                    )}

                    {showAddCard ? (
                        <div className="payment-add-card-form">
                            <div className="profile-form-stack">
                                <Input
                                    label={t('profile.cardNumber')}
                                    value={cardForm.number}
                                    onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                                    placeholder={t('profile.cardNumberPlaceholder')}
                                />
                                <Input
                                    label={t('profile.expiry')}
                                    value={cardForm.expiry}
                                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                                    placeholder={t('profile.expiryPlaceholder')}
                                />
                                <Input
                                    label={t('profile.cardHolder')}
                                    value={cardForm.holder}
                                    onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })}
                                    placeholder={t('profile.cardHolderPlaceholder')}
                                />
                            </div>
                            <div className="payment-add-card-actions">
                                <Button variant="secondary" onClick={() => setShowAddCard(false)} fullWidth>{t('common.cancel')}</Button>
                                <Button variant="gold" onClick={handleAddCard} fullWidth>{t('common.save')}</Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="secondary" fullWidth onClick={() => setShowAddCard(true)}>
                            + {t('profile.addCard')}
                        </Button>
                    )}
                </div>
            </Modal>
        </div>
    );
}
