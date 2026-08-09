import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import TypeBadge from './TypeBadge';
import ItemImage from './ItemImage';
import { cls, formatDate } from '../utils/helpers';

export default function ItemCard({ item, className }) {
  const navigate = useNavigate();

  return (
    <article
      className={cls(
        'group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift',
        className,
      )}
    >
      <button
        onClick={() => navigate(`/item/${item.id}`)}
        className="relative block w-full text-left"
        aria-label={`View details for ${item.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-lavender-50">
          <ItemImage src={item.image} alt={item.title} />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <TypeBadge type={item.type} />
          </div>
          {item.matchScore > 0 && (
            <span className="badge absolute bottom-3 left-3 bg-white/95 text-primary shadow-soft backdrop-blur-sm">
              Match {item.matchScore}%
            </span>
          )}
        </div>
      </button>

      <div className="p-4">
        <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-primary-dark">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-soft">{item.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs font-medium text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-primary" aria-hidden="true" />
            {item.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} className="text-primary" aria-hidden="true" />
            {formatDate(item.date)}
          </span>
        </div>
        <button
          onClick={() => navigate(`/item/${item.id}`)}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-lavender-200 py-2 text-sm font-semibold text-primary-dark transition duration-200 hover:border-primary/40 hover:bg-primary-soft focus:outline-none focus:ring-4 focus:ring-primary/15"
        >
          View Details
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}