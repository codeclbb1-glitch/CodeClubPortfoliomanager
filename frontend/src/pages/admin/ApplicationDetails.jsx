import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ show: false, status: '' });

  function load() {
    api.get(`/applications/${id}`).then((res) => setApp(res.data.application));
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus(status) {
    await api.put(`/applications/${id}/status`, { status });
    load();
  }

  if (!app) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">Loading...</main>
      </div>
    );
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <button onClick={() => navigate(-1)} className="text-teal text-sm mb-4">← Back</button>
        <h1 className="text-2xl font-bold mb-1">{app.name}</h1>
        <p className="text-gray-500 mb-6">Applied for {app.job_title} at {app.job_company}</p>

        <div className="border rounded-lg p-6 space-y-3 text-sm">
          <p><span className="font-medium">Email:</span> {app.email}</p>
          <p><span className="font-medium">Phone:</span> {app.phone}</p>
          {app.address && <p><span className="font-medium">Address:</span> {app.address}</p>}
          {app.education && <p><span className="font-medium">Education:</span> {app.education}</p>}
          {app.experience && <p><span className="font-medium">Experience:</span> {app.experience} {app.experience === '1' ? 'Year' : 'Years'}</p>}
          {app.skills && <p><span className="font-medium">Skills:</span> {app.skills}</p>}
          {app.linkedin && (
            <p>
              <span className="font-medium">LinkedIn:</span>{' '}
              <a
                href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal hover:underline font-semibold inline-flex items-center gap-1 break-all"
              >
                {app.linkedin} ↗
              </a>
            </p>
          )}
          {app.github && (
            <p>
              <span className="font-medium">GitHub:</span>{' '}
              <a
                href={app.github.startsWith('http') ? app.github : `https://${app.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal hover:underline font-semibold inline-flex items-center gap-1 break-all"
              >
                {app.github} ↗
              </a>
            </p>
          )}
          {app.cover_letter && (
            <div>
              <p className="font-medium mb-1">Cover Letter:</p>
              <p className="text-gray-700 whitespace-pre-line">{app.cover_letter}</p>
            </div>
          )}
          <p>
            <span className="font-medium">Resume:</span>{' '}
            <a
              href={app.resume?.startsWith('http') ? app.resume : `${apiBase}${app.resume}`}
              target="_blank"
              rel="noreferrer"
              className="text-teal hover:underline font-semibold inline-flex items-center gap-1"
            >
              View Document / PDF ↗
            </a>
          </p>
          <p><span className="font-medium">Status:</span> {app.status}</p>
        </div>

        {app.status === 'Pending' ? (
          <div className="flex gap-3 mt-6">
            <button onClick={() => setConfirmModal({ show: true, status: 'Accepted' })} className="bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 font-semibold text-sm transition-colors shadow-sm">
              Accept Application
            </button>
            <button onClick={() => setConfirmModal({ show: true, status: 'Rejected' })} className="bg-red-600 text-white px-5 py-2.5 rounded-full hover:bg-red-700 font-semibold text-sm transition-colors shadow-sm">
              Reject Application
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <span className="inline-block bg-teal-light/50 text-teal text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg border border-teal/15">
              Processed Status: {app.status}
            </span>
          </div>
        )}
      </main>

      {/* Action Confirmation Modal */}
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
                onClick={() => setConfirmModal({ show: false, status: '' })}
                className="px-4 py-2 border border-hair rounded-lg text-sm text-muted hover:bg-teal-light/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStatus(confirmModal.status);
                  setConfirmModal({ show: false, status: '' });
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
    </div>
  );
}
