// ============================================
// Petit Stay - Language Switcher Component
// 4-language dropdown (EN/KO/JA/ZH)
// Portal-based dropdown to avoid overflow:hidden clipping
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    const getDropdownPosition = useCallback(() => {
        if (!buttonRef.current) return { top: 0, left: 0 };
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 4,
            left: rect.left,
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                buttonRef.current && !buttonRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const pos = isOpen ? getDropdownPosition() : { top: 0, left: 0 };

    return (
        <div className="language-switcher-wrapper">
            <button
                ref={buttonRef}
                className="language-switcher"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('aria.switchLanguage')}
                aria-expanded={isOpen}
            >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown size={12} strokeWidth={1.75} style={{ opacity: 0.5 }} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="language-dropdown"
                    style={{
                        position: 'fixed',
                        top: pos.top,
                        left: pos.left,
                        zIndex: 9999,
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option ${lang.code === currentLang.code ? 'active' : ''}`}
                            onClick={() => handleSelect(lang.code)}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}
