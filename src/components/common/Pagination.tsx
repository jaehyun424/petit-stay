// ============================================
// Petit Stay - Pagination Component
// ============================================

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const Pagination = memo(function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) pages.push('ellipsis');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <nav className={`pagination ${className}`} aria-label={t('aria.pagination')}>
            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label={t('aria.previousPage')}
            >
                ‹
            </button>

            {getVisiblePages().map((page, idx) =>
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                ) : (
                    <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'pagination-active' : ''}`}
                        onClick={() => onPageChange(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label={t('aria.nextPage')}
            >
                ›
            </button>
        </nav>
    );
});

export function usePagination<T>(items: T[], pageSize: number = 10) {
    const totalPages = Math.ceil(items.length / pageSize);

    const getPageItems = (page: number) => {
        const start = (page - 1) * pageSize;
        return items.slice(start, start + pageSize);
    };

    return { totalPages, getPageItems };
}
