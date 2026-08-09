import { Link } from 'react-router-dom';
import {
  BellRing,
  Search,
  Sparkles,
  Fingerprint,
  ShieldCheck,
  Undo2,
  ArrowRight,
  BadgeCheck,
  Camera,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import Section from '../components/Section';
import Button from '../components/Button';

const steps = [
  {
    icon: BellRing,
    title: '1. Report',
    heading: 'Tell us what you lost or found',
    body: 'Create a report in under a minute. Add the item name, category, location, a description and a photo. The more detail you share, the easier it is to match.',
    highlights: ['Photo upload', 'Category & brand tags', 'Campus locations'],
  },
  {
    icon: Search,
    title: '2. Search',
    heading: 'Search through campus reports',
    body: 'Browse live reports from libraries, cafeterias, labs and hostels. Filter by category, location or date — or just search for anything you recognise.',
    highlights: ['Smart filters', 'Instant search', 'Sort by recency'],
  },
  {
    icon: Sparkles,
    title: '3. Smart Match',
    heading: 'Find possible matches using item details',
    body: 'FINDIT compares descriptions, categories, colours, locations and photos to suggest possible matches. See a similarity score before you reach out.',
    highlights: ['AI-assisted similarity', 'Match scores', 'Instant alerts'],
  },
  {
    icon: Fingerprint,
    title: '4. Claim',
    heading: 'Submit a verified claim',
    body: 'Think it\u2019s yours? Submit a claim with identifying details only the real owner would know — like a sticker, a scratch or a serial number.',
    highlights: ['Verification questions', 'Owner approval', 'Claim tracking'],
  },
  {
    icon: ShieldCheck,
    title: '5. Verify',
    heading: 'Confirm ownership safely',
    body: 'Campus admins review every claim. Ownership is confirmed against your description and photos before anything changes hands.',
    highlights: ['Admin review', 'Photo comparison', 'Fraud protection'],
  },
  {
    icon: Undo2,
    title: '6. Return',
    heading: 'Safely reunite with your item',
    body: 'Pick up your item at the campus Lost & Found desk or meet the finder on campus. Both sides confirm the return, and everyone can move on.',
    highlights: ['Safe handover points', 'Return confirmation', 'Success stories'],
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-white">
      <Section className="bg-lavender-50 !py-16 sm:!py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge bg-primary-soft text-primary-dark">
            <Sparkles size={12} aria-hidden="true" /> Six simple steps
          </span>
          <h1 className="section-title mt-4">How FINDIT Works</h1>
          <p className="section-sub">
            From “I lost it” to “I found it again” — here's the full journey of an item on FINDIT.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {['Report', 'Search', 'Smart Match', 'Claim', 'Verify', 'Return'].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-lavender-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-[10px] font-bold text-primary-dark">
                  {i + 1}
                </span>
                {label}
              </span>
              {i < 5 && <ArrowRight size={16} className="hidden text-primary/50 sm:block" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="card grid gap-6 p-6 transition hover:border-primary/30 hover:shadow-lift sm:p-8 lg:grid-cols-[300px_1fr]"
            >
              <div className="flex items-start gap-4 lg:flex-col lg:gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-card">
                  <step.icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-dark">{step.title}</p>
                  <h2 className="mt-1 text-xl font-bold text-ink">{step.heading}</h2>
                </div>
              </div>
              <div className="lg:border-l lg:border-lavender-200 lg:pl-8">
                <p className="max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">{step.body}</p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {step.highlights.map((h) => (
                    <li
                      key={h}
                      className="inline-flex items-center gap-1.5 rounded-full bg-lavender-50 px-3 py-1.5 text-xs font-semibold text-primary-dark"
                    >
                      <BadgeCheck size={13} aria-hidden="true" /> {h}
                    </li>
                  ))}
                </ul>
                {i === 2 && (
                  <p className="mt-4 max-w-lg rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-4 text-sm text-white">
                    <strong>Did you know?</strong> FINDIT is adding AI photo matching — upload a photo and
                    we'll find visually similar items automatically.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-lavender-50">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Camera size={19} aria-hidden="true" />
              </span>
              <h3 className="font-bold text-ink">Add a good photo</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Well-lit, clear photos of your item dramatically improve the chances of a match.
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <MapPin size={19} aria-hidden="true" />
              </span>
              <h3 className="font-bold text-ink">Be specific on location</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              “Central Library, 3rd floor, near the window tables” beats “library” every time.
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <MessageSquare size={19} aria-hidden="true" />
              </span>
              <h3 className="font-bold text-ink">Respond fast</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Matches often appear within hours. Check notifications and respond quickly.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-12 text-center shadow-lift sm:px-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Lost something or found something? It takes less than a minute to report it.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/report-lost">
              <Button size="lg" className="w-full bg-white text-primary-dark hover:bg-lavender-50 sm:w-auto">
                Report Lost Item
              </Button>
            </Link>
            <Link to="/report-found">
              <Button size="lg" variant="secondary" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 sm:w-auto">
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}