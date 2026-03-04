// Sitter Profile Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Building2, BadgeCheck, Scale, Moon, Sun, Calendar, Wallet, FileText, HelpCircle, Check } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { TierBadge, Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { WeeklyScheduleGrid } from '../../components/sitter/WeeklyScheduleGrid';
import { DocumentUploader, type UploadedDocument } from '../../components/sitter/DocumentUploader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSitterProfile } from '../../hooks/useSitters';
import { useReviews } from '../../hooks/useReviews';
import { StarRating } from '../../components/common/ReviewForm';
import { DEMO_SITTER_AVAILABILITY, DEMO_SITTER_DOCUMENTS } from '../../data/demo';
import type { WeeklyAvailability } from '../../types';
import '../../styles/pages/sitter-profile.css';

const getBankOptions = (t: (key: string) => string) => [
    { value: 'kb', label: t('sitterProfile.bankKb') },
    { value: 'shinhan', label: t('sitterProfile.bankShinhan') },
    { value: 'woori', label: t('sitterProfile.bankWoori') },
    { value: 'hana', label: t('sitterProfile.bankHana') },
    { value: 'nh', label: t('sitterProfile.bankNh') },
    { value: 'ibk', label: t('sitterProfile.bankIbk') },
];

interface EditForm {
    displayName: string;
    phone: string;
    languages: string;
}

