// Sitter Active Session Page
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardEdit, Camera, Apple, AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveSession } from '../../hooks/useSessions';
import { DEMO_MODE } from '../../hooks/useDemo';
import { activityService, sessionService, bookingService } from '../../services/firestore';
import { storageService } from '../../services/storage';
import '../../styles/pages/sitter-active-session.css';

export default function ActiveSession() {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { sessionInfo, checklist, toggleChecklistItem, sessionId } = useActiveSession(user?.id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Report Issue modal
    const [showReportIssue, setShowReportIssue] = useState(false);
    const [issueForm, setIssueForm] = useState({ description: '', severity: 'low' });

    const handleReportIssue = () => {
        success(t('activeSession.issueReported'), t('activeSession.issueReportedDesc', { severity: issueForm.severity }));
        setShowReportIssue(false);
        setIssueForm({ description: '', severity: 'low' });
    };

    const logActivity = async () => {
        if (!DEMO_MODE && sessionId) {
            try {
                await activityService.logActivity({
                    sessionId,
                    type: 'activity',
                    description: 'Activity update logged by sitter',
                });
            } catch (err) {
                console.error('Failed to log activity:', err);
                error(t('errors.unknownError', 'An error occurred'), t('activeSession.activityLogFailed', 'Failed to log activity.'));
                return;
            }
        }
        success(t('activeSession.activityLogged'), t('activeSession.activityRecorded'));
    };

    const handleAddPhoto = async () => {
        if (DEMO_MODE) {
            success(t('activeSession.photoAdded'), t('activeSession.photoUploaded'));
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !sessionId) return;
        try {
            const photoUrl = await storageService.uploadActivityPhoto(sessionId, file);
            await activityService.logActivity({
                sessionId,
                type: 'photo',
                description: 'Photo uploaded',
                mediaUrl: photoUrl,
            });
            success(t('activeSession.photoAdded'), t('activeSession.photoUploaded'));
        } catch (err) {
            console.error('Failed to upload photo:', err);
            error(t('activeSession.uploadFailed'), t('activeSession.uploadFailedDesc'));
        }
        e.target.value = '';
    };

    const logSnack = async () => {
        if (!DEMO_MODE && sessionId) {
            try {
                await activityService.logActivity({
                    sessionId,
                    type: 'meal',
                    description: 'Snack served',
                });
            } catch (err) {
                console.error('Failed to log snack:', err);
                error(t('errors.unknownError', 'An error occurred'), t('activeSession.snackLogFailed', 'Failed to log snack.'));
                return;
            }
        }
        success(t('activeSession.snackLogged'), t('activeSession.snackRecorded'));
    };

    const completeSession = async () => {
        if (DEMO_MODE) {
            success(t('activeSession.sessionComplete'), t('activeSession.sessionCompletedDesc'));
            navigate('/sitter');
            return;
        }
        if (!sessionId) return;
        try {
            await sessionService.endSession(sessionId);
            // Also update booking status if we have bookingId info
            await bookingService.updateBookingStatus(sessionId, 'completed');
            success(t('activeSession.sessionComplete'), t('activeSession.sessionCompletedDesc'));
            navigate('/sitter');
        } catch (err) {
            console.error('Failed to complete session:', err);
            error(t('common.error'), t('activeSession.sessionCompleteFailed'));
        }
    };

    return (
        <div className="active-session animate-fade-in">
            {/* Status Banner */}
            <div className="active-banner" role="status" aria-label={`Session active, elapsed time: ${sessionInfo.elapsedTime}`}>
                <div className="banner-left">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span className="banner-text">{t('activeSession.title')}</span>
                </div>
                <span className="banner-time" aria-live="polite">{sessionInfo.elapsedTime}</span>
            </div>

            {/* Session Info */}
            <Card>
                <CardBody>
                    <div className="info-grid">
                        <div><span className="label">{t('activeSession.room')}</span><span className="value">{sessionInfo.room}</span></div>
                        <div><span className="label">{t('activeSession.children')}</span><span className="value">{sessionInfo.children}</span></div>
                        <div><span className="label">{t('activeSession.parentLabel')}</span><span className="value">{sessionInfo.parent}</span></div>
                        <div><span className="label">{t('activeSession.endTime')}</span><span className="value">{sessionInfo.endTime}</span></div>
                    </div>
                </CardBody>
            </Card>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <Button variant="primary" onClick={logActivity}><ClipboardEdit size={16} strokeWidth={1.75} /> {t('activeSession.logActivity')}</Button>
                <Button variant="secondary" onClick={handleAddPhoto}><Camera size={16} strokeWidth={1.75} /> {t('activeSession.addPhoto')}</Button>
                <Button variant="secondary" onClick={logSnack}><Apple size={16} strokeWidth={1.75} /> {t('activeSession.logSnack')}</Button>
                <Button variant="danger" onClick={() => setShowReportIssue(true)}><AlertTriangle size={16} strokeWidth={1.75} /> {t('activeSession.reportIssue')}</Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelected}
                    aria-label={t('activeSession.uploadPhoto')}
                />
            </div>

            {/* Checklist */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('activeSession.careChecklist')}</h3>
                    <div className="checklist">
                        {checklist.map((item) => (
                            <label key={item.id} className="check-item">
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleChecklistItem(item.id)}
                                />
                                <span className={item.completed ? 'completed' : ''}>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* End Session */}
            <Button variant="gold" fullWidth onClick={completeSession}>
                {t('activeSession.completeSession')}
            </Button>

            {/* Report Issue Modal */}
            <Modal
                isOpen={showReportIssue}
                onClose={() => setShowReportIssue(false)}
                title={t('activeSession.reportIssueTitle')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowReportIssue(false)}>{t('common.cancel')}</Button>
                        <Button variant="danger" onClick={handleReportIssue}>{t('activeSession.submitReport')}</Button>
                    </>
                }
            >
                <div className="modal-form-stack">
                    <Input
                        label={t('activeSession.description')}
                        value={issueForm.description}
                        onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                        placeholder={t('activeSession.describeIssue')}
                    />
                    <Select
                        label={t('safety.severity')}
                        value={issueForm.severity}
                        onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                        options={[
                            { value: 'low', label: t('safety.low') },
                            { value: 'medium', label: t('safety.medium') },
                            { value: 'high', label: t('safety.high') },
                            { value: 'critical', label: t('safety.critical') },
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
}
