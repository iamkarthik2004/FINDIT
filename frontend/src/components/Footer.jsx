import { Link } from 'react-router-dom';
import { MapPin, Mail, Heart, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Lost Items', to: '/lost' },
      { label: 'Found Items', to: '/found' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { label: 'Report Lost Item', to: '/report-lost' },
      { label: 'Report Found Item', to: '/report-found' },
      { label: 'My Reports', to: '/my-reports' },
      { label: 'My Claims', to: '/claims' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'Admin Dashboard', to: '/admin' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-lavender-200 bg-lavender-50">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              FINDIT is a smart campus lost &amp; found platform that helps students quickly report,
              discover and recover lost belongings.
            </p>
            <p className="mt-3 text-sm font-semibold text-primary-dark">Lost it? Find it. Found it? Return it.</p>
            <div className="mt-5 space-y-2 text-sm text-ink-soft">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" aria-hidden="true" /> Greenfield Institute of Technology
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-primary" aria-hidden="true" /> support@findit.campus
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label + l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink-soft transition hover:text-primary-dark hover:underline underline-offset-4 focus:outline-none focus:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-lavender-200 pt-6 text-xs text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} FINDIT — Smart Campus Lost &amp; Found. All rights reserved.</p>
          <p className="inline-flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" aria-hidden="true" /> Safe campus
            </span>
            <span className="inline-flex items-center gap-1.5">
              Built with <Heart size={13} className="text-error" aria-hidden="true" /> for students
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
