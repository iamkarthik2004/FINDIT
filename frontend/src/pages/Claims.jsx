import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileX2, CalendarDays, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { claimService } from '../services';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';

export default function Claims() {
  const navigate = useNavigate();
  const toast = useToast();

  const [claims, setClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [view, setView] = useState('sent');
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [thankTarget, setThankTarget] = useState(null);
  const [thankMessage, setThankMessage] = useState('I got this item. Thank you so much for keeping it safe and helping return it!');
  const [thanking, setThanking] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([claimService.getAll(), claimService.getReceived()])
      .then(([sent, received]) => {
        if (!mounted) return;
        setClaims(sent);
        setReceivedClaims(received);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const confirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      await claimService.remove(withdrawTarget.id);
      setClaims((c) => c.filter((x) => x.id !== withdrawTarget.id));
      toast('Claim withdrawn.', 'info');
      setWithdrawTarget(null);
    } finally {
      setWithdrawing(false);
    }
  };

  const pendingCount = claims.filter((c) => c.status === 'pending' || c.status === 'review').length;
  const visibleClaims = view === 'sent' ? claims : receivedClaims;

  const reviewClaim = async (claim, status) => {
    try {
      const updated = await claimService.updateReceived(claim.id, status);
      setReceivedClaims((list) => list.map((entry) => entry.id === claim.id ? updated : entry));
      toast(status === 'approved' ? 'Claim approved. The item is marked as returned.' : 'Claim rejected. The item is available again.', 'success');
    } catch (error) {
      toast(error.message || 'Unable to update this claim.', 'error');
    }
  };

  const submitThankYou = async () => {
    if (!thankTarget || thankMessage.trim().length < 3) return;
    setThanking(true);
    try {
      const updated = await claimService.submitThankYou(thankTarget.id, thankMessage.trim());
      setClaims((list) => list.map((entry) => entry.id === updated.id ? updated : entry));
      setThankTarget(null);
      toast('Thank-you message sent to the finder.', 'success');
    } catch (error) {
      toast(error.message || 'Unable to send your message.', 'error');
    } finally {
      setThanking(false);
    }
  };

  return (
    <div className="min-h-screen bg-lavender-50">
      <div className="border-b border-lavender-200 bg-white">
        <div className="container-x py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Claims</h1>
          <p className="mt-2 text-base text-ink-soft">
            {view === 'sent' && pendingCount > 0
              ? `${pendingCount} claim${pendingCount === 1 ? '' : 's'} waiting for verification.`
              : view === 'sent' ? 'Track the verification and return of every item you claim.' : 'Review claims submitted for items you found.'}
          </p>
        </div>
      </div>

      <div className="container-x py-8 sm:py-12">
        <div className="mb-6 flex w-fit rounded-full border border-lavender-200 bg-white p-1 shadow-soft">
          {[['sent', 'Claims I Sent', claims.length], ['received', 'Claims Received', receivedClaims.length]].map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setView(key)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === key ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary-dark'}`}>
              {label} <span className="ml-1 text-xs opacity-75">{count}</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-20 w-20 rounded-xl" />
                <div className="skeleton mt-3 h-4 w-1/3 rounded-full" />
                <div className="skeleton mt-2 h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : visibleClaims.length === 0 ? (
          <EmptyState
            icon={FileX2}
            title={view === 'sent' ? 'No claims yet' : 'No claims received'}
            description={view === 'sent' ? 'Found something that might be yours? Submit a claim and track it here.' : 'Claims submitted for your found reports will appear here.'}
            action={
              <Button variant="secondary" onClick={() => navigate('/found')}>
                Browse found items <ArrowRight size={16} aria-hidden="true" />
              </Button>
            }
          />
        ) : (
          <ul className="space-y-4">
            {visibleClaims.map((claim) => (
              <li
                key={claim.id}
                className="card flex flex-col gap-4 p-4 transition hover:border-primary/30 sm:flex-row sm:items-center sm:p-5"
              >
                <button
                  onClick={() => claim.item && navigate(`/item/${claim.item.id}`)}
                  className="flex flex-1 items-start gap-4 text-left"
                  aria-label={`View ${claim.itemTitle}`}
                >
                  <ItemImage src={claim.item?.image} alt={claim.itemTitle} className="h-16 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink">{claim.itemTitle}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                      <CalendarDays size={12} aria-hidden="true" />
                      {view === 'sent' ? 'Claimed' : 'Received'} {formatDate(claim.claimDate)}
                    </p>
                    {view === 'received' && claim.claimantName && (
                      <p className="mt-1 text-xs text-ink-soft">From <span className="font-semibold text-ink">{claim.claimantName}</span> · {claim.claimantEmail}</p>
                    )}
                    {view === 'received' && <p className="mt-2 line-clamp-2 rounded-lg bg-lavender-50 px-2.5 py-2 text-xs text-ink-soft">“{claim.message}”</p>}
                    {view === 'received' && claim.thankYouMessage && <p className="mt-2 line-clamp-2 rounded-lg bg-success-soft px-2.5 py-2 text-xs text-success">Thank you: “{claim.thankYouMessage}”</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary-dark">
                        <Sparkles size={11} aria-hidden="true" />
                        Match {claim.matchScore}%
                      </span>
                      <StatusBadge status={claim.status} />
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-3">
                  <div
                    className="hidden w-24 overflow-hidden rounded-full bg-lavender-100 sm:block"
                    role="img"
                    aria-label={`Match score ${claim.matchScore} percent`}
                  >
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary to-primary-light"
                      style={{ width: `${claim.matchScore}%` }}
                    />
                  </div>
                  {view === 'sent' && <Button variant="secondary" size="sm" onClick={() => claim.item && navigate(`/item/${claim.item.id}`)}>
                    View Claim <ArrowRight size={13} aria-hidden="true" />
                  </Button>}
                  {view === 'sent' && claim.status === 'approved' && !claim.thankYouMessage && <Button size="sm" onClick={() => setThankTarget(claim)}>
                    I Got This Item
                  </Button>}
                  {view === 'sent' && claim.thankYouMessage && <span className="text-xs font-semibold text-success">Message sent</span>}
                  {view === 'received' && claim.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => reviewClaim(claim, 'approved')}>
                        <CheckCircle2 size={14} aria-hidden="true" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => reviewClaim(claim, 'rejected')}>
                        <XCircle size={14} aria-hidden="true" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        title="Withdraw this claim?"
        description={`This will cancel your claim for “${withdrawTarget?.itemTitle}”. The item stays available for other students.`}
        confirmLabel="Withdraw Claim"
        destructive
        loading={withdrawing}
        onConfirm={confirmWithdraw}
      />
      <Modal
        open={Boolean(thankTarget)}
        onClose={() => setThankTarget(null)}
        title="I got this item"
        description={`Confirm that you received “${thankTarget?.itemTitle}” and send a message to the finder.`}
        confirmLabel="Send Confirmation"
        loading={thanking}
        onConfirm={submitThankYou}
      >
          <label htmlFor="thank-you-message" className="input-label">Confirmation message</label>
        <textarea
          id="thank-you-message"
          rows={4}
          value={thankMessage}
          onChange={(event) => setThankMessage(event.target.value)}
          className="input resize-none"
          placeholder="I got this item. Thank you for helping return it!"
        />
      </Modal>
    </div>
  );
}
