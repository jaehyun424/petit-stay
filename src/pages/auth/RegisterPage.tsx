// ============================================
// Petit Stay - Register Page (Image + Motion)
// ============================================

import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Users, Baby, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import type { UserRole } from '../../types';
import '../../styles/pages/login.css';

const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=1920&q=80';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const ROLE_CONFIG = [
  { value: 'parent' as const, icon: Baby, labelKey: 'auth.guestFamily', descKey: 'auth.roleParentDesc' },
  { value: 'sitter' as const, icon: Users, labelKey: 'auth.childcareSpecialist', descKey: 'auth.roleSitterDesc' },
  { value: 'hotel_staff' as const, icon: Hotel, labelKey: 'auth.hotelPartner', descKey: 'auth.roleHotelDesc' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signUp } = useAuth();
    const { success, error } = useToast();
    const { t, i18n } = useTranslation();

    // Support ?role=parent|sitter|hotel_staff URL param
    const roleParam = searchParams.get('role');
    const validRoles = ['parent', 'sitter', 'hotel_staff'];
    const defaultRole = (roleParam && validRoles.includes(roleParam) ? roleParam : 'parent') as UserRole;

    const LANGUAGE_OPTIONS = [
        { value: 'en', label: 'English' },
        { value: 'ko', label: '\uD55C\uAD6D\uC5B4' },
        { value: 'ja', label: '\u65E5\u672C\u8A9E' },
        { value: 'zh', label: '\u4E2D\u6587' },
    ];

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: defaultRole,
        language: i18n.language || 'en',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

    const strengthLabel = useMemo(() => {
        const labels = ['', t('auth.strengthWeak'), t('auth.strengthFair'), t('auth.strengthGood'), t('auth.strengthStrong')];
        return labels[passwordStrength] || '';
    }, [passwordStrength, t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (name === 'language') i18n.changeLanguage(value);
    };

    const handleRoleSelect = (role: UserRole) => {
        setFormData((prev) => ({ ...prev, role }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = t('validation.required');
        if (!formData.lastName.trim()) newErrors.lastName = t('validation.required');
        if (!formData.email) newErrors.email = t('validation.required');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.invalidEmail');
        if (!formData.password) newErrors.password = t('validation.required');
        else if (formData.password.length < 8) newErrors.password = t('validation.minChars', { count: 8 });
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('validation.passwordMismatch');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);

        try {
            await signUp(formData.email, formData.password, formData.role, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                preferredLanguage: formData.language as 'en' | 'ko' | 'ja' | 'zh',
            });
            success(t('auth.accountCreated'), t('auth.welcomeToNetwork'));

            const roleRedirects: Record<string, string> = {
                parent: '/parent',
                sitter: '/sitter',
                hotel_staff: '/hotel',
            };
            navigate(roleRedirects[formData.role] || '/login');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('common.error');
            error(t('common.error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="login-container login-page"
                key="register"
                {...pageTransition}
            >
                {/* Visual Column (Left) */}
                <div className="login-visual">
                    <img
                        className="login-visual-image"
                        src={REGISTER_IMAGE}
                        alt=""
                        loading="eager"
                    />
                    <div className="visual-overlay" />
                    <div className="visual-content">
                        <motion.h1
                            className="visual-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            {t('auth.registerVisualTitle')}
                        </motion.h1>
                        <motion.ul
                            className="visual-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <li>{t('auth.registerBullet1')}</li>
                            <li>{t('auth.registerBullet2')}</li>
                            <li>{t('auth.registerBullet3')}</li>
                        </motion.ul>
                    </div>
                </div>

                {/* Form Column (Right) */}
                <div className="login-form-container">
                    <div className="login-header">
                        <Link to="/" className="brand-logo-link">
                            <BrandLogo size="sm" showName />
                        </Link>
                        <div className="login-header-right">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <motion.div
                        className="form-wrapper"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div className="text-center mb-6" variants={fadeUp}>
                            <h2 className="text-2xl font-serif text-charcoal-900">{t('auth.registerTitle')}</h2>
                            <p className="text-sm text-charcoal-500">{t('auth.registerSubtitle')}</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Role Selection Cards */}
                            <motion.div variants={fadeUp}>
                                <label className="text-xs text-charcoal-500" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0.025em' }}>
                                    {t('auth.roleSelectTitle')}
                                </label>
                                <div className="role-cards">
                                    {ROLE_CONFIG.map((role) => {
                                        const Icon = role.icon;
                                        const isActive = formData.role === role.value;
                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                className={`role-card${isActive ? ' role-card--active' : ''}`}
                                                onClick={() => handleRoleSelect(role.value)}
                                            >
                                                <div className="role-card-icon">
                                                    <Icon size={18} strokeWidth={1.75} />
                                                </div>
                                                <span className="role-card-label">{t(role.labelKey)}</span>
                                                <span className="role-card-desc">{t(role.descKey)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            <motion.div className="grid grid-cols-2 gap-4" variants={fadeUp}>
                                <Input
                                    label={t('auth.firstName')}
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder={t('auth.firstNamePlaceholder')}
                                    error={errors.firstName}
                                    disabled={isLoading}
                                />
                                <Input
                                    label={t('auth.lastName')}
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder={t('auth.lastNamePlaceholder')}
                                    error={errors.lastName}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <Input
                                    label={t('auth.email')}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('auth.emailPlaceholder')}
                                    error={errors.email}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div className="grid grid-cols-2 gap-4" variants={fadeUp}>
                                <div>
                                    <Input
                                        label={t('auth.password')}
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t('auth.passwordPlaceholder')}
                                        error={errors.password}
                                        disabled={isLoading}
                                        rightAddon={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? t('aria.hidePassword') : t('aria.showPassword')}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                                            </button>
                                        }
                                    />
                                    {formData.password && (
                                        <div className="password-strength" data-strength={passwordStrength}>
                                            <div className="password-strength-bar">
                                                {[1, 2, 3, 4].map((seg) => (
                                                    <div
                                                        key={seg}
                                                        className={`password-strength-segment${seg <= passwordStrength ? ' active' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="password-strength-label">{strengthLabel}</span>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label={t('auth.confirmPlaceholder')}
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t('auth.confirmPlaceholder')}
                                    error={errors.confirmPassword}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <Select
                                    label={t('auth.language')}
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    options={LANGUAGE_OPTIONS}
                                />
                            </motion.div>

                            <motion.div className="mt-4" variants={fadeUp}>
                                <Button
                                    type="submit"
                                    variant="gold"
                                    fullWidth
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                >
                                    {t('auth.submitApplication')}
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div className="mt-6 text-center" variants={fadeUp}>
                            <p className="text-sm text-charcoal-500">
                                {t('auth.alreadyMember')} <Link to="/login" className="text-charcoal-900 border-b border-gold-500 pb-0.5 hover:text-gold-600">{t('auth.signIn')}</Link>
                            </p>
                        </motion.div>
                    </motion.div>

                    <div className="login-footer">
                        <p>&copy; {new Date().getFullYear()} {t('auth.footerText')}</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
