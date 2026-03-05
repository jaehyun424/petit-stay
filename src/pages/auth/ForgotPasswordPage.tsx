// ============================================
// Petit Stay - Forgot Password Page (3-Step Flow)
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { DEMO_MODE } from '../../hooks/useDemo';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import '../../styles/pages/login.css';

const FORGOT_IMAGE = 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [emailError, setEmailError] = useState('');

  const stepLabels = [
    t('auth.forgotStep1'),
    t('auth.forgotStep2'),
    t('auth.forgotStep3'),
  ];

  const validate = () => {
    if (!email) {
      setEmailError(t('validation.fieldRequired', { field: t('auth.email') }));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('errors.invalidEmail', 'Invalid email format'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setCurrentStep(2);
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 800));
        success(t('auth.resetLinkSent'), t('auth.resetLinkSentDesc'));
      } else {
        await sendPasswordResetEmail(auth, email);
        success(t('auth.resetLinkSent'), t('auth.resetLinkSentDesc'));
      }
      setCurrentStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error');
      showError(t('auth.requestFailed'), message);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepState = (step: number): 'completed' | 'active' | 'pending' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="login-container login-page"
        key="forgot-password"
        {...pageTransition}
      >
        {/* Visual Column (Left) */}
        <div className="login-visual">
          <img
            className="login-visual-image"
            src={FORGOT_IMAGE}
            alt=""
            loading="eager"
          />
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

          <div className="form-wrapper">
            {/* Step Indicator */}
            <div className="step-indicator">
              {stepLabels.map((label, idx) => {
                const step = idx + 1;
                const state = getStepState(step);
                return (
                  <React.Fragment key={step}>
                    {idx > 0 && (
                      <div className={`step-connector${state !== 'pending' ? ' step-connector-active' : ''}`} />
                    )}
                    <div className="step-item">
                      <div className={`step-circle${state === 'active' ? ' step-active' : ''}${state === 'completed' ? ' step-completed' : ''}`}>
                        {state === 'completed' ? <CheckCircle size={16} /> : step}
                      </div>
                      <span className={`step-label${state === 'active' ? ' step-label-active' : ''}`}>
                        {label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 3 ? (
                /* Step 3: Success confirmation */
                <motion.div
                  key="success"
                  className="text-center"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeUp}
                >
                  <div className="success-icon">
                    <Mail size={28} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-serif mb-2">{t('auth.checkYourEmail')}</h2>
                  <p className="text-sm text-charcoal-500 mb-8" style={{ lineHeight: 1.6 }}>
                    {t('auth.resetSuccessDesc')}
                  </p>
                  <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
                      {t('auth.returnToLogin')}
                  </Button>
                </motion.div>
              ) : (
                /* Step 1-2: Email form */
                <motion.div
                  key="form"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeUp}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif mb-2">
                      {t('auth.forgotTitle')}
                    </h2>
                    <p className="text-sm text-charcoal-500">
                      {t('auth.resetDescription')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      label={t('auth.emailAccessId')}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder={t('auth.loginEmailPlaceholder')}
                      error={emailError}
                      autoComplete="email"
                      disabled={isLoading}
                      icon={<Mail size={18} strokeWidth={1.75} />}
                    />

                    <div className="mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading}
                        icon={!isLoading ? <ArrowRight size={18} /> : undefined}
                        iconPosition="right"
                      >
                        {t('auth.sendResetLink')}
                      </Button>
                    </div>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-charcoal-500">
                      {t('auth.rememberPassword')}{' '}
                      <Link to="/login" className="text-charcoal-900 border-b border-gold-500 pb-0.5 hover:text-gold-600">
                        {t('auth.backToLogin')}
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="login-footer">
            <p>&copy; {new Date().getFullYear()} {t('auth.footerText')}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
