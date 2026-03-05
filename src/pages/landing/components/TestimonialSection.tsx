import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const testimonials = [
  { nameKey: 'testimonial1Name', roleKey: 'testimonial1Role', quoteKey: 'testimonial1Quote', rating: 5, initials: 'SK' },
  { nameKey: 'testimonial2Name', roleKey: 'testimonial2Role', quoteKey: 'testimonial2Quote', rating: 5, initials: 'YT' },
  { nameKey: 'testimonial3Name', roleKey: 'testimonial3Role', quoteKey: 'testimonial3Quote', rating: 5, initials: 'LC' },
];

const TESTIMONIAL_BG = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80';

export function TestimonialSection() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section id="testimonials" className="testimonial-section section-padded section-dark testimonial-with-bg">
      <img
        className="testimonial-bg-image"
        src={TESTIMONIAL_BG}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
      <div className="testimonial-bg-overlay" />

      <div className="testimonial-inner">
        <ScrollReveal>
          <div className="feature-showcase-header">
            <span className="section-eyebrow section-eyebrow-light">{t('landing.testimonialsEyebrow')}</span>
            <h2 className="section-heading section-heading-light">{t('landing.testimonialsTitle')}</h2>
          </div>
        </ScrollReveal>

        <div className="testimonial-carousel">
          <button className="testimonial-arrow" onClick={prev} aria-label={t('aria.previous')}>
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="testimonial-card"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
              >
                <div className="testimonial-stars">
                  {Array.from({ length: testimonials[current].rating }, (_, i) => (
                    <Star key={i} size={18} fill="var(--gold-400)" color="var(--gold-400)" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "{t(`landing.${testimonials[current].quoteKey}`)}"
                </blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonials[current].initials}
                  </div>
                  <div className="testimonial-author-info">
                    <span className="testimonial-name">{t(`landing.${testimonials[current].nameKey}`)}</span>
                    <span className="testimonial-role">{t(`landing.${testimonials[current].roleKey}`)}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="testimonial-arrow" onClick={next} aria-label={t('aria.next')}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots */}
        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${i === current ? 'testimonial-dot-active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={t('aria.testimonialNumber', { number: i + 1 })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
