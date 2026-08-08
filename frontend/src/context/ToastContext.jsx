import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, ring: 'border-success/30', text: 'text-success', bar: 'bg-success' },
  error: { icon: XCircle, ring: 'border-error/30', text: 'text-error', bar: 'bg-error' },
  warning: { icon: AlertTriangle, ring: 'border-warning/30', text: 'text-warning', bar: 'bg-warning' },
  info: { icon: Info, ring: 'border-primary/25', text: 'text-primary', bar: 'bg-primary' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'info', title) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, type, title }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => {
          const s = styles[toast.type] || styles.info;
          const Icon = s.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border bg-white p-3.5 shadow-card animate-scale-in ${s.ring}`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} aria-hidden="true" />
              <Icon size={20} className={`mt-0.5 shrink-0 ${s.text}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {toast.title && <p className="text-sm font-semibold text-ink">{toast.title}</p>}
                <p className="text-sm leading-snug text-ink-soft">{toast.message}</p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="rounded-lg p-1 text-ink-soft transition hover:bg-lavender-50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}