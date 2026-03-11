// ============================================
// Petit Stay V2 - Authentication Context
// Roles: parent | sitter | partner | admin
// ============================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
/* eslint-disable react-refresh/only-export-components */
import type { User as FirebaseUser } from 'firebase/auth';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User, UserRole } from '../types';

// Demo mode flag
const isMockAuth = !auth || !auth.app;
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || isMockAuth;

// Demo users (V2 roles: parent, sitter, partner)
const DEMO_USERS: Record<string, User> = {
    'parent': {
        id: 'demo-parent-1',
        email: 'parent@demo.com',
        role: 'parent',
        profile: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            phone: '+1-555-123-4567',
            phoneVerified: true,
            preferredLanguage: 'en',
        },
        parentInfo: {
            emergencyContact: 'John Johnson',
            emergencyPhone: '+1-555-987-6543',
        },
        notifications: { push: true, email: true, sms: true },
        createdAt: new Date(),
        lastLoginAt: new Date(),
    },
    'sitter': {
        id: 'demo-sitter-1',
        email: 'sitter@demo.com',
        role: 'sitter',
        profile: {
            firstName: 'Minjung',
            lastName: 'Kim',
            phone: '+82-10-1234-5678',
            phoneVerified: true,
            preferredLanguage: 'ko',
        },
        sitterInfo: {
            sitterId: 'sitter-1',
        },
        notifications: { push: true, email: true, sms: true },
        createdAt: new Date(),
        lastLoginAt: new Date(),
    },
    'partner': {
        id: 'demo-partner-1',
        email: 'partner@demo.com',
        role: 'partner',
        hotelId: 'hotel-grand-hyatt',
        profile: {
            firstName: 'Hotel',
            lastName: 'Partner',
            phone: '+82-2-797-1234',
            phoneVerified: true,
            preferredLanguage: 'en',
        },
        notifications: { push: true, email: true, sms: false },
        createdAt: new Date(),
        lastLoginAt: new Date(),
    },
};

// ----------------------------------------
// Types
// ----------------------------------------
interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, role: UserRole, profile: SignUpProfile) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: Partial<User['profile']>) => Promise<void>;
    demoLogin: (role: 'parent' | 'sitter' | 'partner') => void;
}

interface SignUpProfile {
    firstName: string;
    lastName: string;
    phone?: string;
    preferredLanguage?: 'en' | 'ko' | 'ja' | 'zh';
}

interface AuthProviderProps {
    children: React.ReactNode;
}

// ----------------------------------------
// Context
// ----------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------
// Provider
// ----------------------------------------
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    id: fbUser.uid,
                    email: fbUser.email || '',
                    role: userData.role,
                    hotelId: userData.hotelId,
                    profile: userData.profile,
                    parentInfo: userData.parentInfo,
                    sitterInfo: userData.sitterInfo,
                    notifications: userData.notifications,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
                } as User;
            }

            return null;
        } catch {
            return null;
        }
    }, []);

    // Listen to auth state changes
    useEffect(() => {
        if (DEMO_MODE) {
            const savedRole = localStorage.getItem('demo-user-role') as 'parent' | 'sitter' | 'partner' | null;
            if (savedRole && DEMO_USERS[savedRole]) {
                setUser(DEMO_USERS[savedRole]);
            }
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                const userData = await fetchUserData(fbUser);
                setUser(userData);

                if (userData) {
                    await setDoc(
                        doc(db, 'users', fbUser.uid),
                        { lastLoginAt: serverTimestamp() },
                        { merge: true }
                    );
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserData]);

    // Demo login
    const demoLogin = useCallback((role: 'parent' | 'sitter' | 'partner') => {
        if (!DEMO_MODE) {
            console.warn('Demo login is only available in demo mode');
            return;
        }
        const demoUser = DEMO_USERS[role];
        if (demoUser) {
            setUser(demoUser);
            localStorage.setItem('demo-user-role', role);
        }
    }, []);

    // Sign in with email/password
    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                await new Promise((r) => setTimeout(r, 500));
                if (email.includes('partner')) demoLogin('partner');
                else if (email.includes('sitter')) demoLogin('sitter');
                else demoLogin('parent');
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
        } finally {
            setIsLoading(false);
        }
    }, [demoLogin]);

    // Sign up
    const signUp = useCallback(async (
        email: string,
        password: string,
        role: UserRole,
        profile: SignUpProfile
    ) => {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                await new Promise((r) => setTimeout(r, 500));
                const newUser: User = {
                    id: 'demo-new-' + Date.now(),
                    email,
                    role,
                    profile: {
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        phone: profile.phone || '',
                        phoneVerified: false,
                        preferredLanguage: profile.preferredLanguage || 'en',
                    },
                    notifications: { push: true, email: true, sms: false },
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                };
                setUser(newUser);
                return;
            }

            const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(fbUser, {
                displayName: `${profile.firstName} ${profile.lastName}`,
            });

            const userData = {
                email,
                role,
                profile: {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone || '',
                    phoneVerified: false,
                    preferredLanguage: profile.preferredLanguage || 'en',
                },
                notifications: {
                    push: true,
                    email: true,
                    sms: false,
                },
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
            };

            if (role === 'parent') {
                Object.assign(userData, {
                    parentInfo: {
                        emergencyContact: '',
                        emergencyPhone: '',
                    },
                });
            }

            await setDoc(doc(db, 'users', fbUser.uid), userData);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                localStorage.removeItem('demo-user-role');
            } else {
                await firebaseSignOut(auth);
            }
            setUser(null);
            setFirebaseUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset password
    const resetPassword = useCallback(async (email: string) => {
        if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 500));
            return;
        }
        await sendPasswordResetEmail(auth, email);
    }, []);

    // Update user profile
    const updateUserProfile = useCallback(async (data: Partial<User['profile']>) => {
        if (!user) return;

        if (DEMO_MODE) {
            setUser({ ...user, profile: { ...user.profile, ...data } });
            return;
        }

        if (!firebaseUser) return;

        const updatedProfile = { ...user.profile, ...data };

        await setDoc(
            doc(db, 'users', firebaseUser.uid),
            { profile: updatedProfile },
            { merge: true }
        );

        setUser({ ...user, profile: updatedProfile });
    }, [firebaseUser, user]);

    const value: AuthContextType = {
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserProfile,
        demoLogin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ----------------------------------------
// Hook
// ----------------------------------------
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

// ----------------------------------------
// Role-based hooks
// ----------------------------------------
export function useRequireAuth(allowedRoles?: UserRole[]) {
    const { user, isLoading, isAuthenticated } = useAuth();

    const isAuthorized = isAuthenticated && (
        !allowedRoles ||
        (user && allowedRoles.includes(user.role))
    );

    return {
        user,
        isLoading,
        isAuthenticated,
        isAuthorized,
    };
}

export function usePartnerAuth() {
    return useRequireAuth(['partner']);
}

export function useParentAuth() {
    return useRequireAuth(['parent']);
}

export function useSitterAuth() {
    return useRequireAuth(['sitter']);
}
