import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data.job)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="max-w-3xl mx-auto px-5 py-20 text-muted">Loading…</p>;
  if (!job) return <p className="max-w-3xl mx-auto px-5 py-20 text-muted">Job not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <Link to="/jobs" className="font-mono text-xs uppercase tracking-wide text-teal hover:underline">
        ← Back to jobs
      </Link>

      <div className="mt-6 bg-white border border-hair rounded-2xl p-8 md:p-10">
        <p className="font-mono text-[11px] tracking-widest uppercase text-teal mb-3">
          {job.job_type || 'Full-time'}
        </p>
        <h1 className="font-display text-4xl text-ink leading-tight">{job.title}</h1>
        <p className="text-gold-dark font-medium mt-2">{job.company}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted mt-5 pb-6 border-b border-hair">
          <span>📍 {job.location}</span>
          {job.salary && <span className="font-mono text-ink">{job.salary}</span>}
          {job.deadline && <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>}
        </div>

        <div className="mt-6">
          <h2 className="font-display text-lg text-ink mb-3">Description</h2>
          <p className="text-ink/80 whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        {job.requirements && (
          <div className="mt-8">
            <h2 className="font-display text-lg text-ink mb-3">Requirements</h2>
            <p className="text-ink/80 whitespace-pre-line leading-relaxed">{job.requirements}</p>
          </div>
        )}

        {job.skills && (
          <div className="mt-8">
            <h2 className="font-display text-lg text-ink mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.split(',').map((s) => (
                <span key={s} className="font-mono text-xs bg-teal-light text-teal px-3 py-1.5 rounded-full">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.status !== 'active' || (job.deadline && new Date() > new Date(job.deadline)) ? (
          <div className="mt-10 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-semibold flex items-center justify-between">
            <span>This position is currently closed for applications.</span>
            <span className="font-mono bg-red-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Closed</span>
          </div>
        ) : (
          <Link
            to={`/apply/${job.id}`}
            className="inline-block mt-10 bg-ink text-paper font-semibold px-8 py-3.5 rounded-full hover:bg-teal hover:text-white transition-all duration-300 shadow"
          >
            Apply for this role
          </Link>
        )}
      </div>
    </div>
  );
}
