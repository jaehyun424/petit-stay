// ============================================
// Petit Stay - DatePicker Component
// ============================================

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    min?: string;
    max?: string;
    error?: string;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    label,
    min,
    max,
    error,
    placeholder,
    className = '',
}: DatePickerProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const resolvedPlaceholder = placeholder ?? t('common.selectDate');

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="date-picker-wrapper">
                <input
                    ref={inputRef}
                    type="date"
                    className="date-picker-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    min={min}
                    max={max}
                    placeholder={resolvedPlaceholder}
                />
                {value && (
                    <span className="date-picker-display">{formatDisplayDate(value)}</span>
                )}
            </div>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
}

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onStartChange: (date: string) => void;
    onEndChange: (date: string) => void;
    label?: string;
    className?: string;
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    label,
    className = '',
}: DateRangePickerProps) {
    const { t } = useTranslation();

    return (
        <div className={`date-range-picker ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="date-range-inputs">
                <DatePicker
                    value={startDate}
                    onChange={onStartChange}
                    max={endDate || undefined}
                    placeholder={t('common.startDate')}
                />
                <span className="date-range-separator">{t('common.to')}</span>
                <DatePicker
                    value={endDate}
                    onChange={onEndChange}
                    min={startDate || undefined}
                    placeholder={t('common.endDate')}
                />
            </div>
        </div>
    );
}

// Period selector for dashboards
interface PeriodSelectorProps {
    value: string;
    onChange: (period: string) => void;
    options?: { value: string; label: string }[];
}

export function PeriodSelector({
    value,
    onChange,
    options,
}: PeriodSelectorProps) {
    const { t } = useTranslation();
    const resolvedOptions = options ?? [
        { value: 'today', label: t('common.today') },
        { value: 'week', label: t('common.thisWeek') },
        { value: 'month', label: t('common.thisMonth') },
    ];
    return (
        <div className="period-selector" role="group" aria-label={t('aria.timePeriod')}>
            {resolvedOptions.map((opt) => (
                <button
                    key={opt.value}
                    className={`period-btn ${value === opt.value ? 'period-active' : ''}`}
                    onClick={() => onChange(opt.value)}
                    aria-pressed={value === opt.value}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
