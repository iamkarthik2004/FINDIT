import { cls, STATUS_META } from '../utils/helpers';

const tones = {
  primary: 'bg-primary-soft text-primary-dark',
  info: 'bg-lavender-100 text-primary-dark',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  neutral: 'bg-lavender-50 text-ink-soft',
};

export default function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] || { label: status || 'Unknown', tone: 'neutral' };
  return (
    <span className={cls('badge', tones[meta.tone], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}