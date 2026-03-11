import { useTranslation } from 'react-i18next';
import type { SearchFilters } from './SearchFilter';

export type SortOption = 'recommended' | 'rating' | 'price_low' | 'reviews';

interface SearchHeaderProps {
  filters: SearchFilters;
  resultCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SearchHeader({ filters, resultCount, sort, onSortChange }: SearchHeaderProps) {
  const { t } = useTranslation();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const summaryParts = [
    filters.date ? formatDate(filters.date) : null,
    `${filters.timeStart}–${filters.timeEnd}`,
    `${filters.childAge}${t('search.yearsOldShort')}`,
    filters.language !== 'All' ? filters.language : null,
  ].filter(Boolean);

  return (
    <div className="search-header">
      <div className="search-header-summary">
        <h1 className="search-header-title">{t('search.title')}</h1>
        <div className="search-header-tags">
          {summaryParts.map((part, i) => (
            <span key={i} className="search-header-tag">{part}</span>
          ))}
        </div>
        <p className="search-header-count">
          {resultCount > 0
            ? t('search.resultCount', { count: resultCount })
            : t('search.noResults')}
        </p>
      </div>

      <div className="search-header-sort">
        <label className="search-header-sort-label">{t('search.sortBy')}</label>
        <select
          className="search-header-sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="recommended">{t('search.sortRecommended')}</option>
          <option value="rating">{t('search.sortRating')}</option>
          <option value="price_low">{t('search.sortPriceLow')}</option>
          <option value="reviews">{t('search.sortReviews')}</option>
        </select>
      </div>
    </div>
  );
}
