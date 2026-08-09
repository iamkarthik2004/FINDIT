import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Fingerprint,
  Users,
  FileText,
  LogOut,
  Search,
  PackagePlus,
  PackageOpen,
  Fingerprint as FingerprintIcon,
  Undo2,
  TrendingUp,
  BarChart3,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { adminService } from '../services';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import TypeBadge from '../components/TypeBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { cls, formatDate } from '../utils/helpers';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'items', label: 'Items', icon: Package },
  { key: 'claims', label: 'Claims', icon: Fingerprint },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'reports', label: 'Reports', icon: FileText },
];

const tabs = {
  dashboard: DashboardView,
  items: ItemsView,
  claims: ClaimsView,
  users: UsersView,
  reports: ReportsView,
};

export default function AdminDashboard() {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const ActiveView = tabs[view];

  return (
    <div className="flex min-h-screen bg-lavender-50">
      {/* Sidebar */}
      <aside
        className={cls(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-lavender-200 transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white">
                <Search size={17} strokeWidth={2.5} aria-hidden="true" />
              </span>
              FIND<span className="text-primary">IT</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-ink-soft hover:bg-lavender-50 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-6 rounded-xl bg-primary-soft px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary-dark">
            Admin Console
          </p>

          <nav className="mt-4 flex-1 space-y-1" aria-label="Admin navigation">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  setSidebarOpen(false);
                }}
                className={cls(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                  view === key
                    ? 'bg-primary text-white shadow-card'
                    : 'text-ink-soft hover:bg-lavender-50 hover:text-ink',
                )}
                aria-current={view === key ? 'page' : undefined}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="space-y-2 border-t border-lavender-200 pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-lavender-50 hover:text-ink"
            >
              <ArrowLeft size={17} aria-hidden="true" /> Back to site
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-error transition hover:bg-error-soft"
            >
              <LogOut size={17} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-lavender-200 bg-white/85 px-4 backdrop-blur-lg sm:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-ink-soft hover:bg-lavender-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <span className="text-ink">Admin</span>
            <span aria-hidden="true">/</span>
            <span className="capitalize text-primary-dark">{view}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
              AD
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <ActiveView onOpenItem={(id) => navigate(`/item/${id}`)} />
        </main>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function DashboardView() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const statCards = [
    { label: 'Total Items', value: stats?.totalItems ?? 0, icon: Package, tone: 'bg-primary-soft text-primary' },
    { label: 'Lost', value: stats?.lostItems ?? 0, icon: Search, tone: 'bg-error-soft text-error' },
    { label: 'Found', value: stats?.foundItems ?? 0, icon: PackageOpen, tone: 'bg-success-soft text-success' },
    { label: 'Pending Claims', value: stats?.pendingClaims ?? 0, icon: FingerprintIcon, tone: 'bg-warning-soft text-warning' },
    { label: 'Returned', value: stats?.returned ?? 0, icon: Undo2, tone: 'bg-lavender-100 text-primary-dark' },
  ];
  const weeklyReports = stats?.weeklyReports || [];
  const categoryDistribution = stats?.categoryDistribution || [];
  const maxWeekly = Math.max(1, ...weeklyReports.map((d) => d.reports));
  const maxCategory = Math.max(1, ...categoryDistribution.map((d) => d.value));
  const totalCat = categoryDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Campus lost &amp; found overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-4 sm:p-5">
            <span className={cls('grid h-10 w-10 place-items-center rounded-xl', tone)}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-xs font-medium text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <TrendingUp size={16} className="text-primary" aria-hidden="true" /> Reports this week
            </h2>
            <span className="text-xs font-medium text-ink-soft">7 days</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label="Bar chart of reports per day this week">
            {weeklyReports.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-light transition-all hover:opacity-80"
                  style={{ height: `${Math.max((d.reports / maxWeekly) * 100, 8)}%` }}
                />
                <span className="text-[10px] font-medium text-ink-soft">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <BarChart3 size={16} className="text-primary" aria-hidden="true" /> Items by category
          </h2>
          <ul className="mt-5 space-y-3">
            {categoryDistribution.length === 0 ? (
              <p className="text-sm text-ink-soft">No reports have been submitted yet.</p>
            ) : categoryDistribution.map((c) => (
              <li key={c.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{c.label}</span>
                  <span className="font-semibold text-ink-soft">{Math.round((c.value / totalCat) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-lavender-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                    style={{ width: `${(c.value / maxCategory) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RecentReports onOpenItem={(id) => window.open(`/item/${id}`, '_self')} />
    </div>
  );
}

/* ---------------- Shared pieces ---------------- */

function RecentReports({ onOpenItem }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  useEffect(() => { adminService.getItems().then((data) => setItems(data.slice(0, 6))).catch(() => setItems([])); }, []);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:p-6">
        <h2 className="text-sm font-bold text-ink">Recent Reports</h2>
        <button
          onClick={() => navigate('/admin')}
          className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark"
        >
          All reports
        </button>
      </div>
      <ReportTable rows={items} onOpenItem={onOpenItem} />
    </div>
  );
}

function ReportTable({ rows, onOpenItem, compact }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-y border-lavender-200 bg-lavender-50/70 text-xs font-bold uppercase tracking-wide text-ink-soft">
            <th className="px-5 py-3 sm:px-6">Item</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Reported By</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-5 py-3 text-right sm:px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-lavender-100 last:border-0 transition hover:bg-lavender-50/50">
              <td className="px-5 py-3.5 sm:px-6">
                <button onClick={() => onOpenItem(row.id)} className="flex items-center gap-3 text-left">
                  <ItemImage src={row.image} alt={row.title} className="h-10 w-12 shrink-0 rounded-lg" />
                  <span className="max-w-[180px] truncate font-semibold text-ink hover:text-primary-dark">
                    {row.title}
                  </span>
                </button>
              </td>
              <td className="px-4 py-3.5">
                <TypeBadge type={row.type} />
              </td>
              <td className="max-w-[140px] truncate px-4 py-3.5 text-ink-soft">{row.location}</td>
              <td className="px-4 py-3.5 text-ink-soft">{row.reportedBy}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-soft">{formatDate(row.date)}</td>
              <td className="px-4 py-3.5">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-5 py-3.5 text-right sm:px-6">
                <button
                  onClick={() => onOpenItem(row.id)}
                  className="rounded-full p-2 text-ink-soft transition hover:bg-primary-soft hover:text-primary-dark"
                  aria-label={`View ${row.title}`}
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Items ---------------- */

function ItemsView({ onOpenItem }) {
  const [items, setItems] = useState([]);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);
  const toast = useToast();

  useEffect(() => { adminService.getItems().then(setItems).catch((error) => toast(error.message, 'error')); }, [toast]);

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await adminService.removeItem(removeTarget.id);
      setItems((list) => list.filter((i) => i.id !== removeTarget.id));
      toast('Report removed.', 'info');
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  const confirmReturn = async () => {
    setReturning(true);
    try {
      await adminService.updateItemStatus(returnTarget.id, 'returned');
      setItems((list) => list.map((i) => (i.id === returnTarget.id ? { ...i, status: 'returned' } : i)));
      toast('Item marked as returned.', 'success');
      setReturnTarget(null);
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Items</h1>
          <p className="mt-1 text-sm text-ink-soft">{items.length} reports on the platform</p>
        </div>
        <Link to="/report-lost">
          <span className="btn-primary">
            <PackagePlus size={16} aria-hidden="true" /> New Report
          </span>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <ReportTable rows={items} onOpenItem={onOpenItem} />
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setReturnTarget(items[0])} className="btn-secondary !py-2 text-xs">
            <Undo2 size={13} aria-hidden="true" /> Mark latest item returned
          </button>
          <button onClick={() => setRemoveTarget(items[0])} className="btn-secondary !py-2 text-xs text-error">
            <Trash2 size={13} aria-hidden="true" /> Remove latest report
          </button>
        </div>
      )}

      <Modal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Remove this report?"
        description={`“${removeTarget?.title}” will be permanently removed from FINDIT. This cannot be undone.`}
        confirmLabel="Remove Report"
        destructive
        loading={removing}
        onConfirm={confirmRemove}
      />
      <Modal
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title="Mark as returned?"
        description={`“${returnTarget?.title}” will be marked as successfully returned.`}
        confirmLabel="Mark Returned"
        loading={returning}
        onConfirm={confirmReturn}
      />
    </div>
  );
}

/* ---------------- Claims ---------------- */

function ClaimsView() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminService
      .getClaims()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  const update = async (id, status, message) => {
    await adminService.updateClaim(id, status);
    setClaims((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
    toast(message, 'success');
  };

  if (loading) {
    return <div className="skeleton h-64 rounded-3xl" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Claims</h1>
        <p className="mt-1 text-sm text-ink-soft">Verify and manage ownership claims</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {claims.map((claim) => (
          <div key={claim.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ItemImage src={claim.item?.image} alt={claim.itemTitle} className="h-12 w-14 rounded-lg" />
                <div>
                  <p className="font-semibold text-ink">{claim.itemTitle}</p>
                  <p className="text-xs text-ink-soft">{formatDate(claim.claimDate)}</p>
                </div>
              </div>
              <StatusBadge status={claim.status} />
            </div>
            <p className="mt-3 line-clamp-2 rounded-xl bg-lavender-50 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
              {claim.description}
            </p>
            {claim.matchScore > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
                <Sparkles size={12} aria-hidden="true" /> Match {claim.matchScore}%
              </p>
            )}
            {(claim.status === 'pending' || claim.status === 'review') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => update(claim.id, 'approved', 'Claim approved.')}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-success px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
                >
                  <CheckCircle2 size={13} aria-hidden="true" /> Approve
                </button>
                <button
                  onClick={() => update(claim.id, 'rejected', 'Claim rejected.')}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-error px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
                >
                  <XCircle size={13} aria-hidden="true" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Users ---------------- */

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink-soft">{users.length} campus accounts</p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-lavender-200 bg-lavender-50/70 text-xs font-bold uppercase tracking-wide text-ink-soft">
                <th className="px-6 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-ink-soft">Loading accounts…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-ink-soft">No accounts yet.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-lavender-100 last:border-0 hover:bg-lavender-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
                        {u.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{u.name}</p>
                        <p className="text-xs text-ink-soft">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cls(
                        'badge',
                        u.role === 'admin' ? 'bg-primary-soft text-primary-dark' : 'bg-lavender-100 text-ink-soft',
                      )}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">{u.items}</td>
                  <td className="px-6 py-4 text-ink-soft">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reports ---------------- */

function ReportsView() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  useEffect(() => { adminService.getItems().then(setItems).catch(() => setItems([])); }, []);

  const filtered = useMemo(
    () =>
      items.filter((i) =>
        [i.title, i.location, i.reportedBy, i.category].join(' ').toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-soft">Every report on the platform</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            aria-label="Search reports"
            className="input !py-2.5 pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No reports match your search" description="Try a different keyword." />
      ) : (
        <div className="card overflow-hidden">
          <ReportTable rows={filtered} onOpenItem={(id) => window.open(`/item/${id}`, '_self')} />
        </div>
      )}
    </div>
  );
}
