// ============================================
// Petit Stay - Forgot Password Page
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { DEMO_MODE } from '../../hooks/useDemo';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import '../../styles/pages/login.css';

const FORGOT_VIDEO = 'https://videos.pexels.com/video-files/6010489/6010489-uhd_2560_1440_25fps.mp4';
const FORGOT_POSTER = 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920';

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [emailError, setEmailError] = useState('');

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

    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 800));
        success(t('auth.resetLinkSent'), t('auth.resetLinkSentDesc'));
      } else {
        await sendPasswordResetEmail(auth, email);
        success(t('auth.resetLinkSent'), t('auth.resetLinkSentDesc'));
      }
      setIsSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error');
      showError(t('auth.requestFailed'), message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container login-page">
      {/* Visual Column (Left - Video) */}
      <div className="login-visual">
        <video
          className="login-visual-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={FORGOT_POSTER}
        >
          <source src={FORGOT_VIDEO} type="video/mp4" />
        </video>
        <div className="visual-overlay" />
        <div className="visual-content">
          <h1 className="visual-quote">"{t('auth.videoQuote')}"</h1>
          <p className="visual-author">— {t('auth.hospitalityStandard')}</p>
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
          {isSent ? (
            /* Success state */
            <div className="text-center">
              <h2 className="text-3xl font-serif mb-2">{t('auth.checkYourEmail')}</h2>
              <p className="text-charcoal-500 mb-8">
                {t('auth.resetEmailSent', { email })}
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth>
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif mb-2">
                  {t('auth.forgotPassword')}
                </h2>
                <p className="text-charcoal-500">
                  {t('auth.resetDescription')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label={t('auth.emailAccessId')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.loginEmailPlaceholder')}
                  error={emailError}
                  autoComplete="email"
                />

                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
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
            </>
          )}
        </div>

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} {t('auth.footerText')}</p>
        </div>
      </div>
    </div>
  );
}
