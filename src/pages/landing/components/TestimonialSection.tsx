import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { demoReviews } from '../../../data/v2-demo-reviews';

export function TestimonialSection() {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % demoReviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + demoReviews.length) % demoReviews.length);
  const next = () => setCurrent((c) => (c + 1) % demoReviews.length);
  const review = demoReviews[current];

  return (
    <section id="testimonials" className="v2-testimonials section-padded">
      <div className="v2-testimonials-inner">
        <ScrollReveal>
          <div className="v2-testimonials-header">
            <span className="section-eyebrow section-eyebrow-light">{t('landing.testimonialsEyebrow')}</span>
            <h2 className="section-heading section-heading-light">{t('landing.testimonialsTitle')}</h2>
          </div>
        </ScrollReveal>

        <div className="testimonial-carousel">
          <button className="testimonial-arrow" onClick={prev} aria-label="Previous">
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
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} size={18} fill="var(--gold-400)" color="var(--gold-400)" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  &ldquo;{isKo ? review.quoteKo : review.quote}&rdquo;
                </blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{review.initials}</div>
                  <div className="testimonial-author-info">
                    <span className="testimonial-name">
                      {isKo ? review.parentNameKo : review.parentName}
                    </span>
                    <span className="testimonial-role">
                      {isKo ? review.countryKo : review.country} · {isKo ? review.childAgeKo : review.childAge}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="testimonial-arrow" onClick={next} aria-label="Next">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="testimonial-dots">
          {demoReviews.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${i === current ? 'testimonial-dot-active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
