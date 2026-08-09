import { Link } from 'react-router-dom';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-lavender-50 px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary-soft text-primary">
          <SearchX size={38} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink">404</h1>
        <p className="mt-2 text-base text-ink-soft">
          This page doesn't exist — or the item you're looking for isn't here.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Home
        </Link>
      </div>
    </div>
  );
}