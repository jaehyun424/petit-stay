import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const HERO_VIDEO = 'https://videos.pexels.com/video-files/7884081/7884081-uhd_2560_1440_25fps.mp4';
const HERO_POSTER = 'https://images.pexels.com/videos/7884081/pexels-photo-7884081.jpeg?auto=compress&cs=tinysrgb&w=1920';
const HERO_MOBILE_IMG = 'https://images.pexels.com/photos/7884081/pexels-photo-7884081.jpeg?auto=compress&cs=tinysrgb&w=800';

export function HeroSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section ref={ref} className="hero-section section-fullscreen">
      {/* Video/Image background with parallax */}
      <motion.div className="hero-video-wrap" style={{ y }}>
        {isMobile ? (
          <img
            className="video-bg hero-mobile-img"
            src={HERO_MOBILE_IMG}
            alt="Family with child in hotel"
          />
        ) : (
          <video
            className="video-bg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
      </motion.div>
      <div className="video-overlay video-overlay-dark" />

      {/* Content */}
      <motion.div className="hero-content" style={{ opacity }}>
        <motion.span
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {t('landing.heroEyebrow')}
        </motion.span>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {t('landing.heroTitle')}
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {t('landing.heroSubtitle')}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Link to="/register" className="hero-btn-primary">
            {t('landing.heroGetStarted')}
            <ArrowRight size={18} />
          </Link>
          <button
            className="hero-btn-secondary"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Play size={16} />
            {t('landing.heroLearnMore')}
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="scroll-line" />
      </motion.div>
    </section>
  );
}
