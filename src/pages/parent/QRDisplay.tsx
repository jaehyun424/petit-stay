import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import { BookingQR } from '../../components/common/BookingQR';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useParentBookings } from '../../hooks/useBookings';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';

export default function QRDisplay() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { upcomingBooking, isLoading } = useParentBookings(user?.id);
    const toast = useToast();

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(t('qr.codeCopied'), code);
        } catch {
            toast.error(t('common.error'));
        }
    };

    if (isLoading) {
        return (
            <div className="qr-display-page animate-fade-in">
                <Skeleton width="250px" height="250px" />
                <Skeleton width="200px" height="1.5rem" />
            </div>
        );
    }

    // Find the booking (use upcoming if matching or as fallback)
    const booking = upcomingBooking && (
        !bookingId || upcomingBooking.id === bookingId
    ) ? upcomingBooking : null;

    if (!booking) {
        return (
            <div className="qr-display-page animate-fade-in">
                <div className="qr-empty">
                    <span className="qr-empty-icon">📱</span>
                    <h2>{t('qr.noActiveBooking')}</h2>
                    <p>{t('qr.noBooking')}</p>
                    <Link to="/parent">
                        <Button variant="primary">{t('qr.goBack')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="qr-display-page animate-fade-in">
            <div className="qr-display-card">
                <h2 className="qr-display-title">{t('qr.title')}</h2>
                <p className="qr-display-subtitle">
                    {t('qr.showToHotel')}
                </p>

                <div className="qr-display-qr">
                    <BookingQR
                        bookingId={booking.id}
                        confirmationCode={booking.confirmationCode}
                        parentId={user?.id}
                        hotelId={booking.hotel}
                        size={260}
                    />
                </div>

                <div className="qr-display-details">
                    <div className="qr-detail-row">
                        <span className="qr-detail-label">{t('qr.bookingLabel')}</span>
                        <span className="qr-detail-value qr-detail-copyable">
                            {booking.confirmationCode}
                            <button
                                className="qr-copy-btn"
                                onClick={() => handleCopyCode(booking.confirmationCode)}
                                aria-label={t('qr.copyCode')}
                            >
                                <Copy size={14} strokeWidth={1.75} />
                            </button>
                        </span>
                    </div>
                    <div className="qr-detail-row">
                        <span className="qr-detail-label">{t('qr.hotelLabel')}</span>
                        <span className="qr-detail-value">{booking.hotel}</span>
                    </div>
                    <div className="qr-detail-row">
                        <span className="qr-detail-label">{t('qr.roomLabel')}</span>
                        <span className="qr-detail-value">{booking.room}</span>
                    </div>
                    <div className="qr-detail-row">
                        <span className="qr-detail-label">{t('qr.timeLabel')}</span>
                        <span className="qr-detail-value">{booking.time}</span>
                    </div>
                </div>

                <Link to="/parent" className="qr-back-link">
                    <Button variant="secondary" fullWidth>
                        {t('qr.goBack')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
