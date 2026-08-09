import { cls } from '../utils/helpers';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cls('flex flex-col items-center justify-center rounded-2xl border border-dashed border-lavender-200 bg-lavender-50/60 px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}