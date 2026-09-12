import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobIdFilter, setJobIdFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: '' });

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  }

  // Fetch all jobs on mount to populate the job filter dropdown
  useEffect(() => {
    api.get('/jobs/admin/all')
      .then((res) => setJobs(res.data.jobs || []))
      .catch(() => {});
  }, []);

  function loadApplications() {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (jobIdFilter) params.job_id = jobIdFilter;
    if (search) params.search = search;
    if (dateFilter) params.date = dateFilter;

    api.get('/applications', { params })
      .then((res) => setApplications(res.data.applications || []))
      .finally(() => setLoading(false));
  }

  // Trigger search with debounce, other filters run immediately
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadApplications();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, jobIdFilter, search, dateFilter]);

  async function updateStatus(id, status) {
    try {
      await api.put(`/applications/${id}/status`, { status });
      showToast(`Application has been successfully ${status.toLowerCase()}!`, status === 'Accepted' ? 'success' : 'error');
      loadApplications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  }

  const badgeColor = { Pending: 'bg-yellow-100 text-yellow-700', Accepted: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-ink">Applications</h1>
            <p className="text-muted text-sm mt-1">Review candidates, filter by dates/positions, and accept or reject applications.</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid md:grid-cols-4 gap-3 mb-6 bg-white border border-hair p-4 rounded-xl shadow-sm">
          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">Search Candidates</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, skills..."
              className="w-full border border-hair rounded-lg px-3 py-2 bg-paper focus:outline-none focus:border-teal text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">Filter by Position</label>
            <select
              value={jobIdFilter}
              onChange={(e) => setJobIdFilter(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 bg-paper focus:outline-none focus:border-teal text-sm cursor-pointer"
            >
              <option value="">All Posted Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 bg-paper focus:outline-none focus:border-teal text-sm cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">Application Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 bg-paper focus:outline-none focus:border-teal text-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Job</th>
                  <th className="p-3">Applied On</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t">
                    <td className="p-3">
                      <Link to={`/admin/applications/${app.id}`} className="font-medium text-teal hover:underline">
                        {app.name}
                      </Link>
                      <p className="text-gray-500 text-xs">{app.email}</p>
                      {(app.linkedin || app.github) && (
                        <div className="flex gap-2 mt-1">
                          {app.linkedin && (
                            <a
                              href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-teal hover:underline font-mono"
                              title="LinkedIn Profile"
                            >
                              LinkedIn ↗
                            </a>
                          )}
                          {app.github && (
                            <a
                              href={app.github.startsWith('http') ? app.github : `https://${app.github}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-gray-700 hover:underline font-mono"
                              title="GitHub Profile"
                            >
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{app.job_title}</td>
                    <td className="p-3">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${badgeColor[app.status]}`}>{app.status}</span>
                    </td>
                     <td className="p-3">
                      {app.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmModal({ show: true, id: app.id, status: 'Accepted' })} 
                            className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-semibold px-2 py-0.5 rounded text-xs transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => setConfirmModal({ show: true, id: app.id, status: 'Rejected' })} 
                            className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold px-2 py-0.5 rounded text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No applications yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-sm font-semibold animate-toast pointer-events-auto flex items-center gap-2 border-l-4 ${
            toast.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700 border-l-red-500' 
              : 'bg-green-50 border-green-200 text-green-700 border-l-green-500'
          }`}>
            <style>{`
              @keyframes toastSlideIn {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .animate-toast {
                animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>
            <span className="text-lg">{toast.type === 'error' ? '✕' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        )}
        {/* Confirm Action Modal */}
        {confirmModal.show && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-paper border border-hair rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-ink">Confirm Status Change</h3>
              <p className="text-sm text-muted">
                Are you sure you want to change this application status to <span className={`font-semibold ${confirmModal.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{confirmModal.status}</span>?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ show: false, id: null, status: '' })}
                  className="px-4 py-2 border border-hair rounded-lg text-sm text-muted hover:bg-teal-light/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(confirmModal.id, confirmModal.status);
                    setConfirmModal({ show: false, id: null, status: '' });
                  }}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors ${
                    confirmModal.status === 'Accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
