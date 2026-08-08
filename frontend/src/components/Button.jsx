import { Loader2 } from 'lucide-react';
import { cls } from '../utils/helpers';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-error/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
};

const sizes = {
  sm: '!px-3.5 !py-1.5 !text-xs',
  md: '',
  lg: '!px-7 !py-3.5 !text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}) {
  return (
    <button
      className={cls(variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}