// ============================================
// Petit Stay - Modal Component (Motion)
// ============================================

import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from './Button';

// ----------------------------------------
// Types
// ----------------------------------------
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
    footer?: React.ReactNode;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

// ----------------------------------------
// Component
// ----------------------------------------
export function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    footer,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className = '',
}: ModalProps) {
    const { t } = useTranslation();

    // Handle escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    const sizeClass = `modal-${size}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={closeOnOverlayClick ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={`modal ${sizeClass} ${className}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                    >
                        {(title || showCloseButton) && (
                            <div className="modal-header">
                                {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
                                {showCloseButton && (
                                    <IconButton
                                        icon={<X size={20} strokeWidth={1.75} />}
                                        onClick={onClose}
                                        aria-label={t('aria.closeModal')}
                                        variant="ghost"
                                    />
                                )}
                            </div>
                        )}
                        <div className="modal-body">{children}</div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ----------------------------------------
// Confirm Modal Helper
// ----------------------------------------
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${variant}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : confirmText}
                    </button>
                </>
            }
        >
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </Modal>
    );
}
