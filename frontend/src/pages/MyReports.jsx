import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Sparkles,
  Undo2,
  FileX2,
  SearchX,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { itemService, claimService } from '../services';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import TypeBadge from '../components/TypeBadge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { cls, formatDate, timeAgo } from '../utils/helpers';

const TABS = [
  { key: 'lost', label: 'Lost' },
  { key: 'found', label: 'Found' },
  { key: 'claims', label: 'Claims' },
];

export default function MyReports() {
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState('lost');
  const [reports, setReports] = useState({ lost: [], found: [] });
  const [claims, setClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([itemService.getMyReports(), claimService.getAll(), claimService.getReceived()])
      .then(([my, allClaims, incomingClaims]) => {
        if (!mounted) return;
        setReports({
          lost: my.filter((i) => i.type === 'lost'),
          found: my.filter((i) => i.type === 'found'),
        });
        setClaims(allClaims);
        setReceivedClaims(incomingClaims);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const returnedCount = reports.lost.filter((i) => i.status === 'returned').length;
  const stats = [
    { label: 'Lost Reports', value: reports.lost.length, icon: Package, tone: 'text-error bg-error-soft' },
    { label: 'Found Reports', value: reports.found.length, icon: Package, tone: 'text-success bg-success-soft' },
    { label: 'Claims', value: claims.length + receivedClaims.length, icon: Sparkles, tone: 'text-primary bg-primary-soft' },
    { label: 'Returned', value: returnedCount, icon: Undo2, tone: 'text-primary-dark bg-lavender-100' },
  ];

  const isLostTab = tab === 'lost';
  const currentItems = isLostTab ? reports.lost : reports.found;

  const handleWithdraw = async (id) => {
    await claimService.remove(id);
    setClaims((c) => c.filter((x) => x.id !== id));
    toast('Claim removed.', 'info');
  };

  const reviewClaim = async (claim, status) => {
    try {
      const updated = await claimService.updateReceived(claim.id, status);
      setReceivedClaims((list) => list.map((entry) => entry.id === claim.id ? updated : entry));
      toast(status === 'approved' ? 'Claim approved and item marked returned.' : 'Claim rejected.', 'success');
    } catch (error) {
      toast(error.message || 'Unable to update this claim.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-lavender-50">
      <div className="border-b border-lavender-200 bg-white">
        <div className="container-x py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Welcome back <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Here's what's happening with your reports on FINDIT.
          </p>
        </div>
      </div>

      <div className="container-x py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="card flex items-center gap-3.5 p-4 sm:p-5">
              <span className={cls('grid h-11 w-11 shrink-0 place-items-center rounded-xl', tone)}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none text-ink">{value}</p>
                <p className="mt-1 text-xs font-medium text-ink-soft">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-lavender-200 bg-white p-1 shadow-soft">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cls(
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  tab === t.key ? 'bg-primary text-white shadow-card' : 'text-ink-soft hover:text-primary-dark',
                )}
                aria-pressed={tab === t.key}
              >
                {t.label}
                {t.key === 'claims' && claims.length + receivedClaims.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-xs">{claims.length + receivedClaims.length}</span>
                )}
              </button>
            ))}
          </div>

          <Link
            to={isLostTab ? '/report-lost' : '/report-found'}
            className="btn-secondary ml-auto"
          >
            + New {isLostTab ? 'Lost' : 'Found'} Report
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-20 w-20 rounded-xl" />
                <div className="skeleton mt-3 h-4 w-1/3 rounded-full" />
                <div className="skeleton mt-2 h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : tab !== 'claims' ? (
          currentItems.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={SearchX}
                title={`No ${isLostTab ? 'lost' : 'found'} reports yet`}
                description={`When you report a ${isLostTab ? 'lost' : 'found'} item it will show up here, with match updates.`}
                action={
                  <Link to={isLostTab ? '/report-lost' : '/report-found'}>
                    <Button>Report {isLostTab ? 'a lost item' : 'a found item'}</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {currentItems.map((item) => (
                <li key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <button
                    onClick={() => navigate(`/item/${item.id}`)}
                    className="flex flex-1 items-start gap-4 text-left"
                  >
                    <ItemImage src={item.image} alt={item.title} className="h-16 w-20 shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                        <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
                          <Clock size={12} aria-hidden="true" /> {timeAgo(item.date)}
                        </span>
                      </div>
                      <h3 className="mt-1.5 truncate font-semibold text-ink">{item.title}</h3>
                      <p className="text-xs text-ink-soft">
                        {item.location}
                        {item.matchScore > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-primary-dark">
                            <Sparkles size={12} aria-hidden="true" /> Match: {item.matchScore}%
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 gap-2 sm:flex-col lg:flex-row">
                    {item.matchScore > 0 && (
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/item/${item.id}`)}>
                        <Sparkles size={13} aria-hidden="true" /> View Match
                      </Button>
                    )}
                    <Button size="sm" onClick={() => navigate(`/item/${item.id}`)}>
                      View Details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : claims.length + receivedClaims.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={FileX2}
              title="No claims yet"
              description="When you claim a found item, the request will be tracked here."
              action={<Link to="/found"><Button variant="secondary">Browse found items</Button></Link>}
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {[...claims.map((claim) => ({ ...claim, received: false })), ...receivedClaims.map((claim) => ({ ...claim, received: true }))].map((claim) => (
              <li key={claim.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex flex-1 items-start gap-4">
                  <ItemImage src={claim.item?.image} alt={claim.itemTitle} className="h-16 w-20 shrink-0 rounded-xl" />
                  <div>
                    <h3 className="font-semibold text-ink">{claim.itemTitle}</h3>
                    <p className="mt-0.5 text-xs text-ink-soft">{claim.received ? 'Received on' : 'Claimed on'} {formatDate(claim.claimDate)}</p>
                    {claim.received && claim.claimantName && <p className="mt-1 text-xs text-ink-soft">From <span className="font-semibold text-ink">{claim.claimantName}</span></p>}
                    {claim.matchScore > 0 && (
                      <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-dark">
                        <Sparkles size={11} aria-hidden="true" /> Match {claim.matchScore}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={claim.status} />
                  {!claim.received && claim.status === 'pending' && (
                    <Button size="sm" variant="danger" onClick={() => handleWithdraw(claim.id)}>
                      Withdraw
                    </Button>
                  )}
                  {!claim.received && claim.status === 'approved' && !claim.thankYouMessage && (
                    <Button size="sm" onClick={() => navigate('/claims')}>I Got This Item</Button>
                  )}
                  {claim.received && claim.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => reviewClaim(claim, 'approved')} aria-label={`Approve claim for ${claim.itemTitle}`}>
                        <CheckCircle2 size={13} /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => reviewClaim(claim, 'rejected')} aria-label={`Reject claim for ${claim.itemTitle}`}>
                        <XCircle size={13} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
