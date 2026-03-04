// Sitter Active Session Page
import { useRef, useState, useEffect, useCallback } from 'react';
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

function useElapsedTimer() {
    const [elapsed, setElapsed] = useState('0h 0m');
    const startRef = useRef(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000); // 2h 15m ago for demo

    useEffect(() => {
        const update = () => {
            const diff = Date.now() - startRef.current;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setElapsed(`${h}h ${m}m`);
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, []);

    return elapsed;
}

export default function ActiveSession() {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { sessionInfo, checklist, toggleChecklistItem, sessionId } = useActiveSession(user?.id);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const elapsed = useElapsedTimer();

    // Modal states
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityNote, setActivityNote] = useState('');
    const [showSnackModal, setShowSnackModal] = useState(false);
    const [snackNote, setSnackNote] = useState('');
    const [showReportIssue, setShowReportIssue] = useState(false);
    const [issueForm, setIssueForm] = useState({ description: '', severity: 'low' });
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

    const completedCount = checklist.filter((item) => item.completed).length;
    const progressPercent = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

    const handleReportIssue = () => {
        success(t('activeSession.issueReported'), t('activeSession.issueReportedDesc', { severity: issueForm.severity }));
        setShowReportIssue(false);
        setIssueForm({ description: '', severity: 'low' });
    };

    const logActivity = useCallback(async () => {
        if (!DEMO_MODE && sessionId) {
            try {
                await activityService.logActivity({
                    sessionId,
                    type: 'activity',
                    description: activityNote || t('activeSession.activityLogDescription'),
                });
            } catch (err) {
                console.error('Failed to log activity:', err);
                error(t('errors.unknownError', 'An error occurred'), t('activeSession.activityLogFailed', 'Failed to log activity.'));
                return;
            }
        }
        success(t('activeSession.activityLogged'), t('activeSession.activityRecorded'));
        setShowActivityModal(false);
        setActivityNote('');
    }, [sessionId, activityNote, t, success, error]);

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
                description: t('activeSession.photoLogDescription'),
                mediaUrl: photoUrl,
            });
            success(t('activeSession.photoAdded'), t('activeSession.photoUploaded'));
        } catch (err) {
            console.error('Failed to upload photo:', err);
            error(t('activeSession.uploadFailed'), t('activeSession.uploadFailedDesc'));
        }
        e.target.value = '';
    };

    const logSnack = useCallback(async () => {
        if (!DEMO_MODE && sessionId) {
            try {
                await activityService.logActivity({
                    sessionId,
                    type: 'meal',
                    description: snackNote || t('activeSession.snackLogDescription'),
                });
            } catch (err) {
                console.error('Failed to log snack:', err);
                error(t('errors.unknownError', 'An error occurred'), t('activeSession.snackLogFailed', 'Failed to log snack.'));
                return;
            }
        }
        success(t('activeSession.snackLogged'), t('activeSession.snackRecorded'));
        setShowSnackModal(false);
        setSnackNote('');
    }, [sessionId, snackNote, t, success, error]);

    const completeSession = async () => {
        if (DEMO_MODE) {
            success(t('activeSession.sessionComplete'), t('activeSession.sessionCompletedDesc'));
            navigate('/sitter');
            return;
        }
        if (!sessionId) return;
        try {
            await sessionService.endSession(sessionId);
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
            <div className="active-banner" role="status" aria-label={t('aria.sessionActive', { time: elapsed })}>
                <div className="banner-left">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span className="banner-text">{t('activeSession.title')}</span>
                </div>
                <span className="banner-time" aria-live="polite">{elapsed}</span>
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
                <Button variant="primary" onClick={() => setShowActivityModal(true)}><ClipboardEdit size={16} strokeWidth={1.75} /> {t('activeSession.logActivity')}</Button>
                <Button variant="secondary" onClick={handleAddPhoto}><Camera size={16} strokeWidth={1.75} /> {t('activeSession.addPhoto')}</Button>
                <Button variant="secondary" onClick={() => setShowSnackModal(true)}><Apple size={16} strokeWidth={1.75} /> {t('activeSession.logSnack')}</Button>
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

            {/* Checklist with Progress Bar */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('activeSession.careChecklist')}</h3>
                    <div className="checklist-progress-track">
                        <div
                            className="checklist-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="checklist-progress-label">{completedCount}/{checklist.length}</span>
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
            <Button variant="gold" fullWidth onClick={() => setShowCompleteConfirm(true)}>
                {t('activeSession.completeSession')}
            </Button>

            {/* Activity Log Modal */}
            <Modal
                isOpen={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                title={t('activeSession.logActivity')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowActivityModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" onClick={logActivity}>{t('common.submit')}</Button>
                    </>
                }
            >
                <div className="modal-form-stack">
                    <Input
                        label={t('activeSession.description')}
                        value={activityNote}
                        onChange={(e) => setActivityNote(e.target.value)}
                        placeholder={t('activeSession.activityPlaceholder', 'What is the child doing?')}
                    />
                </div>
            </Modal>

            {/* Snack Log Modal */}
            <Modal
                isOpen={showSnackModal}
                onClose={() => setShowSnackModal(false)}
                title={t('activeSession.logSnack')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowSnackModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" onClick={logSnack}>{t('common.submit')}</Button>
                    </>
                }
            >
                <div className="modal-form-stack">
                    <Input
                        label={t('activeSession.description')}
                        value={snackNote}
                        onChange={(e) => setSnackNote(e.target.value)}
                        placeholder={t('activeSession.snackPlaceholder', 'What snack was served?')}
                    />
                </div>
            </Modal>

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

            {/* Complete Session Confirm */}
            <Modal
                isOpen={showCompleteConfirm}
                onClose={() => setShowCompleteConfirm(false)}
                title={t('activeSession.completeSession')}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCompleteConfirm(false)}>{t('common.cancel')}</Button>
                        <Button variant="gold" onClick={completeSession}>{t('common.confirm')}</Button>
                    </>
                }
            >
                <div className="complete-summary">
                    <p>{t('activeSession.confirmCompleteDesc', 'Are you sure you want to end this session?')}</p>
                    <div className="complete-summary-stats">
                        <div><span className="label">{t('activeSession.room')}</span><span className="value">{sessionInfo.room}</span></div>
                        <div><span className="label">{t('activeSession.children')}</span><span className="value">{sessionInfo.children}</span></div>
                        <div><span className="label">{t('common.time')}</span><span className="value">{elapsed}</span></div>
                        <div><span className="label">{t('activeSession.careChecklist')}</span><span className="value">{completedCount}/{checklist.length}</span></div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
