// ============================================
// Petit Stay V2 - Theme Context
// Light mode only
// ============================================

import React, { createContext, useContext, useEffect } from 'react';

// ----------------------------------------
// Types
// ----------------------------------------
type Theme = 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

// ----------------------------------------
// Context
// ----------------------------------------
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ----------------------------------------
// Provider
// ----------------------------------------
export function ThemeProvider({ children }: ThemeProviderProps) {
    // Always light
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    const value: ThemeContextType = {
        theme: 'light',
        toggleTheme: () => {},
        setTheme: () => {},
        isDark: false,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ----------------------------------------
// Hook
// ----------------------------------------
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
