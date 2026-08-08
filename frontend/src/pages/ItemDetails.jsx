import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  UserRound,
  Tag,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Fingerprint,
  Building2,
  ArrowRight,
  SearchX,
  MessageCircle,
} from 'lucide-react';
import { itemService, claimService, matchService, chatService } from '../services';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import TypeBadge from '../components/TypeBadge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, cls } from '../utils/helpers';

const timeline = [
  { key: 'reported', label: 'Reported', icon: Building2 },
  { key: 'possible-match', label: 'Possible Match', icon: Sparkles },
  { key: 'claim-submitted', label: 'Claim Submitted', icon: Fingerprint },
  { key: 'verified', label: 'Verified', icon: ShieldCheck },
  { key: 'returned', label: 'Returned', icon: CheckCircle2 },
];

const statusIndex = (status) => {
  switch (status) {
    case 'active':
      return 0;
    case 'possible-match':
      return 1;
    case 'claim-pending':
      return 2;
    case 'verified':
      return 3;
    case 'returned':
      return 4;
    default:
      return 0;
  }
};

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [claimModal, setClaimModal] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [receiveMessage, setReceiveMessage] = useState('I found my item. Thank you for helping return it!');
  const [receiving, setReceiving] = useState(false);

  useEffect(() => {
    let mounted = true;
    itemService
      .getById(id)
      .then((data) => {
        if (!mounted) return;
        if (!data) {
          setItem(null);
        } else {
          setItem(data);
          setActiveImage(0);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const galleries = item?.gallery?.length ? item.gallery : item ? [item.image] : [];

  const viewMatch = async () => {
    setMatchLoading(true);
    try {
      const matches = await matchService.findPossibleMatches(item.id);
      setMatch(matches[0] || null);
    } finally {
      setMatchLoading(false);
    }
  };

  const submitClaim = async () => {
    setClaiming(true);
    try {
      await claimService.submit(item.id, claimDescription);
      setItem((prev) => (prev ? { ...prev, status: 'claim-pending' } : prev));
      toast('Claim submitted! We\'ll notify you when it\'s verified.', 'success', 'Claim sent');
      setClaimModal(false);
      setClaimDescription('');
    } catch (error) {
      toast(error.message || 'Unable to submit this claim. Please try again.', 'error', 'Claim not submitted');
    } finally {
      setClaiming(false);
    }
  };

  const markReceived = async () => {
    if (receiveMessage.trim().length < 3) {
      toast('Please add a short description of how you got the item.', 'error');
      return;
    }
    setReceiving(true);
    try {
      await itemService.markReceived(item.id, receiveMessage.trim());
      toast('Your lost-item report has been closed as recovered.', 'success', 'Item recovered');
      navigate('/my-reports', { replace: true });
    } catch (error) {
      toast(error.message || 'Unable to update this report.', 'error', 'Update failed');
    } finally {
      setReceiving(false);
    }
  };

  const openChat = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/item/${item.id}` } } });
      return;
    }
    try {
      const chat = await chatService.openForItem(item.id);
      navigate(`/chats/${chat.id}`);
    } catch (error) {
      toast(error.message || 'Unable to start this chat.', 'error', 'Chat unavailable');
    }
  };

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="skeleton h-7 w-32 rounded-full" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="skeleton aspect-[4/3] rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-2/3 rounded-xl" />
            <div className="skeleton h-4 w-1/3 rounded-xl" />
            <div className="skeleton h-4 w-full rounded-xl" />
            <div className="skeleton h-4 w-5/6 rounded-xl" />
            <div className="skeleton h-4 w-3/4 rounded-xl" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-x py-24">
        <EmptyState
          icon={SearchX}
          title="Item not found"
          description="This report may have been removed or the link is incorrect."
          action={
            <Button variant="secondary" onClick={() => navigate('/lost')}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to Lost Items
            </Button>
          }
        />
      </div>
    );
  }

  const isFound = item.type === 'found';
  const isLostOwner = !isFound && user?.id === item.userId;
  const step = statusIndex(item.status);

  return (
    <div className="bg-lavender-50">
      <div className="container-x py-8 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost -ml-3"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT — gallery */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-lavender-200 bg-white shadow-soft">
              <div className="aspect-[4/3]">
                <ItemImage
                  src={galleries[activeImage]}
                  alt={`${item.title} — photo ${activeImage + 1}`}
                  className="h-full w-full"
                />
              </div>
            </div>
            {galleries.length > 1 && (
              <div className="mt-3 flex gap-3" role="tablist" aria-label="Item photos">
                {galleries.map((g, i) => (
                  <button
                    key={g + i}
                    role="tab"
                    aria-selected={activeImage === i}
                    aria-label={`Photo ${i + 1}`}
                    onClick={() => setActiveImage(i)}
                    className={cls(
                      'h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition',
                      activeImage === i
                        ? 'border-primary ring-2 ring-primary/25'
                        : 'border-lavender-200 opacity-70 hover:opacity-100',
                    )}
                  >
                    <ItemImage src={g} alt="" className="h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
              {item.matchScore > 0 && (
                <span className="badge bg-primary-soft text-primary-dark">
                  <Sparkles size={12} aria-hidden="true" /> {item.matchScore}% match
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{item.title}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Reported by <span className="font-semibold text-ink">{item.reportedBy}</span>
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-lavender-200 bg-white p-3.5">
                <Tag size={17} className="shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-ink-soft">Category</dt>
                  <dd className="truncate text-sm font-semibold text-ink">{item.category}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-lavender-200 bg-white p-3.5">
                <MapPin size={17} className="shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-ink-soft">
                    {isFound ? 'Found location' : 'Location lost'}
                  </dt>
                  <dd className="truncate text-sm font-semibold text-ink">{item.location}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-lavender-200 bg-white p-3.5">
                <CalendarDays size={17} className="shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-ink-soft">Date</dt>
                  <dd className="text-sm font-semibold text-ink">{formatDate(item.date)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-lavender-200 bg-white p-3.5">
                <UserRound size={17} className="shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-ink-soft">Reported by</dt>
                  <dd className="truncate text-sm font-semibold text-ink">{item.reportedBy}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-lavender-200 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="text-ink-soft">
                  Brand: <strong className="font-semibold text-ink">{item.brand || '—'}</strong>
                </span>
                <span className="text-ink-soft">
                  Colour: <strong className="font-semibold text-ink">{item.color || '—'}</strong>
                </span>
              </div>
              {item.details && (
                <p className="mt-3 rounded-xl bg-lavender-50 px-4 py-3 text-sm text-ink-soft">
                  <strong className="font-semibold text-ink">Identifying details:</strong> {item.details}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {isFound ? (
                <Button size="lg" className="flex-1" onClick={() => setClaimModal(true)}>
                  <Fingerprint size={18} aria-hidden="true" />
                  This is Mine — Claim Item
                </Button>
              ) : isLostOwner ? (
                <Button size="lg" className="flex-1" onClick={() => setReceiveModal(true)}>
                  <Fingerprint size={18} aria-hidden="true" />
                  I Found This Item
                </Button>
              ) : (
                <Button size="lg" className="flex-1" onClick={() => navigate('/report-found')}>
                  <Fingerprint size={18} aria-hidden="true" />
                  I Found This Item
                </Button>
              )}
              {!isLostOwner && <Button variant="secondary" size="lg" onClick={openChat}>
                <MessageCircle size={17} aria-hidden="true" /> {isFound ? 'Chat with Finder' : 'Chat'}
              </Button>}
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
              Ownership is always verified before an item changes hands.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Timeline */}
          <div className="rounded-3xl border border-lavender-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-lg font-bold text-ink">Status Timeline</h2>
            <ol className="mt-6 space-y-0">
              {timeline.map((t, i) => {
                const done = i <= step;
                const isCurrent = i === step;
                const Icon = t.icon;
                return (
                  <li key={t.key} className="relative flex gap-4 pb-7 last:pb-0">
                    {i < timeline.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={cls(
                          'absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 rounded',
                          i < step ? 'bg-primary' : 'bg-lavender-200',
                        )}
                      />
                    )}
                    <span
                      className={cls(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 transition',
                        done
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-lavender-200 bg-white text-ink-soft/50',
                        isCurrent && 'ring-4 ring-primary/20',
                      )}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="pt-1.5">
                      <p className={cls('text-sm font-semibold', done ? 'text-ink' : 'text-ink-soft/60')}>
                        {t.label}
                      </p>
                      {isCurrent && (
                        <p className="mt-0.5 text-xs font-medium text-primary-dark">Current stage</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Possible match */}
          <div className="flex flex-col rounded-3xl border border-lavender-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Possible Match</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  FINDIT compares photos, descriptions and locations to find connections.
                </p>
              </div>
              <span className="badge shrink-0 bg-primary-soft text-primary-dark">
                <Sparkles size={12} aria-hidden="true" /> AI Assisted
              </span>
            </div>

            {match ? (
              <div className="mt-6 animate-fade-in">
                <div className="flex items-center gap-4 rounded-2xl border border-lavender-200 p-4">
                  <ItemImage
                    src={match.image}
                    alt={match.title}
                    className="h-16 w-20 shrink-0 overflow-hidden rounded-xl"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                      {match.type === 'found' ? 'Found' : 'Lost'} item
                    </span>
                    <p className="truncate font-semibold text-ink">{match.title}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-soft">
                      <MapPin size={11} aria-hidden="true" /> {match.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-5 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="badge bg-white/15 text-white">Possible match found</p>
                      <p className="mt-2 text-3xl font-extrabold">{match.similarity}% similarity</p>
                    </div>
                    <Sparkles size={26} className="opacity-50" aria-hidden="true" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${match.similarity}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/85">
                    Similar category, location and visual characteristics.
                  </p>
                </div>

                <Button className="mt-5 w-full" onClick={() => navigate(`/item/${match.id}`)}>
                  View Possible Match <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-lavender-200 bg-lavender-50/60 p-8 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Sparkles size={26} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">Check for a possible match</h3>
                <p className="mt-1 max-w-xs text-sm text-ink-soft">
                  Run a smart matching scan against all campus reports.
                </p>
                <Button className="mt-5" onClick={viewMatch} loading={matchLoading}>
                  <Sparkles size={16} aria-hidden="true" /> View Possible Match
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim modal */}
      <Modal
        open={claimModal}
        onClose={() => setClaimModal(false)}
        title={isFound ? 'Claim This Item' : 'I Found This Item'}
        description={
          isFound
            ? 'Tell us why this belongs to you. Your details help the reporter verify ownership.'
            : 'Submit a report to help reconnect this item with its owner.'
        }
        confirmLabel={isFound ? 'Submit Claim' : 'Submit Report'}
        onConfirm={submitClaim}
        loading={claiming}
      >
        <label htmlFor="claim-desc" className="input-label">
          Verification details
        </label>
        <textarea
          id="claim-desc"
          rows={4}
          value={claimDescription}
          onChange={(e) => setClaimDescription(e.target.value)}
          placeholder={
            isFound
              ? 'e.g. It has my name sticker on the back and a small scratch on the corner…'
              : 'Describe what you found and where the item should be handed over…'
          }
          className="input resize-none"
        />
        <p className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
          <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
          Only the verified owner will receive your contact details.
        </p>
      </Modal>
      <Modal
        open={receiveModal}
        onClose={() => setReceiveModal(false)}
        title="I found this item"
        description="Confirm that you received your lost item. This report will be removed from the public Lost Items list."
        confirmLabel="Submit Recovery"
        loading={receiving}
        onConfirm={markReceived}
      >
        <label htmlFor="receive-message" className="input-label">How did you get it back?</label>
        <textarea
          id="receive-message"
          rows={4}
          value={receiveMessage}
          onChange={(event) => setReceiveMessage(event.target.value)}
          className="input resize-none"
          placeholder="I got it back from the campus help desk. Thank you!"
        />
      </Modal>
    </div>
  );
}