export default function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { signOut, user, updateUserProfile } = useAuth();
    const { success, error: showError } = useToast();
    const { isDark, toggleTheme } = useTheme();
    const sitterId = user?.sitterInfo?.sitterId || user?.id;
    const { profile } = useSitterProfile(sitterId);
    const { reviews, averageRating, isLoading: reviewsLoading } = useReviews(sitterId);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>({
        displayName: '',
        phone: '',
        languages: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    // Availability modal
    const [showAvailModal, setShowAvailModal] = useState(false);
    const [availability, setAvailability] = useState<WeeklyAvailability>(DEMO_SITTER_AVAILABILITY as WeeklyAvailability);

    // Bank info modal
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankForm, setBankForm] = useState({ bankName: 'kb', accountNumber: '', accountHolder: '' });

    // Documents modal
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [documents, setDocuments] = useState<UploadedDocument[]>(DEMO_SITTER_DOCUMENTS);

    const openEditModal = () => {
        setEditForm({
            displayName: profile.name,
            phone: user?.profile?.phone || '',
            languages: profile.languages.map((l) => l.name).join(', '),
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        setIsSaving(true);
        try {
            const nameParts = editForm.displayName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            await updateUserProfile({
                firstName,
                lastName,
                phone: editForm.phone,
            });
            success(t('common.save'), t('sitter.profile.updateSuccess', 'Profile updated successfully'));
            setEditModalOpen(false);
        } catch {
            showError(t('common.edit'), t('sitter.profile.updateError', 'Failed to update profile'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleSaveAvailability = () => {
        success(t('common.save'), t('profile.weeklySchedule'));
        setShowAvailModal(false);
    };

    const handleSaveBankInfo = () => {
        if (!bankForm.accountNumber || !bankForm.accountHolder) return;
        success(t('common.save'), t('profile.bankAccount'));
        setShowBankModal(false);
    };

    return (
        <div className="sitter-profile animate-fade-in">
            {/* Profile Header */}
            <Card variant="gold">
                <CardBody>
                    <div className="profile-header">
                        <Avatar src={profile.avatar} name={profile.name} size="xl" variant="gold" />
                        <div className="profile-info">
                            <h2>{profile.name}</h2>
                            <TierBadge tier={profile.tier} />
                            <div className="profile-rating"><Star size={14} strokeWidth={1.75} fill="currentColor" /> {profile.rating} ({profile.reviewCount} {t('sitterProfile.reviewsCount')})</div>
                            <Button variant="ghost" size="sm" onClick={openEditModal}>
                                {t('common.edit')} {t('sitter.profile.title', 'Profile')}
                            </Button>
                        </div>
                    </div>
                    <div className="profile-stats">
                        <div className="pstat"><span className="pvalue">{profile.totalSessions}</span><span className="plabel">{t('sitterProfile.sessions')}</span></div>
                        <div className="pstat"><span className="pvalue">{profile.safetyDays}</span><span className="plabel">{t('sitterProfile.safeDays')}</span></div>
                        <div className="pstat"><span className="pvalue">{profile.onTimeRate}</span><span className="plabel">{t('sitterProfile.onTime')}</span></div>
                    </div>
                </CardBody>
            </Card>

            {/* Verification Status */}
            <Card className="mb-4">
                <CardBody>
                    <h3 className="section-title">{t('profile.identityVerification')}</h3>
                    <div className="verification-grid">
                        <div className="verify-item verified">
                            <span className="verify-icon" aria-hidden="true"><Building2 size={16} strokeWidth={1.75} /></span>
                            <div className="verify-text">
                                <span className="verify-label">{t('profile.hotelPartnerVerified')}</span>
                                <span className="verify-sub">Grand Hyatt • 2024</span>
                            </div>
                            <span className="verify-check" aria-label="Verified"><Check size={16} strokeWidth={2.5} /></span>
                        </div>
                        <div className="verify-item verified">
                            <span className="verify-icon" aria-hidden="true"><BadgeCheck size={16} strokeWidth={1.75} /></span>
                            <div className="verify-text">
                                <span className="verify-label">{t('profile.govIdChecked')}</span>
                                <span className="verify-sub">{t('profile.nationalRegistry')}</span>
                            </div>
                            <span className="verify-check" aria-label="Verified"><Check size={16} strokeWidth={2.5} /></span>
                        </div>
                        <div className="verify-item verified">
                            <span className="verify-icon" aria-hidden="true"><Scale size={16} strokeWidth={1.75} /></span>
                            <div className="verify-text">
                                <span className="verify-label">{t('profile.backgroundClear')}</span>
                                <span className="verify-sub">Valid until Dec 2025</span>
                            </div>
                            <span className="verify-check" aria-label="Verified"><Check size={16} strokeWidth={2.5} /></span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Certifications */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('sitterProfile.certifications')}</h3>
                    <div className="certs-list">
                        {profile.certifications.map((cert, i) => (
                            <Badge key={i} variant="success" icon={<Check size={12} strokeWidth={2.5} />}>{cert}</Badge>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Reviews */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('sitterProfile.reviews')}</h3>
                    {reviewsLoading ? (
                        <p className="text-sm text-charcoal-500">{t('profile.loadingReviews')}</p>
                    ) : reviews.length > 0 ? (
                        <>
                            <div className="reviews-summary">
                                <StarRating rating={averageRating} />
                                <span className="reviews-count">{t('sitterProfile.reviewCount', { count: reviews.length })}</span>
                            </div>
                            <div className="reviews-list">
                                {reviews.slice(0, 5).map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-item-header">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="review-date">
                                                {review.createdAt.toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="review-comment-text">{review.comment}</p>
                                        )}
                                        <span className="review-author">{review.parentName || t('sitterProfile.guestFallback')}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-charcoal-500">{t('profile.noReviewsYet')}</p>
                    )}
                </CardBody>
            </Card>

            {/* Languages */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('sitterProfile.languages')}</h3>
                    <div className="lang-list">
                        {profile.languages.map((lang, i) => (
                            <span key={i}>{lang.flag} {lang.name} ({lang.level})</span>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Settings */}
            <Card>
                <CardBody>
                    <div className="settings-menu" role="navigation" aria-label={t('profile.settings')}>
                        <button className="menu-btn" onClick={toggleTheme}>
                            <span aria-hidden="true">{isDark ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}</span> {t('common.theme')}
                            <span className="menu-item-value">{isDark ? t('common.dark') : t('common.light')}</span>
                        </button>
                        <button className="menu-btn" onClick={() => setShowAvailModal(true)}><span aria-hidden="true"><Calendar size={20} strokeWidth={1.75} /></span> {t('profile.availability')}</button>
                        <button className="menu-btn" onClick={() => setShowBankModal(true)}><span aria-hidden="true"><Wallet size={20} strokeWidth={1.75} /></span> {t('profile.bankAccount')}</button>
                        <button className="menu-btn" onClick={() => setShowDocsModal(true)}><span aria-hidden="true"><FileText size={20} strokeWidth={1.75} /></span> {t('profile.documents')}</button>
                        <button className="menu-btn" onClick={() => success(t('profile.helpLabel'), t('profile.supportEmail'))}><span aria-hidden="true"><HelpCircle size={20} strokeWidth={1.75} /></span> {t('profile.helpLabel')}</button>
                    </div>
                </CardBody>
            </Card>

            <Button variant="secondary" fullWidth onClick={handleSignOut}>{t('profile.signOut')}</Button>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={t('common.edit') + ' ' + t('sitter.profile.title', 'Profile')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleEditSubmit} disabled={isSaving}>
                            {isSaving ? t('common.loading') : t('common.save')}
                        </Button>
                    </>
                }
            >
                <div className="modal-form-stack">
                    <Input
                        label={t('common.name')}
                        value={editForm.displayName}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        placeholder={t('sitterProfile.displayNamePlaceholder')}
                    />
                    <Input
                        label={t('common.phone')}
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+82-10-1234-5678"
                    />
                    <Input
                        label={t('sitter.profile.languages', 'Languages')}
                        value={editForm.languages}
                        onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                        hint={t('sitter.profile.languagesHint', 'Comma-separated, e.g. English, Korean')}
                        placeholder={t('sitterProfile.languagesPlaceholder')}
                    />
                </div>
            </Modal>

            {/* Availability Modal */}
            <Modal
                isOpen={showAvailModal}
                onClose={() => setShowAvailModal(false)}
                title={t('profile.weeklySchedule')}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAvailModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" onClick={handleSaveAvailability}>{t('common.save')}</Button>
                    </>
                }
            >
                <WeeklyScheduleGrid availability={availability} onChange={setAvailability} />
            </Modal>

            {/* Bank Info Modal */}
            <Modal
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                title={t('profile.bankAccount')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowBankModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" onClick={handleSaveBankInfo}>{t('common.save')}</Button>
                    </>
                }
            >
                <div className="modal-form-stack">
                    <Select
                        label={t('profile.bankName')}
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        options={getBankOptions(t)}
                    />
                    <Input
                        label={t('profile.accountNumber')}
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        placeholder="000-0000-0000-00"
                    />
                    <Input
                        label={t('profile.accountHolder')}
                        value={bankForm.accountHolder}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                        placeholder={t('sitterProfile.accountHolderPlaceholder')}
                    />
                </div>
            </Modal>

            {/* Documents Modal */}
            <Modal
                isOpen={showDocsModal}
                onClose={() => setShowDocsModal(false)}
                title={t('profile.documents')}
                size="sm"
            >
                <DocumentUploader
                    sitterId={sitterId || ''}
                    documents={documents}
                    onDocumentsChange={setDocuments}
                />
            </Modal>
        </div>
    );
}
