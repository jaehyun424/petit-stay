// ============================================
// Petit Stay - Weekly Schedule Grid Component
// ============================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WeeklyAvailability, TimeSlot } from '../../types';
import '../../styles/components/weekly-schedule.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABEL_KEYS: Record<string, string> = {
    monday: 'schedule.mon',
    tuesday: 'schedule.tue',
    wednesday: 'schedule.wed',
    thursday: 'schedule.thu',
    friday: 'schedule.fri',
    saturday: 'schedule.sat',
    sunday: 'schedule.sun',
};

interface WeeklyScheduleGridProps {
    availability: WeeklyAvailability;
    onChange: (availability: WeeklyAvailability) => void;
}

export function WeeklyScheduleGrid({ availability, onChange }: WeeklyScheduleGridProps) {
    const { t } = useTranslation();

    const updateSlot = (day: typeof DAYS[number], field: 'start' | 'end', value: string) => {
        const slots = availability[day];
        const slot: TimeSlot = slots[0] || { start: '09:00', end: '18:00' };
        const updated = { ...slot, [field]: value };
        onChange({ ...availability, [day]: [updated] });
    };

    return (
        <div>
            <div className="schedule-header">
                <span>{t('schedule.day')}</span>
                <span>{t('schedule.start')}</span>
                <span>{t('schedule.end')}</span>
            </div>
            <div className="weekly-schedule-grid">
                {DAYS.map((day) => {
                    const slot = availability[day]?.[0] || { start: '', end: '' };
                    return (
                        <React.Fragment key={day}>
                            <span className="day-label">{t(DAY_LABEL_KEYS[day])}</span>
                            <input
                                type="time"
                                className="time-input"
                                value={slot.start}
                                onChange={(e) => updateSlot(day, 'start', e.target.value)}
                            />
                            <input
                                type="time"
                                className="time-input"
                                value={slot.end}
                                onChange={(e) => updateSlot(day, 'end', e.target.value)}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="schedule-toggles">
                <label className="schedule-toggle-item">
                    <input
                        type="checkbox"
                        checked={availability.nightShift}
                        onChange={(e) => onChange({ ...availability, nightShift: e.target.checked })}
                    />
                    <span>{t('profile.nightShift')}</span>
                </label>
                <label className="schedule-toggle-item">
                    <input
                        type="checkbox"
                        checked={availability.holidayAvailable}
                        onChange={(e) => onChange({ ...availability, holidayAvailable: e.target.checked })}
                    />
                    <span>{t('profile.holidayAvailable')}</span>
                </label>
            </div>
        </div>
    );
}
