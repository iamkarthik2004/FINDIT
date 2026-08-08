import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cls } from '../utils/helpers';

export default function Logo({ size = 'md', to = '/', dark = false }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="FINDIT home">
      <span
        className={cls(
          sizes[size],
          'grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-card transition-transform duration-200 group-hover:scale-105',
        )}
      >
        <Search size={size === 'lg' ? 22 : size === 'sm' ? 15 : 18} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className={cls(textSizes[size], 'font-extrabold tracking-tight', dark ? 'text-white' : 'text-ink')}>
        FIND
        <span className="text-primary">IT</span>
      </span>
    </Link>
  );
}