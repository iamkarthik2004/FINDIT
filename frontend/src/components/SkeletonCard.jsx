import { cls } from '../utils/helpers';

export default function SkeletonCard({ className }) {
  return (
    <div className={cls('card overflow-hidden', className)} aria-hidden="true">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="skeleton h-9 w-full rounded-full" />
      </div>
    </div>
  );
}