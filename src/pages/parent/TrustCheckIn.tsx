import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Phone, PenTool, ClipboardCheck, Check, Info, AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SignaturePad } from '../../components/common/SignaturePad';
import type { SignaturePadRef } from '../../components/common/SignaturePad';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_MODE } from '../../hooks/useDemo';
import { storageService } from '../../services/storage';
import { bookingService, sessionService } from '../../services/firestore';
import '../../styles/pages/parent-trust-checkin.css';

const STEP_ICONS = [Shield, Phone, ClipboardCheck, PenTool] as const;

const easing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 40 : -40,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: easing },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -40 : 40,
        opacity: 0,
        transition: { duration: 0.2 },
    }),
};

export default function TrustCheckIn() {
    const navigate = useNavigate();
    const { bookingId } = useParams<{ bookingId: string }>();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { success, error } = useToast();
    const signatureRef = useRef<SignaturePadRef>(null);
    const stepHeadingRef = useRef<HTMLHeadingElement>(null);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const totalSteps = 4;

    // Focus the step heading when step changes
    useEffect(() => {
        stepHeadingRef.current?.focus();
    }, [step]);

    const userName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || 'Parent';
    const userPhone = user?.profile?.phone || '';

    const [formData, setFormData] = useState({
        // Step 1: Medical
        allergies: '',
        medications: '',
        specialConditions: '',
        // Step 2: Emergency contacts
        emergencyName: userName,
        emergencyPhone: userPhone,
        emergencyRelation: 'parent',
        secondaryName: '',
        secondaryPhone: '',
        secondaryRelation: '',
        // Step 3: Safety consent checklist
        roomWindowsSecured: false,
        roomBalconyLocked: false,
        roomHazardsRemoved: false,
        roomEmergencyExitKnown: false,
        consentFirstAid: false,
        consentNoContagious: false,
        consentEmergencyTransport: false,
        // Step 4: Signature
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const stepLabels = [
        t('trustCheckin.step1Label'),
        t('trustCheckin.step2Label'),
        t('trustCheckin.step3Label'),
        t('trustCheckin.step4Label'),
    ];

    const validateStep = (): boolean => {
        if (step === 1) {
            // Allergies can be empty (means none)
            return true;
        }
        if (step === 2) {
            if (!formData.emergencyName.trim() || !formData.emergencyPhone.trim()) {
                error(t('trustCheckin.actionRequired'), t('trustCheckin.fillAllFields'));
                return false;
            }
        }
        if (step === 3) {
            const allSafety = formData.roomWindowsSecured && formData.roomBalconyLocked &&
                formData.roomHazardsRemoved && formData.roomEmergencyExitKnown;
            const allConsent = formData.consentFirstAid && formData.consentNoContagious && formData.consentEmergencyTransport;
            if (!allSafety || !allConsent) {
                error(t('trustCheckin.actionRequired'), t('trustCheckin.acceptProtocols'));
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        setDirection(1);
        setStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setDirection(-1);
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (signatureRef.current?.isEmpty()) {
            error(t('trustCheckin.signatureRequired'), t('trustCheckin.signToAcknowledge'));
            return;
        }

        setIsSubmitting(true);
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                const signatureDataUrl = signatureRef.current?.toDataURL() || '';

                // Upload signature
                let signatureUrl = '';
                if (bookingId && signatureDataUrl) {
                    signatureUrl = await storageService.uploadSignature(bookingId, 'parent', signatureDataUrl);
                }

                // Update booking with trust protocol data
                if (bookingId) {
                    await bookingService.updateBooking(bookingId, {
                        trustProtocol: {
                            safeWord: '',
                            checkIn: {
                                timestamp: new Date(),
                                sitterVerified: true,
                                parentVerified: true,
                                roomSafetyChecked: true,
                                childConditionNoted: true,
                                emergencyConsentSigned: true,
                                signatures: {
                                    parent: signatureUrl,
                                    sitter: '',
                                },
                            },
                        },
                        status: 'in_progress',
                    });

                    // Start care session
                    await sessionService.startSession({
                        bookingId,
                        hotelId: '',
                        sitterId: '',
                        parentId: user?.id || '',
                        status: 'active',
                        timeline: [{
                            id: `evt_${Date.now()}`,
                            type: 'check_in',
                            timestamp: new Date(),
                            description: 'Trust check-in completed',
                            isPrivate: false,
                        }],
                        checklist: {
                            roomSafety: {
                                windowsSecured: formData.roomWindowsSecured,
                                balconyLocked: formData.roomBalconyLocked,
                                hazardsRemoved: formData.roomHazardsRemoved,
                                emergencyExitKnown: formData.roomEmergencyExitKnown,
                            },
                            childInfo: { allergiesConfirmed: true, medicationNoted: true, sleepScheduleNoted: false },
                            supplies: { diapersProvided: false, snacksProvided: false, toysAvailable: false, emergencyKitReady: false },
                        },
                        emergencyLog: [],
                        actualTimes: { checkInAt: new Date(), startedAt: new Date() },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }

            success(t('trustCheckin.checkInComplete'), t('trustCheckin.sessionStarted'));
            navigate('/parent');
        } catch {
            error(t('trustCheckin.checkInFailed'), t('trustCheckin.pleaseRetry'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1_Medical = () => (
        <div className="step-content">
            <h2 className="section-title" ref={stepHeadingRef} tabIndex={-1}>{t('trustCheckin.medicalWellbeing')}</h2>
            <p className="section-subtitle">{t('trustCheckin.confirmHealthStatus')}</p>

            <div className="step-fields">
                <Input
                    label={t('trustCheckin.allergiesLabel')}
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder={t('trustCheckin.allergiesPlaceholder')}
                    hint={t('trustCheckin.allergiesHint')}
                />
                <Input
                    label={t('trustCheckin.currentMedications')}
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    placeholder={t('trustCheckin.medicationsPlaceholder')}
                />
                <Input
                    label={t('trustCheckin.specialConditions')}
                    value={formData.specialConditions}
                    onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
                    placeholder={t('trustCheckin.specialConditionsPlaceholder')}
                    hint={t('trustCheckin.specialConditionsHint')}
                />
            </div>
        </div>
    );

    const renderStep2_Emergency = () => (
        <div className="step-content">
            <h2 className="section-title" ref={stepHeadingRef} tabIndex={-1}>{t('trustCheckin.emergencyProtocol')}</h2>
            <p className="section-subtitle">{t('trustCheckin.whoToContactFirst')}</p>

            <div className="step-fields">
                <h3 className="checkin-subheading">{t('trustCheckin.primaryContact')}</h3>
                <Input
                    label={t('trustCheckin.emergencyContactName')}
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                />
                <Input
                    label={t('trustCheckin.emergencyPhone')}
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
                <Input
                    label={t('trustCheckin.relationship')}
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    placeholder={t('trustCheckin.relationshipPlaceholder')}
                />

                <h3 className="checkin-subheading">{t('trustCheckin.secondaryContact')}</h3>
                <Input
                    label={t('trustCheckin.emergencyContactName')}
                    value={formData.secondaryName}
                    onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                    placeholder={t('trustCheckin.secondaryPlaceholder')}
                />
                <Input
                    label={t('trustCheckin.emergencyPhone')}
                    value={formData.secondaryPhone}
                    onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                />
                <Input
                    label={t('trustCheckin.relationship')}
                    value={formData.secondaryRelation}
                    onChange={(e) => setFormData({ ...formData, secondaryRelation: e.target.value })}
                    placeholder={t('trustCheckin.relationshipPlaceholder')}
                />

                <div className="info-box">
                    <span className="info-icon"><Info size={16} strokeWidth={1.75} /></span>
                    <p>{t('trustCheckin.emsInfo')}</p>
                </div>
            </div>
        </div>
    );

    const renderStep3_Safety = () => {
        const safetyItems = [
            { key: 'roomWindowsSecured' as const, label: t('trustCheckin.windowsSecured') },
            { key: 'roomBalconyLocked' as const, label: t('trustCheckin.balconyLocked') },
            { key: 'roomHazardsRemoved' as const, label: t('trustCheckin.hazardsRemoved') },
            { key: 'roomEmergencyExitKnown' as const, label: t('trustCheckin.emergencyExitKnown') },
        ];

        const consentItems = [
            { key: 'consentFirstAid' as const, label: t('trustCheckin.firstAidConsent') },
            { key: 'consentNoContagious' as const, label: t('trustCheckin.noContagiousConsent') },
            { key: 'consentEmergencyTransport' as const, label: t('trustCheckin.emergencyTransportConsent') },
        ];

        return (
            <div className="step-content">
                <h2 className="section-title" ref={stepHeadingRef} tabIndex={-1}>{t('trustCheckin.safetyProtocols')}</h2>
                <p className="section-subtitle">{t('trustCheckin.agreedBoundaries')}</p>

                <div className="checkin-section">
                    <h3 className="checkin-subheading">
                        <AlertTriangle size={14} strokeWidth={1.75} />
                        {t('trustCheckin.roomSafetyChecklist')}
                    </h3>
                    <div className="rules-list">
                        {safetyItems.map((item) => (
                            <label key={item.key} className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={formData[item.key]}
                                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                                />
                                <span className="checkbox-text">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="checkin-section">
                    <h3 className="checkin-subheading">
                        <Shield size={14} strokeWidth={1.75} />
                        {t('trustCheckin.careConsent')}
                    </h3>
                    <div className="rules-list">
                        {consentItems.map((item) => (
                            <label key={item.key} className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={formData[item.key]}
                                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                                />
                                <span className="checkbox-text">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderStep4_Signature = () => (
        <div className="step-content">
            <h2 className="section-title" ref={stepHeadingRef} tabIndex={-1}>{t('trustCheckin.signatureConfirmation')}</h2>
            <p className="section-subtitle">{t('trustCheckin.signatureDesc')}</p>

            <div className="signature-summary">
                <p>{t('trustCheckin.signatureSummary')}</p>
            </div>

            <div className="signature-section">
                <label className="signature-label">{t('trustCheckin.parentSignature')}</label>
                <SignaturePad ref={signatureRef} />
                <button
                    className="clear-signature-btn"
                    onClick={() => signatureRef.current?.clear()}
                >
                    {t('trustCheckin.clearSignature')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="trust-checkin-page">
            <div className="trust-checkin-container">
                <div className="trust-checkin-header">
                    <h1 className="trust-checkin-title">{t('trustCheckin.careHandover')}</h1>
                    <div className="trust-checkin-progress-bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
                        <div className="trust-checkin-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
                    </div>
                    <div className="trust-checkin-steps">
                        {[1, 2, 3, 4].map(i => {
                            const Icon = STEP_ICONS[i - 1];
                            const completed = step > i;
                            const active = step === i;
                            return (
                                <div
                                    key={i}
                                    className={`step-indicator-icon ${completed ? 'step-completed' : active ? 'step-active' : 'step-pending'}`}
                                >
                                    <span className="step-icon-circle">
                                        {completed
                                            ? <Check size={16} strokeWidth={2.5} />
                                            : <Icon size={16} strokeWidth={1.75} />}
                                    </span>
                                    <span className="step-icon-label">{stepLabels[i - 1]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Card className="checkin-card" padding="lg">
                    <CardBody>
                        <AnimatePresence mode="wait" custom={direction}>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                >
                                    {renderStep1_Medical()}
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                >
                                    {renderStep2_Emergency()}
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                >
                                    {renderStep3_Safety()}
                                </motion.div>
                            )}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                >
                                    {renderStep4_Signature()}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="checkin-card-footer">
                            {step > 1 ? (
                                <Button variant="ghost" onClick={handleBack}>{t('common.back')}</Button>
                            ) : (
                                <div /> /* Spacer */
                            )}

                            {step < totalSteps ? (
                                <Button onClick={handleNext} variant="gold">
                                    {t('trustCheckin.nextStep')}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    variant="gold"
                                    isLoading={isSubmitting}
                                >
                                    {t('trustCheckin.confirmHandover')}
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
