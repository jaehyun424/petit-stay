// ============================================
// Petit Stay - Language Switcher Component
// Elegant popover with flag emojis + framer-motion
// Portal-based to avoid overflow:hidden clipping
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
    { code: 'ko', label: '\uD55C\uAD6D\uC5B4', flag: '\u{1F1F0}\u{1F1F7}' },
    { code: 'ja', label: '\u65E5\u672C\u8A9E', flag: '\u{1F1EF}\u{1F1F5}' },
    { code: 'zh', label: '\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
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
        const dropdownWidth = 180;
        const wouldOverflowRight = rect.left + dropdownWidth > window.innerWidth;
        return {
            top: rect.bottom + 6,
            left: wouldOverflowRight ? rect.right - dropdownWidth : rect.left,
        };
    }, []);

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

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
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
                <span className="language-switcher-flag">{currentLang.flag}</span>
                <span className="language-switcher-code">{currentLang.code.toUpperCase()}</span>
                <ChevronDown
                    size={12}
                    strokeWidth={1.75}
                    className="language-switcher-chevron"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                    }}
                />
            </button>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            className="language-dropdown"
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                top: pos.top,
                                left: pos.left,
                                zIndex: 9999,
                            }}
                        >
                            {LANGUAGES.map((lang, index) => (
                                <motion.button
                                    key={lang.code}
                                    className={`language-option ${lang.code === currentLang.code ? 'active' : ''}`}
                                    onClick={() => handleSelect(lang.code)}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03, duration: 0.12 }}
                                >
                                    <span className="language-option-flag">{lang.flag}</span>
                                    <span className="language-option-label">{lang.label}</span>
                                    {lang.code === currentLang.code && (
                                        <Check size={14} strokeWidth={2} className="language-option-check" />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
