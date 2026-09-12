import { Link } from 'react-router-dom';

// Signature element: job listings styled like a ticket stub — a "pass" to the next role.
// The dashed perforation + notches separate the role/company from the practical details.
export default function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative block bg-white border border-hair rounded-2xl overflow-hidden hover:border-ink/30 hover:shadow-[0_8px_24px_-8px_rgba(20,35,29,0.18)] transition-all duration-200"
    >
      {/* Top: role + company */}
      <div className="p-5 pb-6">
        <p className="font-mono text-[11px] tracking-widest uppercase text-teal mb-2">
          {job.job_type || 'Full-time'}
        </p>
        <h3 className="font-display text-xl leading-snug text-ink group-hover:text-teal transition-colors">
          {job.title}
        </h3>
        <p className="text-sm text-muted mt-1">{job.company}</p>
      </div>

      {/* Perforation divider with notches */}
      <div className="relative flex items-center">
        <span className="absolute -left-2.5 w-5 h-5 rounded-full bg-paper border border-hair" />
        <div className="flex-1 border-t border-dashed border-hair mx-3" />
        <span className="absolute -right-2.5 w-5 h-5 rounded-full bg-paper border border-hair" />
      </div>

      {/* Bottom: practical details */}
      <div className="p-5 pt-4 flex items-center justify-between">
        <div className="text-xs text-muted space-y-1">
          <p>📍 {job.location}</p>
          {job.salary && <p className="font-mono text-ink">{job.salary}</p>}
        </div>
        {job.status !== 'active' || (job.deadline && new Date() > new Date(job.deadline)) ? (
          <span className="font-mono text-[10px] tracking-wide bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase font-semibold">
            Closed
          </span>
        ) : (
          <span className="font-mono text-[11px] tracking-wide text-gold-dark opacity-0 group-hover:opacity-100 transition-opacity">
            VIEW →
          </span>
        )}
      </div>
    </Link>
  );
}
