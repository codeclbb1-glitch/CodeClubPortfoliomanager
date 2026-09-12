import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-32 text-center">
      <p className="font-display text-8xl text-hair">404</p>
      <p className="text-muted mt-4 mb-8">This page took a wrong turn.</p>
      <Link to="/" className="font-mono text-xs uppercase tracking-wide text-teal hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
