// ============================================
// Petit Stay - Register Page (Video + Motion)
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import type { UserRole } from '../../types';
import '../../styles/pages/register.css';

const REGISTER_VIDEO = 'https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4';
const REGISTER_POSTER = 'https://images.pexels.com/photos/3209045/pexels-photo-3209045.jpeg?auto=compress&cs=tinysrgb&w=1920';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const { success, error } = useToast();
    const { t, i18n } = useTranslation();

    const ROLE_OPTIONS = [
        { value: 'parent', label: t('auth.guestFamily') },
        { value: 'sitter', label: t('auth.childcareSpecialist') },
        { value: 'hotel_staff', label: t('auth.hotelPartner') },
    ];

    const LANGUAGE_OPTIONS = [
        { value: 'en', label: 'English' },
        { value: 'ko', label: '한국어' },
        { value: 'ja', label: '日本語' },
        { value: 'zh', label: '中文' },
    ];

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'parent' as UserRole,
        language: i18n.language || 'en',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (name === 'language') i18n.changeLanguage(value);
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
        <div className="register-container">
            {/* Video Visual Column (Left) */}
            <div className="register-visual">
                <video
                    className="register-visual-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={REGISTER_POSTER}
                >
                    <source src={REGISTER_VIDEO} type="video/mp4" />
                </video>
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
            <div className="register-form-container">
                <div className="login-header">
                    <Link to="/" className="back-to-home">
                        <ArrowLeft size={16} />
                        {t('auth.backToHome')}
                    </Link>
                    <div className="brand-logo">
                        <span className="logo-text">Petit<span className="text-gold">Stay</span></span>
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
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                                    </button>
                                }
                            />
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

                        <motion.div className="grid grid-cols-2 gap-4" variants={fadeUp}>
                            <Select
                                label={t('auth.accountType')}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={ROLE_OPTIONS}
                            />
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
                    <LanguageSwitcher />
                    <p>&copy; {new Date().getFullYear()} {t('auth.footerText')}</p>
                </div>
            </div>
        </div>
    );
}
