import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchFilter, type SearchFilters } from './search/SearchFilter';
import { SearchHeader, type SortOption } from './search/SearchHeader';
import { SitterCard } from './search/SitterCard';
import { demoSitters } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import '../../styles/pages/v2-search.css';

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

const DEFAULT_FILTERS: SearchFilters = {
  date: getDefaultDate(),
  timeStart: '19:00',
  timeEnd: '22:00',
  childAge: 5,
  language: 'All',
  priceMin: 15000,
  priceMax: 50000,
  certifiedOnly: false,
};

export default function SearchPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('recommended');

  const filtered = useMemo(() => {
    let result = demoSitters.filter((s) => {
      // Age range
      if (filters.childAge < s.ageMin || filters.childAge > s.ageMax) return false;
      // Language
      if (filters.language !== 'All' && !s.languages.includes(filters.language)) return false;
      // Price
      if (s.hourlyRate < filters.priceMin || s.hourlyRate > filters.priceMax) return false;
      // Certified
      if (filters.certifiedOnly && !s.certified) return false;
      return true;
    });

    // Sort
    switch (sort) {
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        result = [...result].sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'reviews':
        result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'recommended':
      default:
        // Certified first, then by rating * reviewCount
        result = [...result].sort((a, b) => {
          if (a.certified !== b.certified) return a.certified ? -1 : 1;
          return b.rating * b.reviewCount - a.rating * a.reviewCount;
        });
        break;
    }

    return result;
  }, [filters, sort]);

  return (
    <div className="search-page">
      {/* Top nav */}
      <nav className="search-nav">
        <div className="search-nav-inner">
          <Link to="/" className="search-nav-logo">
            <BrandLogo size="sm" showName />
          </Link>
          <div className="search-nav-actions">
            <LanguageSwitcher />
            <Link to="/login" className="search-nav-signin">{t('landing.navSignIn')}</Link>
          </div>
        </div>
      </nav>

      <div className="search-layout">
        <SearchFilter filters={filters} onChange={setFilters} />

        <main className="search-main">
          <SearchHeader
            filters={filters}
            resultCount={filtered.length}
            sort={sort}
            onSortChange={setSort}
          />

          {filtered.length > 0 ? (
            <div className="search-results-grid">
              {filtered.map((sitter) => (
                <SitterCard key={sitter.id} sitter={sitter} />
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <p className="search-empty-text">{t('search.emptyMessage')}</p>
              <button
                className="search-empty-reset"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                {t('search.resetFilters')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
