// ============================================
// Petit Stay - Login Page (Image + Motion)
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { IMAGES } from '../../data/images';
import '../../styles/pages/login.css';

// Demo accounts for testing
const DEMO_ACCOUNTS = [
  { email: 'hotel@demo.com', password: 'demo1234', roleKey: 'hotelStaff', labelKey: 'auth.conciergeLabel' },
  { email: 'parent@demo.com', password: 'demo1234', roleKey: 'parent', labelKey: 'auth.guestLabel' },
  { email: 'sitter@demo.com', password: 'demo1234', roleKey: 'sitter', labelKey: 'auth.specialistLabel' },
  { email: 'admin@demo.com', password: 'demo1234', roleKey: 'admin', labelKey: 'auth.opsAdminLabel' },
];

// Firebase error code to friendly message mapping
function mapFirebaseError(err: unknown, t: (key: string, defaultValue: string) => string): string {
  if (!(err instanceof Error)) return t('errors.unknownError', 'Authentication failed');
  const code = (err as { code?: string }).code || err.message;
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return t('errors.invalidCredentials', 'Invalid email or password');
    case 'auth/too-many-requests':
      return t('errors.tooManyRequests', 'Too many attempts. Please try again later.');
    case 'auth/network-request-failed':
      return t('errors.networkError', 'Network error. Please try again.');
    case 'auth/user-disabled':
      return t('errors.userDisabled', 'This account has been disabled.');
    default:
      return err.message || t('errors.unknownError', 'Authentication failed');
  }
}

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = t('validation.fieldRequired', { field: t('auth.email') });
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('errors.invalidEmail', 'Invalid email format');
    if (!password) newErrors.password = t('validation.fieldRequired', { field: t('auth.password') });
    else if (password.length < 6) newErrors.password = t('errors.passwordTooShort', 'Minimum 6 characters');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      success(t('auth.welcomeBackToast'), t('auth.accessGranted'));

      if (email.includes('admin')) navigate('/ops');
      else if (email.includes('hotel')) navigate('/hotel');
      else if (email.includes('parent')) navigate('/parent');
      else if (email.includes('sitter')) navigate('/sitter');
      else navigate('/hotel');
    } catch (err: unknown) {
      error(t('auth.accessDenied'), mapFirebaseError(err, t));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="login-container login-page"
        key="login"
        {...pageTransition}
      >
        {/* Visual Column (Left) */}
        <div className="login-visual" style={{ backgroundImage: `url(${IMAGES.auth.background})` }}>
          <div className="visual-overlay" />
          <div className="visual-content">
            <motion.h1
              className="visual-quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              "{t('auth.videoQuote')}"
            </motion.h1>
            <motion.p
              className="visual-author"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              — {t('auth.hospitalityStandard')}
            </motion.p>
          </div>
        </div>

        {/* Login Form Column (Right) */}
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
            <motion.div className="text-center mb-4" variants={fadeUp}>
              <h2 className="text-2xl font-serif mb-1">{t('auth.conciergeAccess')}</h2>
              <p className="text-charcoal-500 text-sm">{t('auth.pleaseAuthenticate')}</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <motion.div variants={fadeUp}>
                <Input
                  label={t('auth.emailAccessId')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.loginEmailPlaceholder')}
                  error={errors.email}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <Input
                  label={t('auth.securePassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  autoComplete="current-password"
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
              </motion.div>

              <motion.div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }} variants={fadeUp}>
                <Link to="/forgot-password" className="forgot-password-link">
                  {t('auth.forgotPassword', 'Forgot password?')}
                </Link>
              </motion.div>

              <motion.div className="mt-4" variants={fadeUp}>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t('auth.signInButton')}
                </Button>
              </motion.div>
            </form>

            {/* Demo Accounts */}
            <motion.div className="mt-4 border-t pt-4" variants={fadeUp}>
              <p className="text-xs text-charcoal-400 text-center uppercase tracking-widest mb-3">{t('auth.quickAccessSimulation')}</p>
              <div className="demo-grid">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className="demo-btn"
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={isLoading}
                  >
                    <span className="font-semibold text-xs">{t(account.labelKey)}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div className="mt-4 text-center" variants={fadeUp}>
              <p className="text-sm text-charcoal-500">
                {t('auth.notPartnerYet')} <Link to="/register" className="text-charcoal-900 border-b border-gold-500 pb-0.5 hover:text-gold-600">{t('auth.requestPartnership')}</Link>
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
