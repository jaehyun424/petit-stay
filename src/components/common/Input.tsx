// ============================================
// Petit Stay - Input Component
// ============================================

import React, { forwardRef, useId } from 'react';

// ----------------------------------------
// Types
// ----------------------------------------
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    hint?: string;
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    rightAddon?: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

// ----------------------------------------
// Input Component
// ----------------------------------------
export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    hint,
    size = 'md',
    icon,
    iconPosition = 'left',
    rightAddon,
    className = '',
    id,
    ...props
}, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasIcon = !!icon;

    const inputClasses = [
        'form-input',
        size === 'sm' ? 'form-input-sm' : size === 'lg' ? 'form-input-lg' : '',
        error ? 'form-input-error' : '',
        hasIcon ? `form-input-icon-${iconPosition}` : '',
        rightAddon ? 'form-input-has-addon' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                </label>
            )}
            <div className="form-input-wrapper">
                {icon && iconPosition === 'left' && (
                    <span className="form-input-icon form-input-icon-left">{icon}</span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={inputClasses}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <span className="form-input-icon form-input-icon-right">{icon}</span>
                )}
                {rightAddon && (
                    <span className="form-input-addon-right">{rightAddon}</span>
                )}
            </div>
            {error && <span className="form-error">{error}</span>}
            {hint && !error && <span className="form-hint">{hint}</span>}
        </div>
    );
});

Input.displayName = 'Input';

// ----------------------------------------
// Textarea Component
// ----------------------------------------
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    hint,
    className = '',
    id,
    rows = 4,
    ...props
}, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const textareaClasses = [
        'form-textarea',
        error ? 'form-input-error' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={textareaId} className="form-label">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                className={textareaClasses}
                rows={rows}
                {...props}
            />
            {error && <span className="form-error">{error}</span>}
            {hint && !error && <span className="form-hint">{hint}</span>}
        </div>
    );
});

Textarea.displayName = 'Textarea';

// ----------------------------------------
// Select Component
// ----------------------------------------
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    hint,
    options,
    placeholder,
    className = '',
    id,
    ...props
}, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const selectClasses = [
        'form-select',
        error ? 'form-input-error' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={selectId} className="form-label">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                className={selectClasses}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="form-error">{error}</span>}
            {hint && !error && <span className="form-hint">{hint}</span>}
        </div>
    );
});

Select.displayName = 'Select';