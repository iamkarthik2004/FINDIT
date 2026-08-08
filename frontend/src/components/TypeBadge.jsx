export default function TypeBadge({ type }) {
  return type === 'lost' ? (
    <span className="badge bg-error-soft text-error">
      <span aria-hidden="true">Lost</span>
    </span>
  ) : (
    <span className="badge bg-success-soft text-success">
      <span aria-hidden="true">Found</span>
    </span>
  );
}