import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export interface SearchFilters {
  date: string;
  timeStart: string;
  timeEnd: string;
  childAge: number;
  language: string;
  priceMin: number;
  priceMax: number;
  certifiedOnly: boolean;
}

interface SearchFilterProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const LANGUAGES = ['All', 'English', 'Japanese', 'Chinese', 'Korean'];
const TIME_OPTIONS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
export function SearchFilter({ filters, onChange }: SearchFilterProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<SearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  // Tomorrow as default min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const filterContent = (
    <div className="search-filter-fields">
      {/* Date */}
      <div className="search-filter-group">
        <label className="search-filter-label">{t('search.date')}</label>
        <input
          type="date"
          className="search-filter-input"
          value={filters.date}
          min={minDate}
          onChange={(e) => update({ date: e.target.value })}
        />
      </div>

      {/* Time range */}
      <div className="search-filter-group">
        <label className="search-filter-label">{t('search.time')}</label>
        <div className="search-filter-time-row">
          <select
            className="search-filter-select"
            value={filters.timeStart}
            onChange={(e) => update({ timeStart: e.target.value })}
          >
            {TIME_OPTIONS.slice(0, -1).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="search-filter-time-sep">—</span>
          <select
            className="search-filter-select"
            value={filters.timeEnd}
            onChange={(e) => update({ timeEnd: e.target.value })}
          >
            {TIME_OPTIONS.filter((t) => t > filters.timeStart).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Child age */}
      <div className="search-filter-group">
        <label className="search-filter-label">{t('search.childAge')}</label>
        <select
          className="search-filter-select"
          value={filters.childAge}
          onChange={(e) => update({ childAge: Number(e.target.value) })}
        >
          {[3, 4, 5, 6, 7, 8].map((age) => (
            <option key={age} value={age}>
              {age} {t('search.yearsOld')}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="search-filter-group">
        <label className="search-filter-label">{t('search.language')}</label>
        <div className="search-filter-chips">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`search-filter-chip ${filters.language === lang ? 'active' : ''}`}
              onClick={() => update({ language: lang })}
            >
              {lang === 'All' ? t('search.allLangs') : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="search-filter-group">
        <label className="search-filter-label">{t('search.priceRange')}</label>
        <div className="search-filter-price-row">
          <span className="search-filter-price-label">₩{filters.priceMin.toLocaleString()}</span>
          <span className="search-filter-price-sep">—</span>
          <span className="search-filter-price-label">₩{filters.priceMax.toLocaleString()}</span>
        </div>
        <input
          type="range"
          className="search-filter-range"
          min={15000}
          max={50000}
          step={5000}
          value={filters.priceMax}
          onChange={(e) => update({ priceMax: Number(e.target.value) })}
        />
        <div className="search-filter-range-labels">
          <span>₩15,000</span>
          <span>₩50,000</span>
        </div>
      </div>

      {/* Certified only */}
      <div className="search-filter-group">
        <label className="search-filter-toggle-row">
          <span className="search-filter-toggle-label">
            <ShieldCheck size={16} />
            {t('search.certifiedOnly')}
          </span>
          <button
            className={`search-filter-toggle ${filters.certifiedOnly ? 'active' : ''}`}
            onClick={() => update({ certifiedOnly: !filters.certifiedOnly })}
            role="switch"
            aria-checked={filters.certifiedOnly}
          >
            <span className="search-filter-toggle-thumb" />
          </button>
        </label>
      </div>
    </div>
  );

  return (
    <aside className="search-filter">
      {/* Mobile toggle */}
      <button
        className="search-filter-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span>{t('search.filters')}</span>
        {mobileOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Desktop: always visible / Mobile: collapsible */}
      <div className={`search-filter-body ${mobileOpen ? 'open' : ''}`}>
        {filterContent}
      </div>
    </aside>
  );
}
