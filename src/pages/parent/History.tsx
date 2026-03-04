// Parent History Page

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { Building2, User, Star, ClipboardList } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton, SkeletonText } from '../../components/common/Skeleton';
import { Pagination, usePagination } from '../../components/common/Pagination';
import { ReviewForm } from '../../components/common/ReviewForm';
import { useAuth } from '../../contexts/AuthContext';
import { useParentBookings } from '../../hooks/useBookings';
import { useReviews } from '../../hooks/useReviews';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import '../../styles/pages/parent-history.css';

export default function History() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { history, isLoading } = useParentBookings(user?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const { totalPages, getPageItems } = usePagination(history, 10);
    const paginatedHistory = getPageItems(currentPage);
    const { submitReview } = useReviews();
    const toast = useToast();
    const [reviewTarget, setReviewTarget] = useState<{ bookingId: string; sitterName: string; date: string } | null>(null);

    if (isLoading) {
        return (
            <div className="history-page animate-fade-in">
                <Skeleton width="50%" height="2rem" />
                <Skeleton width="30%" height="1rem" className="mt-2" />
                <div className="history-list mt-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card history-skeleton-card">
                            <div className="history-skeleton-row">
                                <div className="history-skeleton-fill">
                                    <Skeleton width="45%" height="1rem" />
                                    <Skeleton width="30%" height="0.75rem" className="mt-2" />
                                </div>
                                <Skeleton width="80px" height="1.5rem" borderRadius="var(--radius-full)" />
                            </div>
                            <SkeletonText lines={2} className="mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="history-page animate-fade-in">
            <h1 className="page-title">{t('parent.bookingHistory')}</h1>
            <p className="page-subtitle">{history.length} {t('sitter.completedSessions').toLowerCase()}</p>

            {history.length > 0 ? (
                <motion.div className="history-list" initial="hidden" animate="show" variants={staggerContainer}>
                    {paginatedHistory.map((item) => (
                        <motion.div key={item.id} variants={staggerItem}>
                        <Card className="history-item">
                            <CardBody>
                                <div className="history-header">
                                    <div>
                                        <span className="history-date">{item.date}</span>
                                        <span className="history-time">{item.time}</span>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="history-details">
                                    <span><Building2 size={14} strokeWidth={1.75} /> {item.hotel}</span>
                                    <span><User size={14} strokeWidth={1.75} /> {item.sitter}</span>
                                </div>
                                <div className="history-footer">
                                    <div className="history-footer-left">
                                        {item.rating > 0 ? (
                                            <span className="history-rating" aria-label={`${item.rating} star rating`}>{Array.from({ length: item.rating }, (_, i) => <Star key={i} size={14} strokeWidth={1.75} fill="currentColor" />)}</span>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReviewTarget({ bookingId: item.id, sitterName: item.sitter, date: item.date });
                                                }}
                                            >
                                                {t('profile.leaveReview')}
                                            </Button>
                                        )}
                                    </div>
                                    <span className="history-amount">{formatCurrency(item.amount)}</span>
                                </div>
                            </CardBody>
                        </Card>
                        </motion.div>
                    ))}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </motion.div>
            ) : (
                <EmptyState
                    icon={<ClipboardList size={20} strokeWidth={1.75} />}
                    title={t('parent.noSessionHistory', 'No session history yet')}
                    description={t('parent.noSessionHistoryDesc', 'Your past bookings and sessions will appear here once completed.')}
                />
            )}

            <ReviewForm
                isOpen={!!reviewTarget}
                onClose={() => setReviewTarget(null)}
                bookingInfo={reviewTarget || undefined}
                onSubmit={async (review) => {
                    if (!reviewTarget) return;
                    await submitReview({
                        bookingId: reviewTarget.bookingId,
                        sitterId: '',
                        ...review,
                    });
                    toast.success(t('parent.reviewSubmitted'), t('parent.thankYouFeedback'));
                }}
            />
        </div>
    );
}
