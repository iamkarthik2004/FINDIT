export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const timeAgo = (iso) => {
  if (!iso) return '';
  const then = new Date(`${iso}T00:00:00`).getTime();
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(iso);
};

export const STATUS_META = {
  active: { label: 'Active', tone: 'info' },
  'possible-match': { label: 'Possible Match', tone: 'primary' },
  'claim-pending': { label: 'Claim Pending', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  returned: { label: 'Returned', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  review: { label: 'In Review', tone: 'primary' },
  approved: { label: 'Approved', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' },
};

export const cls = (...classes) => classes.filter(Boolean).join(' ');