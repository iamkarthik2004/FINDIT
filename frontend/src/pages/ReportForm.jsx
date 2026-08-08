import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Sparkles, MapPin, Tag, HandHeart } from 'lucide-react';
import { itemService } from '../services';
import { CATEGORIES, LOCATIONS } from '../data/options';
import Button from '../components/Button';
import PhotoUpload from '../components/PhotoUpload';
import { useToast } from '../context/ToastContext';
import { cls } from '../utils/helpers';

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="input-label">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error" role="alert">
          <AlertCircle size={13} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

const selectClass = (error) => cls('input appearance-none !py-2.5 pr-9', error && 'input-error');
const localDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export default function ReportForm({ mode }) {
  const isLost = mode === 'lost';
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    date: localDateString(),
    description: '',
    brand: '',
    color: '',
    details: '',
    photo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (!submitted) window.scrollTo({ top: 0 });
  }, [submitted]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Please enter the item name.';
    if (!form.category) next.category = 'Please choose a category.';
    if (!form.location) next.location = 'Please choose a location.';
    if (!form.date) next.date = 'Please choose a date.';
    if (form.description.trim().length < 20) next.description = 'Please add a short description (at least 20 characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the highlighted fields.', 'error', 'Almost there');
      return;
    }
    setSubmitting(true);
    try {
      const item = await itemService.reportItem({
        type: mode,
        title: form.title.trim(),
        category: form.category,
        location: form.location,
        date: form.date,
        description: form.description.trim(),
        brand: form.brand.trim() || '—',
        color: form.color.trim() || '—',
        details: form.details.trim(),
        image: form.photo || undefined,
        matchScore: 0,
      });
      setSubmitted(item);
      toast(
        isLost ? 'Your lost item has been reported.' : 'Thank you for helping return a lost belonging.',
        'success',
        'Report submitted',
      );
    } catch (error) {
      toast(error.message || 'Unable to submit your report. Please try again.', 'error', 'Report not submitted');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- SUCCESS STATE ---------- */
  if (submitted) {
    return (
      <div className="bg-lavender-50">
        <div className="container-x flex justify-center py-16 sm:py-24">
          <div className="w-full max-w-lg animate-scale-in rounded-3xl border border-lavender-200 bg-white p-8 text-center shadow-card sm:p-12">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 size={40} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {isLost ? 'Your lost item has been reported.' : 'Thank you for helping return a lost belonging.'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              {isLost
                ? 'FINDIT will help you discover possible matches as soon as a similar item is reported.'
                : 'Your report is now live. The owner can claim the item once they verify the details you shared.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary-dark">
              <Sparkles size={16} aria-hidden="true" />
              {isLost ? 'Smart matching is now scanning for possible matches.' : 'Keep it safe at the campus Lost & Found desk.'}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate('/my-reports')}>View My Reports</Button>
              <Link to="/found">
                <Button variant="secondary" className="w-full sm:w-auto">Browse Found Items</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- FORM ---------- */
  return (
    <div className="bg-lavender-50" key={mode}>
      <div className="border-b border-lavender-200 bg-white">
        <div className="container-x py-10 sm:py-14">
          <span className="badge bg-primary-soft text-primary-dark">
            {isLost ? <AlertCircle size={12} aria-hidden="true" /> : <HandHeart size={12} aria-hidden="true" />}
            {isLost ? 'Report Lost' : 'Report Found'}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
          </h1>
          <p className="mt-2 max-w-xl text-base text-ink-soft">
            {isLost
              ? 'Give your item the best chance of being found.'
              : 'Help a classmate recover what they lost — it takes less than a minute.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="container-x py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <Tag size={18} className="text-primary" aria-hidden="true" /> Item Information
            </h2>
            <div className="mt-6 grid gap-5">
              <Field id="title" label={isLost ? 'Item name' : 'Item name *'} error={errors.title}>
                <input
                  id="title"
                  className={cls('input', errors.title && 'input-error')}
                  placeholder="e.g. Casio Scientific Calculator"
                  value={form.title}
                  onChange={set('title')}
                  autoFocus
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="category" label="Category *" error={errors.category}>
                  <select id="category" className={selectClass(errors.category)} value={form.category} onChange={set('category')}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field id="location" label={isLost ? 'Location lost *' : 'Location found *'} error={errors.location}>
                  <select
                    id="location"
                    className={cls(selectClass(errors.location), 'bg-white text-ink')}
                    value={form.location}
                    onChange={set('location')}
                  >
                    <option value="">Select a location</option>
                    {LOCATIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                  </select>
                </Field>
              </div>

              <Field id="date" label={isLost ? 'Date lost *' : 'Date found *'} error={errors.date}>
                <input
                  id="date"
                  type="date"
                  max={localDateString()}
                  className={cls('input', errors.date && 'input-error')}
                  value={form.date}
                  onChange={set('date')}
                />
              </Field>

              <Field id="description" label="Description *" error={errors.description}>
                <textarea
                  id="description"
                  rows={4}
                  className={cls('input resize-none', errors.description && 'input-error')}
                  placeholder="Describe the item — size, markings, condition, nearby area…"
                  value={form.description}
                  onChange={set('description')}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="brand" label="Brand">
                  <input id="brand" className="input" placeholder="e.g. Casio" value={form.brand} onChange={set('brand')} />
                </Field>
                <Field id="color" label="Colour">
                  <input id="color" className="input" placeholder="e.g. Black" value={form.color} onChange={set('color')} />
                </Field>
              </div>

              <Field id="details" label={isLost ? 'Optional identifying details' : 'Optional identifying details'}>
                <input
                  id="details"
                  className="input"
                  placeholder={isLost ? 'e.g. Initials "AM" on the back sticker' : 'e.g. Kept safely at the helpdesk'}
                  value={form.details}
                  onChange={set('details')}
                />
              </Field>
            </div>

            <div className="mt-6 rounded-2xl border border-lavender-200 bg-lavender-50/70 p-4 text-xs leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">Privacy &amp; safety:</strong> your photo and optional details
              are only shared after ownership is verified. Never share passwords, PINs or card numbers.
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <PhotoUpload value={form.photo} onChange={(photo) => setForm((f) => ({ ...f, photo }))} label="Item photo" />
            </div>

            <Button type="submit" size="lg" className="w-full shadow-lift" loading={submitting}>
              {isLost ? 'Submit Lost Report' : 'Submit Found Report'}
              <MapPin size={17} aria-hidden="true" />
            </Button>
            <p className="text-center text-xs text-ink-soft">
              By submitting you agree to our campus community guidelines.
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
}
