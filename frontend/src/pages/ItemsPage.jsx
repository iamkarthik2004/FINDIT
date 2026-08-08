import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Plus, ArrowDownWideNarrow, ChevronDown } from 'lucide-react';
import { itemService } from '../services';
import { CATEGORIES, LOCATIONS } from '../data/options';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import Button from '../components/Button';
import { cls } from '../utils/helpers';

const SORTS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'location', label: 'Location' },
];

export default function ItemsPage({ mode }) {
  const isLost = mode === 'lost';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [filters, setFilters] = useState({
    category: 'all',
    location: 'all',
    date: 'all',
    status: 'all',
  });

  const title = isLost ? 'Lost Items' : 'Found Items';
  const subtitle = isLost
    ? 'Browse items reported missing across campus.'
    : 'Maybe what you\'re looking for is already here.';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const timer = setTimeout(() => {
      itemService
        .getAll({ type: mode, search, sort, ...filters })
        .then((data) => mounted && setItems(data))
        .finally(() => mounted && setLoading(false));
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [mode, search, sort, filters]);

  const resultCount = useMemo(() => items.length, [items]);

  const resetFilters = () =>
    setFilters({ category: 'all', location: 'all', date: 'all', status: 'all' });

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'all').length;

  return (
    <div className="bg-lavender-50">
      <div className="border-b border-lavender-200 bg-white">
        <div className="container-x py-10 sm:py-14">
          <span
            className={cls(
              'badge',
              isLost ? 'bg-error-soft text-error' : 'bg-success-soft text-success',
            )}
          >
            {isLost ? 'Lost' : 'Found'}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-base text-ink-soft">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}…`} className="sm:max-w-md" />
            <div className="flex items-center gap-3">
              <div className="relative">
                <ArrowDownWideNarrow
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
                  aria-hidden="true"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort items"
                  className="input appearance-none !py-2.5 pl-9 pr-8 font-semibold"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                  aria-hidden="true"
                />
              </div>
              <Link to={isLost ? '/report-lost' : '/report-found'}>
                <Button className="whitespace-nowrap">
                  <Plus size={16} aria-hidden="true" />
                  {isLost ? 'Report Lost' : 'Report Found'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FilterPanel
              type={null}
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              categories={CATEGORIES}
              locations={LOCATIONS}
            />
            {activeFilterCount > 0 && (
              <p className="mt-3 text-center text-xs font-medium text-ink-soft">
                {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
              </p>
            )}
          </aside>

          <div>
            <p className="mb-4 text-sm font-medium text-ink-soft" aria-live="polite">
              {loading ? 'Loading reports…' : `${resultCount} item${resultCount === 1 ? '' : 's'} found`}
            </p>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={`No ${title.toLowerCase()} found`}
                description="Try adjusting your search or filters. You can also be the first to report this item."
                action={
                  <Link to={isLost ? '/report-lost' : '/report-found'}>
                    <Button variant="secondary">Report {isLost ? 'a lost item' : 'a found item'}</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
