import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function loadJobs() {
    setLoading(true);
    api.get('/jobs/admin/all', {
      params: { search, status: statusFilter }
    })
    .then((res) => setJobs(res.data.jobs || []))
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadJobs();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  function handleDeleteClick(id, title) {
    setDeleteConfirm({ show: true, id, title });
  }

  async function handleConfirmDelete() {
    const { id } = deleteConfirm;
    try {
      await api.delete(`/jobs/${id}`);
      loadJobs();
    } catch (err) {
      alert('Failed to delete job');
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-ink animate-fade-in">All Jobs</h1>
            <p className="text-muted text-sm mt-1">Manage positions, monitor application statuses, and edit listings.</p>
          </div>
          <Link to="/admin/jobs/create" className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors">
            + Create Job
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="grid md:grid-cols-4 gap-3 mb-6 bg-white border border-hair p-4 rounded-xl shadow-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or skills..."
            className="border border-hair rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-teal text-sm md:col-span-3"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-hair rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-teal text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t">
                    <td className="p-3 font-medium">{job.title}</td>
                    <td className="p-3">{job.company}</td>
                    <td className="p-3">{job.location}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-3">
                      <Link to={`/admin/jobs/edit/${job.id}`} className="text-teal hover:underline">Edit</Link>
                      <button onClick={() => handleDeleteClick(job.id, job.title)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No jobs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={deleteConfirm.show}
          title={deleteConfirm.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, id: null, title: '' })}
        />
      </main>
    </div>
  );
}
