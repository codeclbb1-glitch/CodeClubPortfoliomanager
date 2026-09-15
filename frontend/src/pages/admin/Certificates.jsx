import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { Award, Plus, Search, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function AdminCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [joiningDate, setJoiningDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [progress, setProgress] = useState('');
  const [ceoReview, setCeoReview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newCertSuccess, setNewCertSuccess] = useState(null);

  const [revokeCertId, setRevokeCertId] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  const [deleteCertId, setDeleteCertId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [editCert, setEditCert] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/certificates?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setCertificates(res.data.certificates || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  function resetCreateForm() {
    setStudentName('');
    setEmail('');
    setCourseName('');
    setInstructorName('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setJoiningDate('');
    setCompletionDate('');
    setProgress('');
    setCeoReview('');
    setFormError('');
    setNewCertSuccess(null);
  }

  function openCreateModal() {
    resetCreateForm();
    setShowCreateModal(true);
  }

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    setFormError('');
    setNewCertSuccess(null);

    if (!studentName || !courseName || !instructorName) {
      setFormError('Please enter Student, Course, and Instructor names.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/certificates', {
        studentName,
        courseName,
        instructorName,
        issueDate: issueDate || undefined,
        email: email || undefined,
        joiningDate: joiningDate || undefined,
        completionDate: completionDate || undefined,
        progress: progress || undefined,
        ceoReview: ceoReview || undefined
      });

      if (res.data.success) {
        setNewCertSuccess(res.data);
        resetCreateForm();
        setPage(1);
        fetchCertificates();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate certificate.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeCertId) return;
    setRevokeLoading(true);
    setRevokeError('');
    try {
      await api.patch(`/certificates/${revokeCertId}/revoke`);
      setRevokeCertId(null);
      fetchCertificates();
    } catch (err) {
      setRevokeError(err.response?.data?.message || 'Failed to revoke certificate.');
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCertId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/certificates/${deleteCertId}`);
      setDeleteCertId(null);
      fetchCertificates();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete certificate.');
    } finally {
      setDeleteLoading(false);
    }
  };

  function openEditModal(cert) {
    setEditCert({
      ...cert,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      joiningDate: cert.joiningDate ? new Date(cert.joiningDate).toISOString().split('T')[0] : '',
      completionDate: cert.completionDate ? new Date(cert.completionDate).toISOString().split('T')[0] : ''
    });
    setEditError('');
    setEditSuccess('');
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editCert) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      await api.patch(`/certificates/${editCert.certificateId}`, {
        studentName: editCert.studentName,
        email: editCert.email || undefined,
        courseName: editCert.courseName,
        instructorName: editCert.instructorName,
        issueDate: editCert.issueDate || undefined,
        joiningDate: editCert.joiningDate || undefined,
        completionDate: editCert.completionDate || undefined,
        progress: editCert.progress || undefined,
        ceoReview: editCert.ceoReview || undefined
      });
      setEditSuccess('Certificate updated successfully');
      setTimeout(() => {
        setEditCert(null);
        fetchCertificates();
      }, 600);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update certificate.');
    } finally {
      setEditLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeCount = certificates.filter(c => c.status === 'Active').length;
  const revokedCount = certificates.filter(c => c.status === 'Revoked').length;

  const inputClass = 'w-full px-3.5 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal';
  const labelClass = 'block text-xs font-mono tracking-wider uppercase text-muted mb-1.5';

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-6xl flex flex-col">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display text-3xl font-bold">Manage Certificates</h1>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-teal transition-colors"
          >
            <Plus className="w-4 h-4" />
            Issue Certificate
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-hair rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted font-medium">Total Registered</p>
            <p className="text-2xl font-bold text-ink mt-1">{total}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-emerald-700 font-medium">Active & Valid</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-amber-700 font-medium">Revoked / Suspended</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{revokedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-hair rounded-xl p-4 flex gap-3 shadow-sm mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student, course, ID..."
              className="w-full pl-9 pr-4 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal"
            />
          </div>
          <span className="bg-paper border border-hair text-muted rounded-lg px-4 py-2 text-xs font-semibold flex items-center font-mono uppercase whitespace-nowrap">
            {total} Total
          </span>
        </div>

        <div className="bg-white border border-hair rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="p-12 text-center text-muted">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-teal mr-2"></div>
              Loading registry...
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm h-full">
                <thead>
                  <tr className="bg-paper border-b border-hair text-xs font-mono tracking-wider uppercase text-muted">
                    <th className="p-4 font-semibold">Certificate ID / Recipient</th>
                    <th className="p-4 font-semibold">Course</th>
                    <th className="p-4 font-semibold">Dates / Progress</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-muted">
                        No matching certificate entries found.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert._id} className="border-b border-hair hover:bg-paper/30 transition-colors">
                        <td className="p-4">
                          <p className="font-mono text-xs font-semibold text-ink">{cert.certificateId}</p>
                          <p className="text-sm font-semibold text-teal mt-0.5">{cert.studentName}</p>
                          {cert.email && <p className="text-xs text-muted">{cert.email}</p>}
                        </td>
                        <td className="p-4 text-xs font-medium leading-relaxed">
                          <p className="font-semibold">{cert.courseName}</p>
                          <p className="text-muted text-[10px] mt-0.5">By: {cert.instructorName}</p>
                        </td>
                        <td className="p-4 text-xs font-medium leading-relaxed">
                          {cert.joiningDate && <p>Joined: {formatDate(cert.joiningDate)}</p>}
                          {cert.completionDate && <p>Completed: {formatDate(cert.completionDate)}</p>}
                          {cert.progress && <p className="text-muted mt-0.5">{cert.progress}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border ${
                            cert.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal(cert)}
                            className="text-teal font-semibold hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'https://code-club-portfoliomanager-obqd.vercel.app/api'}/certificates/${cert.certificateId}/pdf`}
                            download
                            className="text-teal font-semibold hover:underline text-xs"
                          >
                            PDF
                          </a>
                          {cert.status === 'Active' && (
                            <button
                              onClick={() => setRevokeCertId(cert.certificateId)}
                              className="text-red-600 font-semibold hover:underline text-xs"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteCertId(cert.certificateId)}
                            className="text-red-700 font-semibold hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="bg-paper/40 border-t border-hair px-4 py-3.5 flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="border border-hair rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <span className="text-xs text-muted font-medium">
                Page {page} of {pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                className="border border-hair rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-6 max-w-2xl w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">Issue New Certificate</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-red-600 text-xs font-medium">{formError}</p>
            )}

            {newCertSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <p className="text-sm font-semibold text-emerald-800">Certificate Created!</p>
                  <p className="text-xs font-mono mt-1 text-emerald-600">{newCertSuccess.certificate.certificateId}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={newCertSuccess.qrCode}
                    alt="Verification QR Code"
                    className="w-36 h-36 border border-hair rounded-lg p-1 bg-paper"
                  />
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${newCertSuccess.certificate.certificateId}/pdf`}
                    download
                    className="text-xs text-teal font-semibold hover:underline"
                  >
                    Download PDF Certificate
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Student Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. Ahmad Ali"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Course Name *</label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. Full-Stack Web Development"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Instructor Name *</label>
                  <input
                    type="text"
                    required
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. Haris Ali"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Completion Date</label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Progress</label>
                <input
                  type="text"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="e.g. Completed all modules with 92% score"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>CEO Review</label>
                <textarea
                  value={ceoReview}
                  onChange={(e) => setCeoReview(e.target.value)}
                  rows="3"
                  placeholder="Review or remarks from CEO..."
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-hair rounded-lg py-2.5 text-xs font-semibold hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-teal hover:bg-teal/90 text-white rounded-lg py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Generating...' : 'Generate Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeCertId && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="text-center">
              <span className="text-3xl">Warning</span>
            </div>
            <h3 className="font-display text-xl font-bold text-ink text-center">
              Confirm Revocation
            </h3>
            <p className="text-xs text-muted leading-relaxed text-center">
              Are you sure you want to revoke the certificate <code className="bg-paper px-1 py-0.5 rounded border border-hair font-mono font-bold text-ink text-[11px]">{revokeCertId}</code>?
              <br/><span className="text-red-600 font-medium">This action cannot be undone and will remain in the security audit history.</span>
            </p>

            {revokeError && (
              <p className="text-red-600 text-xs font-medium text-center">{revokeError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                disabled={revokeLoading}
                onClick={() => setRevokeCertId(null)}
                className="flex-1 border border-hair rounded-lg py-2.5 text-xs font-semibold hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={revokeLoading}
                onClick={handleRevokeConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-xs font-semibold transition-colors"
              >
                {revokeLoading ? 'Revoking...' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteCertId && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="text-center">
              <span className="text-3xl">Delete</span>
            </div>
            <h3 className="font-display text-xl font-bold text-ink text-center">
              Confirm Deletion
            </h3>
            <p className="text-xs text-muted leading-relaxed text-center">
              Are you sure you want to permanently delete certificate <code className="bg-paper px-1 py-0.5 rounded border border-hair font-mono font-bold text-ink text-[11px]">{deleteCertId}</code>?
              <br/><span className="text-red-600 font-medium">This action cannot be undone.</span>
            </p>

            {deleteError && (
              <p className="text-red-600 text-xs font-medium text-center">{deleteError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                disabled={deleteLoading}
                onClick={() => setDeleteCertId(null)}
                className="flex-1 border border-hair rounded-lg py-2.5 text-xs font-semibold hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white rounded-lg py-2.5 text-xs font-semibold transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCert && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-6 max-w-2xl w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">Edit Certificate</h3>
              <button
                onClick={() => setEditCert(null)}
                className="text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-red-600 text-xs font-medium">{editError}</p>
            )}
            {editSuccess && (
              <p className="text-emerald-700 text-xs font-medium">{editSuccess}</p>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Student Name *</label>
                  <input
                    type="text"
                    required
                    value={editCert.studentName}
                    onChange={(e) => setEditCert({ ...editCert, studentName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={editCert.email || ''}
                    onChange={(e) => setEditCert({ ...editCert, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Course Name *</label>
                  <input
                    type="text"
                    required
                    value={editCert.courseName}
                    onChange={(e) => setEditCert({ ...editCert, courseName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Instructor Name *</label>
                  <input
                    type="text"
                    required
                    value={editCert.instructorName}
                    onChange={(e) => setEditCert({ ...editCert, instructorName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Joining Date</label>
                  <input
                    type="date"
                    value={editCert.joiningDate || ''}
                    onChange={(e) => setEditCert({ ...editCert, joiningDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Completion Date</label>
                  <input
                    type="date"
                    value={editCert.completionDate || ''}
                    onChange={(e) => setEditCert({ ...editCert, completionDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input
                    type="date"
                    value={editCert.issueDate || ''}
                    onChange={(e) => setEditCert({ ...editCert, issueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Progress</label>
                <input
                  type="text"
                  value={editCert.progress || ''}
                  onChange={(e) => setEditCert({ ...editCert, progress: e.target.value })}
                  placeholder="e.g. Completed all modules with 92% score"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>CEO Review</label>
                <textarea
                  value={editCert.ceoReview || ''}
                  onChange={(e) => setEditCert({ ...editCert, ceoReview: e.target.value })}
                  rows="3"
                  placeholder="Review or remarks from CEO..."
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCert(null)}
                  className="flex-1 border border-hair rounded-lg py-2.5 text-xs font-semibold hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-teal hover:bg-teal/90 text-white rounded-lg py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
