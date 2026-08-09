import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { cls } from '../utils/helpers';

function SelectField({ label, value, onChange, options, id }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input appearance-none pr-9"
        >
          <option value="all">All</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, onChange, categories, locations, type, onReset }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const dateOptions = ['Today', 'This week', 'This month', 'Last 3 months'];

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal size={16} className="text-primary" aria-hidden="true" />
          Filters
        </h2>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:bg-lavender-50 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className={cls('grid gap-4', type ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}>
        {type && (
          <SelectField id="filter-type" label="Type" value={filters.type} onChange={set('type')} options={type} />
        )}
        <SelectField id="filter-category" label="Category" value={filters.category} onChange={set('category')} options={categories} />
        <SelectField id="filter-location" label="Location" value={filters.location} onChange={set('location')} options={locations} />
        <SelectField id="filter-date" label="Date" value={filters.date} onChange={set('date')} options={dateOptions} />
        <SelectField id="filter-status" label="Status" value={filters.status} onChange={set('status')} options={['Active', 'Possible Match', 'Returned']} />
      </div>
    </div>
  );
}