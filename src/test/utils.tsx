import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => {
            // Return the key itself for testing, with interpolations
            if (opts?.count !== undefined) return `${key}(${opts.count})`;
            return key;
        },
        i18n: { changeLanguage: vi.fn(), language: 'en' },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock Firebase services
vi.mock('../services/firebase', () => ({
    auth: null,
    db: null,
    storage: null,
}));

vi.mock('../services/firestore', () => ({
    bookingService: {
        createBooking: vi.fn(),
        updateBooking: vi.fn(),
        getBooking: vi.fn(),
    },
    sessionService: {
        startSession: vi.fn(),
        updateSession: vi.fn(),
    },
    childrenService: {
        getParentChildren: vi.fn(() => Promise.resolve([])),
        addChild: vi.fn(),
    },
    hotelService: {
        getHotel: vi.fn(),
    },
}));

vi.mock('../services/storage', () => ({
    storageService: {
        uploadSignature: vi.fn(() => Promise.resolve('https://example.com/sig.png')),
        uploadPhoto: vi.fn(() => Promise.resolve('https://example.com/photo.png')),
    },
}));

// Mock useDemo
vi.mock('../hooks/common/useDemo', () => ({
    DEMO_MODE: true,
}));

// Mock AuthContext - exportable for per-test override
const defaultMockUser = {
    id: 'demo-parent-1',
    email: 'parent@demo.com',
    role: 'parent' as const,
    profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-123-4567',
        phoneVerified: true,
        preferredLanguage: 'en' as const,
    },
    notifications: { push: true, email: true, sms: true },
    createdAt: new Date(),
    lastLoginAt: new Date(),
};

const mockAuthContext = {
    user: defaultMockUser,
    firebaseUser: null,
    isLoading: false,
    isAuthenticated: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updateUserProfile: vi.fn(),
    demoLogin: vi.fn(),
};

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => mockAuthContext,
    useRequireAuth: () => ({
        user: mockAuthContext.user,
        isLoading: false,
        isAuthenticated: true,
        isAuthorized: true,
    }),
    usePartnerAuth: () => ({
        user: { ...defaultMockUser, role: 'partner', hotelId: 'hotel-grand-hyatt' },
        isLoading: false,
        isAuthenticated: true,
        isAuthorized: true,
    }),
    useParentAuth: () => ({
        user: defaultMockUser,
        isLoading: false,
        isAuthenticated: true,
        isAuthorized: true,
    }),
    useSitterAuth: () => ({
        user: { ...defaultMockUser, role: 'sitter', id: 'demo-sitter-1' },
        isLoading: false,
        isAuthenticated: true,
        isAuthorized: true,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useNotifications
vi.mock('../hooks/common/useNotifications', () => ({
    useNotifications: () => ({
        notifications: [],
        unreadCount: 0,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
    }),
}));

interface WrapperProps {
    children: React.ReactNode;
}

function customRender(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { route?: string },
) {
    const { route, ...renderOptions } = options || {};

    const Wrapper = ({ children }: WrapperProps) => (
        <MemoryRouter initialEntries={route ? [route] : ['/']}>
            <ThemeProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </ThemeProvider>
        </MemoryRouter>
    );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { customRender as render, defaultMockUser, mockAuthContext };
export { screen, waitFor, within, act, fireEvent } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
