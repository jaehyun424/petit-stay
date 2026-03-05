// Sitter Active Session Page
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ClipboardEdit, Camera, Apple, AlertTriangle, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveSession } from '../../hooks/useSessions';
import ErrorBanner from '../../components/common/ErrorBanner';
import { DEMO_MODE } from '../../hooks/useDemo';
import { activityService, sessionService, bookingService } from '../../services/firestore';
import { storageService } from '../../services/storage';
import '../../styles/pages/sitter-active-session.css';

function useElapsedTimer() {
    const [elapsed, setElapsed] = useState({ h: 2, m: 15, display: '2h 15m' });
    const startRef = useRef(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000); // 2h 15m ago for demo

    useEffect(() => {
        const update = () => {
            const diff = Date.now() - startRef.current;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setElapsed({ h, m, display: `${h}h ${m}m` });
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, []);

    return elapsed;
}

interface TimelineEntry {
    id: string;
    time: string;
    type: 'activity' | 'photo' | 'snack' | 'checklist';
    description: string;
}

const DEMO_TIMELINE: TimelineEntry[] = [
    { id: '1', time: '14:00', type: 'checklist', description: 'Session started, room safety check completed' },
    { id: '2', time: '14:15', type: 'activity', description: 'Playing with building blocks' },
    { id: '3', time: '14:45', type: 'snack', description: 'Apple slices and milk served' },
    { id: '4', time: '15:30', type: 'photo', description: 'Photo of art activity uploaded' },
    { id: '5', time: '16:00', type: 'activity', description: 'Reading storybooks together' },
];

export default function ActiveSession() {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { sessionInfo, checklist, toggleChecklistItem, sessionId, error: sessionError, retry: retrySession } = useActiveSession(user?.id);
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
    const [timeline] = useState<TimelineEntry[]>(DEMO_TIMELINE);

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

    const getTimelineIcon = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'activity': return <ClipboardEdit size={14} strokeWidth={1.75} />;
            case 'photo': return <Camera size={14} strokeWidth={1.75} />;
            case 'snack': return <Apple size={14} strokeWidth={1.75} />;
            case 'checklist': return <CheckCircle2 size={14} strokeWidth={1.75} />;
        }
    };

    return (
        <div className="active-session animate-fade-in">
            {sessionError && <ErrorBanner error={sessionError} onRetry={retrySession} />}

            {/* Status Banner with Timer */}
            <div className="active-banner" role="status" aria-label={t('aria.sessionActive', { time: elapsed.display })}>
                <div className="banner-left">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span className="banner-text">{t('activeSession.title')}</span>
                </div>
                <div className="banner-timer">
                    <Clock size={16} strokeWidth={1.75} />
                    <span className="banner-time" aria-live="polite">{elapsed.display}</span>
                </div>
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

            {/* Emergency Report - prominent */}
            <button className="emergency-report-btn" onClick={() => setShowReportIssue(true)}>
                <Shield size={18} strokeWidth={2} />
                <span>{t('activeSession.reportIssue')}</span>
                <AlertTriangle size={14} strokeWidth={2} />
            </button>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => setShowActivityModal(true)}>
                    <span className="quick-action-icon"><ClipboardEdit size={20} strokeWidth={1.75} /></span>
                    <span className="quick-action-label">{t('activeSession.logActivity')}</span>
                </button>
                <button className="quick-action-card" onClick={handleAddPhoto}>
                    <span className="quick-action-icon"><Camera size={20} strokeWidth={1.75} /></span>
                    <span className="quick-action-label">{t('activeSession.addPhoto')}</span>
                </button>
                <button className="quick-action-card" onClick={() => setShowSnackModal(true)}>
                    <span className="quick-action-icon"><Apple size={20} strokeWidth={1.75} /></span>
                    <span className="quick-action-label">{t('activeSession.logSnack')}</span>
                </button>
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
                    <div className="checklist-header">
                        <h3 className="section-title">{t('activeSession.careChecklist')}</h3>
                        <span className="checklist-progress-label">{completedCount}/{checklist.length}</span>
                    </div>
                    <div className="checklist-progress-track">
                        <motion.div
                            className="checklist-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                    <div className="checklist">
                        {checklist.map((item) => (
                            <label key={item.id} className={`check-item ${item.completed ? 'check-item--done' : ''}`}>
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

            {/* Activity Timeline */}
            <Card>
                <CardBody>
                    <h3 className="section-title">{t('activeSession.activityTimeline', 'Activity Timeline')}</h3>
                    <div className="timeline">
                        {timeline.map((entry, i) => (
                            <div key={entry.id} className={`timeline-item timeline-item--${entry.type}`}>
                                <div className="timeline-line-container">
                                    <div className="timeline-dot">
                                        {getTimelineIcon(entry.type)}
                                    </div>
                                    {i < timeline.length - 1 && <div className="timeline-line" />}
                                </div>
                                <div className="timeline-content">
                                    <span className="timeline-time">{entry.time}</span>
                                    <span className="timeline-desc">{entry.description}</span>
                                </div>
                            </div>
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
                        <div><span className="label">{t('common.time')}</span><span className="value">{elapsed.display}</span></div>
                        <div><span className="label">{t('activeSession.careChecklist')}</span><span className="value">{completedCount}/{checklist.length}</span></div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
