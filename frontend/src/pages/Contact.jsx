import { ArrowUpRight, Github, Mail, MapPin, UserRound } from 'lucide-react';
import Section from '../components/Section';

export default function Contact() {
  return (
    <div className="bg-lavender-50">
      <Section className="!py-16 sm:!py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="badge bg-primary-soft text-primary-dark">Contact</span>
          <h1 className="section-title mt-4">Get in touch</h1>
          <p className="section-sub">Have feedback about FINDIT or need help with a report? Reach out to the developer.</p>
        </div>
        <div className="mx-auto mt-10 max-w-lg card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><UserRound size={22} /></span>
            <div><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Developer</p><p className="text-lg font-bold text-ink">Karthik</p></div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-ink-soft">
            <p className="flex items-center gap-3"><Github size={16} className="text-primary" /><a className="font-medium text-primary-dark hover:underline" href="https://github.com/iamkarthik2004" target="_blank" rel="noreferrer">github.com/iamkarthik2004</a></p>
            <p className="flex items-center gap-3"><Mail size={16} className="text-primary" /> Use the GitHub profile to get in touch.</p>
            <p className="flex items-center gap-3"><MapPin size={16} className="text-primary" /> FINDIT campus lost &amp; found</p>
          </div>
          <a
            href="https://github.com/iamkarthik2004"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Visit GitHub profile <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </Section>
    </div>
  );
}
