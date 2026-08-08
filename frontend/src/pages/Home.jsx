import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PackageSearch,
  BellRing,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  GraduationCap,
  Plus,
  BadgeCheck,
  ArrowDown,
  Heart,
} from 'lucide-react';
import { itemService } from '../services';
import ItemCard from '../components/ItemCard';
import SkeletonCard from '../components/SkeletonCard';
import Section from '../components/Section';

const quickActions = [
  {
    icon: BellRing,
    title: 'Report Lost',
    text: 'Lost something? Tell the campus.',
    to: '/report-lost',
    cta: 'Report now',
  },
  {
    icon: PackageSearch,
    title: 'Report Found',
    text: 'Found something? Help return it.',
    to: '/report-found',
    cta: 'Report now',
  },
  {
    icon: Search,
    title: 'Find an Item',
    text: 'Browse reported belongings.',
    to: '/found',
    cta: 'Search items',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    text: 'Discover possible matches faster.',
    to: '/how-it-works',
    cta: 'See how it works',
  },
];

const steps = [
  { n: '01', title: 'Report', desc: 'Tell us what you lost or found.' },
  { n: '02', title: 'Discover', desc: 'Search through campus reports.' },
  { n: '03', title: 'Match', desc: 'Find possible matches using item details.' },
  { n: '04', title: 'Return', desc: 'Verify the item and safely return it.' },
];

const features = [
  {
    icon: FileCheck2,
    title: 'Easy Reporting',
    desc: 'Describe your item, add a photo and submit in under a minute.',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    desc: 'AI-assisted similarity checks connect lost items with found ones faster.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe Claims',
    desc: 'Every return is verified with questions only the real owner can answer.',
  },
  {
    icon: GraduationCap,
    title: 'Campus Focused',
    desc: 'Built around campus life — libraries, cafeterias, hostels and labs.',
  },
];

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    itemService
      .getRecent(4)
      .then((data) => mounted && setRecent(data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary-soft/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[380px] w-[380px] rounded-full bg-lavender-100/80 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-x relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-bold tracking-widest text-primary-dark">
              <Sparkles size={13} aria-hidden="true" /> SMART CAMPUS LOST &amp; FOUND
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl xl:text-6xl">
              Lost it?<br />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Find it.
              </span>
              <br />
              Found it?<br />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Return it.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              FINDIT makes it easier for students to report lost belongings, discover found items and
              safely reconnect them with their owners.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/report-lost"
                className="btn-primary px-7 py-3.5 text-base shadow-lift"
              >
                Report Lost Item
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/found" className="btn-secondary px-7 py-3.5 text-base">
                Browse Found Items
              </Link>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
              <ShieldCheck size={16} className="text-primary" aria-hidden="true" />
              Built for smarter, safer campuses.
            </p>
          </div>

          <div className="relative animate-fade-in">
            <img
              src="/assets/hero.png"
              alt="Students using FINDIT on campus to find a lost belonging"
              className="hero-float aspect-[3/2] w-full rounded-3xl object-cover"
            />
            <div className="hero-message-float absolute right-2 top-6 flex items-center gap-3 rounded-[1.75rem] bg-white px-5 py-4 shadow-lift sm:right-6 sm:top-10">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-card">
                <Heart size={20} fill="currentColor" aria-hidden="true" />
              </span>
              <p className="max-w-[155px] text-sm font-bold leading-tight text-ink">
                Let&apos;s bring it<br />back together
              </p>
              <span className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <Section className="bg-white !py-12 sm:!py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ icon: Icon, title, desc, to, cta }) => (
            <Link
              key={title}
              to={to}
              className="card group p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-dark">
                {cta}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="bg-lavender-50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">How FINDIT Works</h2>
          <p className="section-sub">Four simple steps between “lost” and “reunited”.</p>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            className="absolute left-[12%] right-[12%] top-9 hidden border-t-2 border-dashed border-primary/30 lg:block"
            aria-hidden="true"
          />
          {steps.map((s) => (
            <div key={s.n} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-card">
                <span className="text-lg font-extrabold">{s.n}</span>
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY FINDIT */}
      <Section className="bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Why students choose FINDIT</h2>
          <p className="section-sub">Everything you need to get your belongings back — in one place.</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon size={21} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* RECENT ITEMS */}
      <Section className="bg-lavender-50 !py-14 sm:!py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title !text-2xl sm:!text-3xl">Recent Lost &amp; Found</h2>
            <p className="section-sub !text-sm sm:!text-base">Newest reports from across campus.</p>
          </div>
          <Link to="/lost" className="btn-secondary">
            View All Items <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : recent.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      </Section>

      {/* SMART MATCHING */}
      <Section className="bg-white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="badge bg-primary-soft text-primary-dark">AI Assisted</span>
            <h2 className="section-title mt-4 !text-3xl sm:!text-4xl">
              Smart Matching, <span className="text-primary">coming soon</span>
            </h2>
            <p className="section-sub mt-4 max-w-lg">
              FINDIT is training a multimodal AI that compares item photos, descriptions and
              locations — so a lost calculator and a found calculator find each other in seconds.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                'Photo similarity powered by AI vision models',
                'Category, brand and colour semantic matching',
                'Instant match alerts the moment an item appears',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/how-it-works" className="btn-secondary mt-8">
              <Sparkles size={16} aria-hidden="true" /> Discover matching
            </Link>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 m-auto h-[85%] w-[85%] rounded-full bg-primary-soft/70 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative space-y-4">
              <div className="card flex items-center gap-4 p-4 sm:p-5">
                <img
                  src="/assets/items/calculator.svg"
                  alt="Black Casio calculator reported as lost"
                  className="h-16 w-20 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <span className="badge bg-error-soft text-error">Lost</span>
                  <p className="mt-1.5 text-sm font-semibold text-ink">Black Casio Calculator</p>
                  <p className="text-xs text-ink-soft">Central Library · 2h ago</p>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
                  <Plus size={20} strokeWidth={3} aria-hidden="true" />
                </span>
              </div>

              <div className="card flex items-center gap-4 p-4 sm:p-5">
                <img
                  src="/assets/items/calculator-2.svg"
                  alt="Found Casio scientific calculator"
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <span className="badge bg-success-soft text-success">Found</span>
                  <p className="mt-1.5 text-sm font-semibold text-ink">Casio Scientific Calculator</p>
                  <p className="text-xs text-ink-soft">Science Block · 5h ago</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary to-primary-dark p-5 text-white shadow-lift">
                <Sparkles size={22} className="absolute right-5 top-5 opacity-40" aria-hidden="true" />
                <p className="badge bg-white/15 text-white">Possible Match</p>
                <p className="mt-3 text-3xl font-extrabold">92% similarity</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[92%] rounded-full bg-white" />
                </div>
                <p className="mt-3 text-sm text-white/85">Similar category, location and visual characteristics.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-white !pb-20 !pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-14 text-center shadow-lift sm:px-12 sm:py-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, #fff 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, #fff 1.5px, transparent 1.5px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Lost something on campus?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Report it on FINDIT and give your belongings a better chance of coming home.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/report-lost"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary-dark shadow-card transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                <Plus size={18} aria-hidden="true" /> Report Lost Item
              </Link>
              <Link
                to="/report-found"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                Found something? <ArrowDown size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
