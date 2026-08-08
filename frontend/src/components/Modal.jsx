import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { cls } from '../utils/helpers';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissable = true,
  destructive = false,
  confirmLabel = 'Confirm',
  onConfirm,
  loading = false,
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [open, dismissable]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (dismissable && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cls(
          'w-full rounded-t-3xl bg-white p-6 shadow-2xl outline-none animate-scale-in sm:rounded-3xl',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          {dismissable && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-ink-soft transition hover:bg-lavender-50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}

        {footer !== false && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {destructive ? (
              <>
                <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                {onConfirm && (
                  <Button onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
