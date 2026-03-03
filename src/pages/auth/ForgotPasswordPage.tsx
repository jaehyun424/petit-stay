// ============================================
// Petit Stay - Forgot Password Page
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { DEMO_MODE } from '../../hooks/useDemo';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import '../../styles/pages/login.css';

const FORGOT_VIDEO = 'https://videos.pexels.com/video-files/7884081/7884081-uhd_2560_1440_25fps.mp4';
const FORGOT_POSTER = 'https://images.pexels.com/videos/7884081/pexels-photo-7884081.jpeg?auto=compress&cs=tinysrgb&w=1920';

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    if (!email) {
      setEmailError(t('auth.email', 'Email') + ' is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
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
        // Simulate network delay in demo mode
        await new Promise((r) => setTimeout(r, 800));
        success('Reset link sent', 'A password reset link has been sent to your email.');
      } else {
        await sendPasswordResetEmail(auth, email);
        success('Reset link sent', 'A password reset link has been sent to your email.');
      }
      setIsSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      showError('Request Failed', message);
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
          poster={FORGOT_POSTER}
        >
          <source src={FORGOT_VIDEO} type="video/mp4" />
        </video>
        <div className="visual-overlay" />
        <div className="visual-content">
          <h1 className="visual-quote">"Uncompromising care for your most important guests."</h1>
          <p className="visual-author">— Petit Stay Hospitality Standard</p>
        </div>
      </div>

      {/* Form Column (Right) */}
      <div className="login-form-container">
        <div className="login-header">
          <Link to="/" className="back-to-home">
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <div className="brand-logo">
            <span className="logo-text">Petit<span className="text-gold">Stay</span></span>
          </div>
        </div>

        <div className="form-wrapper">
          {isSent ? (
            /* Success state */
            <div className="text-center">
              <h2 className="text-3xl font-serif mb-2">Check Your Email</h2>
              <p className="text-charcoal-500 mb-8">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth>
                  {t('auth.backToLogin', 'Back to Login')}
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif mb-2">
                  {t('auth.forgotPassword', 'Forgot password?')}
                </h2>
                <p className="text-charcoal-500">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email Access ID"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hotel.com"
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
                    SEND RESET LINK
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-charcoal-500">
                  Remember your password?{' '}
                  <Link to="/login" className="text-charcoal-900 border-b border-gold-500 pb-0.5 hover:text-gold-600">
                    {t('auth.backToLogin', 'Back to Login')}
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="login-footer">
          <LanguageSwitcher />
          <p>&copy; 2026 Petit Stay. Tokyo &bull; Seoul &bull; Singapore.</p>
        </div>
      </div>
    </div>
  );
}
