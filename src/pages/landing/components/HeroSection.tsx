import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, MapPin, Users } from 'lucide-react';

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [childAge, setChildAge] = useState('');
  const [area, setArea] = useState('gangnam');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    if (childAge) params.set('age', childAge);
    if (area) params.set('area', area);
    navigate(`/search?${params.toString()}`);
  };

  // Tomorrow's date as min
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <section className="v2-hero">
      <div className="v2-hero-bg" />

      <motion.div
        className="v2-hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="v2-hero-eyebrow">{t('landing.heroEyebrow')}</span>
        <h1 className="v2-hero-title">{t('landing.heroTitle')}</h1>
        <p className="v2-hero-subtitle">{t('landing.heroSubtitle')}</p>

        <motion.form
          className="v2-search-bar"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="v2-search-fields">
            <div className="v2-search-field">
              <Calendar size={18} className="v2-search-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                placeholder={t('landing.searchDate')}
                aria-label={t('landing.searchDate')}
              />
            </div>

            <div className="v2-search-field">
              <Clock size={18} className="v2-search-icon" />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label={t('landing.searchTime')}
              >
                <option value="18:00">18:00</option>
                <option value="18:30">18:30</option>
                <option value="19:00">19:00</option>
                <option value="19:30">19:30</option>
                <option value="20:00">20:00</option>
                <option value="20:30">20:30</option>
                <option value="21:00">21:00</option>
              </select>
            </div>

            <div className="v2-search-field">
              <Users size={18} className="v2-search-icon" />
              <select
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                aria-label={t('landing.searchAge')}
              >
                <option value="">{t('landing.searchAgePlaceholder')}</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>

            <div className="v2-search-field">
              <MapPin size={18} className="v2-search-icon" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label={t('landing.searchArea')}
              >
                <option value="gangnam">{t('landing.areaGangnam')}</option>
                <option value="jongno">{t('landing.areaJongno')}</option>
                <option value="mapo">{t('landing.areaMapo')}</option>
                <option value="yongsan">{t('landing.areaYongsan')}</option>
                <option value="songpa">{t('landing.areaSongpa')}</option>
              </select>
            </div>
          </div>

          <button type="submit" className="v2-search-btn">
            <Search size={20} />
            <span>{t('landing.searchBtn')}</span>
          </button>
        </motion.form>

        <motion.p
          className="v2-hero-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {t('landing.heroNote')}
        </motion.p>
      </motion.div>
    </section>
  );
}
