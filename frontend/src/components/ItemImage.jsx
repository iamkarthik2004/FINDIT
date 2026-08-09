import { useState } from 'react';
import { cls } from '../utils/helpers';

export default function ItemImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageSrc = src?.startsWith('/uploads/') && import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}${src}`
    : src;

  return (
    <div className={cls('relative overflow-hidden', className)}>
      {!loaded && !error && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {error ? (
        <div className="grid h-full w-full place-items-center bg-lavender-50 text-sm font-medium text-ink-soft">
          <span className="text-center">Unable to load image</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cls(
            'h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}
