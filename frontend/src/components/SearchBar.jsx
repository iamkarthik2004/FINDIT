import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cls } from '../utils/helpers';

export default function SearchBar({ value, onChange, placeholder = 'Search items…', className }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cls(
        'relative flex items-center rounded-full border bg-white px-4 transition-all duration-200',
        focused
          ? 'border-primary shadow-glow ring-2 ring-primary/10'
          : 'border-lavender-200 shadow-soft hover:border-primary/40',
        className,
      )}
    >
      <Search size={18} className={cls('shrink-0 transition', focused ? 'text-primary' : 'text-ink-soft')} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Search items"
        className="w-full bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="rounded-full p-1 text-ink-soft transition hover:bg-lavender-50 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}