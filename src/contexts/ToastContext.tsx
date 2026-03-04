// ============================================
// Petit Stay - Toast Notification Context
// ============================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

// ----------------------------------------
// Types
// ----------------------------------------
interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

interface ToastProviderProps {
    children: React.ReactNode;
}

// ----------------------------------------
// Constants
// ----------------------------------------
const DEFAULT_DURATION = 5000;

// ----------------------------------------
// Context
// ----------------------------------------
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ----------------------------------------
// Provider
// ----------------------------------------
export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastMessage = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration ?? DEFAULT_DURATION;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ----------------------------------------
// Toast Container Component
// ----------------------------------------
interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" role="status" aria-live="polite">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ----------------------------------------
// Toast Component
// ----------------------------------------
interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
    const icons = {
        success: <Check size={18} strokeWidth={2.5} />,
        error: <X size={18} strokeWidth={2.5} />,
        warning: <AlertTriangle size={18} strokeWidth={2} />,
        info: <Info size={18} strokeWidth={2} />,
    };

    return (
        <div className={`toast toast-${toast.type}`}>
            <div className="toast-icon">{icons[toast.type]}</div>
            <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button
                className="toast-close"
                onClick={() => onRemove(toast.id)}
                aria-label="Close"
            >
                <X size={16} strokeWidth={2} />
            </button>
        </div>
    );
}

// ----------------------------------------
// Hook
// ----------------------------------------
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);

    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
}
