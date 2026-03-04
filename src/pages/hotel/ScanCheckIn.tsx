// ============================================
// Petit Stay - Hotel QR Scan Check-In Page
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, CameraOff, CheckCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Tabs, TabPanel } from '../../components/common/Tabs';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/pages/hotel-scan-checkin.css';

// ----------------------------------------
// Types
// ----------------------------------------
interface QRPayload {
    type: string;
    bookingId: string;
    confirmationCode: string;
    parentId: string;
    hotelId: string;
    timestamp: string;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

// ----------------------------------------
// Component
// ----------------------------------------
export default function ScanCheckIn() {
    const { t } = useTranslation();
    const toast = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number>(0);

    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [scannedData, setScannedData] = useState<QRPayload | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('scan');
    const [manualCode, setManualCode] = useState('');
    const [manualLoading, setManualLoading] = useState(false);
    const [manualCodeError, setManualCodeError] = useState('');

    // ---- Start Camera ----
    const startCamera = useCallback(async () => {
        try {
            setCameraError(null);
            setScanStatus('scanning');
            setScannedData(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 640, height: 480 },
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera access failed:', err);
            setCameraError(t('scan.cameraDenied'));
            setScanStatus('idle');
        }
    }, []);

    // ---- Stop Camera ----
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = 0;
        }
    }, []);

    // ---- QR Scan Loop ----
    useEffect(() => {
        if (scanStatus !== 'scanning') return;

        const scan = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
                animFrameRef.current = requestAnimationFrame(scan);
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
                try {
                    const parsed: QRPayload = JSON.parse(code.data);
                    if (parsed.type === 'petitstay_checkin' && parsed.bookingId) {
                        setScannedData(parsed);
                        setScanStatus('success');
                        stopCamera();
                        toast.success(t('scan.qrScanned'), t('scan.bookingVerifiedMsg', { code: parsed.confirmationCode }));
                        return;
                    }
                } catch {
                    // Not a valid QR — continue scanning
                }
            }

            animFrameRef.current = requestAnimationFrame(scan);
        };

        animFrameRef.current = requestAnimationFrame(scan);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [scanStatus, stopCamera, toast]);

    // ---- Cleanup on unmount ----
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    // ---- Confirm Check-In ----
    const handleConfirmCheckIn = () => {
        if (!scannedData) return;
        toast.success(t('scan.checkInConfirmed'), t('scan.checkInConfirmedMsg', { code: scannedData.confirmationCode }));
        setScanStatus('idle');
        setScannedData(null);
    };

    // ---- Manual Code Lookup ----
    const handleManualLookup = async () => {
        if (!manualCode.trim()) {
            setManualCodeError(t('common.required', 'This field is required'));
            return;
        }
        setManualCodeError('');
        setManualLoading(true);
        try {
            // Simulate lookup (in real mode, would call bookingService.getByConfirmationCode)
            await new Promise((r) => setTimeout(r, 800));
            const fakePayload: QRPayload = {
                type: 'petitstay_checkin',
                bookingId: `booking-${manualCode}`,
                confirmationCode: manualCode.toUpperCase(),
                parentId: 'manual-lookup',
                hotelId: 'grand-hyatt-seoul',
                timestamp: new Date().toISOString(),
            };
            setScannedData(fakePayload);
            setScanStatus('success');
            toast.success(t('scan.qrScanned'), t('scan.bookingVerifiedMsg', { code: fakePayload.confirmationCode }));
        } catch {
            toast.error(t('scan.notFound'), t('scan.noBookingFound'));
        } finally {
            setManualLoading(false);
        }
    };

    // ---- Reset ----
    const handleReset = () => {
        setScanStatus('idle');
        setScannedData(null);
        setCameraError(null);
        setManualCode('');
    };

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="scan-page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('scan.title')}</h1>
                <p className="page-subtitle">{t('scan.subtitle')}</p>
            </div>

            <div className="scan-content">
                {/* Tab Selection */}
                <Tabs
                    tabs={[
                        { id: 'scan', label: t('scan.qrScanner') },
                        { id: 'manual', label: t('scan.manualCode') },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="pills"
                />

                {/* Manual Code Entry */}
                <TabPanel id="manual" activeTab={activeTab}>
                    <Card className="scan-card">
                        <CardHeader>
                            <CardTitle subtitle={t('scan.manualSubtitle')}>
                                {t('scan.manualCheckIn')}
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="manual-entry">
                                <Input
                                    label={t('scan.confirmationCode')}
                                    value={manualCode}
                                    onChange={(e) => { setManualCode(e.target.value); if (manualCodeError) setManualCodeError(''); }}
                                    placeholder={t('scan.codePlaceholder')}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleManualLookup(); }}
                                    error={manualCodeError}
                                />
                                <Button
                                    variant="gold"
                                    fullWidth
                                    onClick={handleManualLookup}
                                    isLoading={manualLoading}
                                    disabled={!manualCode.trim()}
                                >
                                    {t('scan.lookUpBooking')}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </TabPanel>

                {/* Scanner Area */}
                <TabPanel id="scan" activeTab={activeTab}>
                <Card className="scan-card">
                    <CardHeader>
                        <CardTitle subtitle={t('scan.pointCamera')}>
                            {t('scan.scanner')}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {scanStatus === 'idle' && !cameraError && (
                            <div className="scan-idle">
                                <div className="scan-icon">
                                    <QrCode size={48} strokeWidth={1.5} />
                                </div>
                                <p>{t('scan.tapToStart')}</p>
                                <Button variant="gold" onClick={startCamera}>
                                    {t('scan.startScanner')}
                                </Button>
                            </div>
                        )}

                        {cameraError && (
                            <div className="scan-idle scan-error-state">
                                <div className="scan-icon error">
                                    <CameraOff size={48} strokeWidth={1.5} />
                                </div>
                                <p>{cameraError}</p>
                                <Button variant="primary" onClick={startCamera}>
                                    {t('scan.tryAgain')}
                                </Button>
                            </div>
                        )}

                        {scanStatus === 'scanning' && (
                            <div className="scan-active">
                                <div className="scan-video-wrapper">
                                    <video
                                        ref={videoRef}
                                        className="scan-video"
                                        playsInline
                                        muted
                                        aria-label={t('aria.cameraFeed')}
                                    />
                                    <div className="scan-overlay">
                                        <div className="scan-corners" />
                                    </div>
                                </div>
                                <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
                                <Button
                                    variant="secondary"
                                    onClick={() => { stopCamera(); setScanStatus('idle'); }}
                                    fullWidth
                                >
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        )}

                        {scanStatus === 'success' && scannedData && (
                            <div className="scan-result">
                                <div className="scan-success-icon">
                                    <CheckCircle size={48} strokeWidth={2} style={{ color: 'var(--success-500)' }} />
                                </div>
                                <h3>{t('scan.bookingVerified')}</h3>
                                <Badge variant="success" size="sm">{t('scan.validQRCode')}</Badge>
                            </div>
                        )}
                    </CardBody>
                </Card>
                </TabPanel>

                {/* Scanned Data */}
                {scannedData && (
                    <Card className="scan-data-card animate-fade-in-up">
                        <CardHeader>
                            <CardTitle>{t('scan.bookingDetails')}</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="scan-data-grid">
                                <div className="scan-data-item">
                                    <span className="scan-data-label">{t('scan.confirmation')}</span>
                                    <span className="scan-data-value">{scannedData.confirmationCode}</span>
                                </div>
                                <div className="scan-data-item">
                                    <span className="scan-data-label">{t('scan.bookingId')}</span>
                                    <span className="scan-data-value">{scannedData.bookingId}</span>
                                </div>
                                <div className="scan-data-item">
                                    <span className="scan-data-label">{t('scan.hotel')}</span>
                                    <span className="scan-data-value">{scannedData.hotelId || 'N/A'}</span>
                                </div>
                                <div className="scan-data-item">
                                    <span className="scan-data-label">{t('scan.scannedAt')}</span>
                                    <span className="scan-data-value">
                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="scan-actions">
                                <Button variant="secondary" onClick={handleReset}>
                                    {t('scan.scanAnother')}
                                </Button>
                                <Button variant="gold" onClick={handleConfirmCheckIn}>
                                    {t('scan.confirmCheckIn')}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}

