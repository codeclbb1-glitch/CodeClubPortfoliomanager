import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard.jsx';
import { initialJobs } from '../data/initialData';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api
      .get('/jobs', { params: { search, location, job_type: jobType, page, limit: 9 } })
      .then((res) => {
        if (res.data?.jobs && res.data.jobs.length > 0) {
          setJobs(res.data.jobs);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error('Failed to load jobs from API, using fallback:', err);
      })
      .finally(() => setLoading(false));
  }, [search, location, jobType, page]);

  function handleFilter(e) {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search });
  }

  const inputClass =
    'border border-hair rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:border-teal transition-colors text-sm';

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3">Browse</p>
      <h1 className="font-display text-4xl text-ink mb-8">All open roles</h1>

      <form onSubmit={handleFilter} className="grid md:grid-cols-4 gap-3 mb-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, company, skills"
          className={`${inputClass} md:col-span-2`}
        />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        >
          <option value="">All locations</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputClass}>
          <option value="">All types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        <button className="bg-ink text-paper rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-teal transition-colors md:col-span-4 md:w-40">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-muted">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-hair rounded-2xl">
          <p className="font-display text-xl text-ink mb-1">No matches yet</p>
          <p className="text-muted text-sm">Try a broader search term or clear the filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-full text-sm font-mono transition-colors ${
                p === page ? 'bg-ink text-paper' : 'text-muted hover:bg-hair'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
