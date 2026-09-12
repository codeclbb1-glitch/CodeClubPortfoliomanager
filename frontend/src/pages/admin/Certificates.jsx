import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { Award, Plus, Search, Trash2, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newCertSuccess, setNewCertSuccess] = useState(null);

  const [revokeCertId, setRevokeCertId] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState('');

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
        issueDate: issueDate || undefined
      });

      if (res.data.success) {
        setNewCertSuccess(res.data);
        setStudentName('');
        setCourseName('');
        setInstructorName('');
        setIssueDate(new Date().toISOString().split('T')[0]);
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

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-6xl">
        <h1 className="font-display text-3xl font-bold mb-8">Manage Certificates</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-hair rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold border-b border-hair pb-3 mb-4">Issue Certificate</h2>

              <form onSubmit={handleCreateCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-muted mb-1.5">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. Ahmad Ali"
                    className="w-full px-3.5 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-muted mb-1.5">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. Full-Stack Web Development"
                    className="w-full px-3.5 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-muted mb-1.5">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. Haris Ali"
                    className="w-full px-3.5 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-muted mb-1.5">
                    Issue Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-hair rounded-lg text-sm bg-paper text-ink focus:outline-none focus:border-teal"
                  />
                </div>

                {formError && (
                  <p className="text-red-600 text-xs font-medium">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-teal hover:bg-teal/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Generating...' : 'Generate Certificate'}
                </button>
              </form>

              {newCertSuccess && (
                <div className="mt-6 border-t border-hair pt-5 space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-center">
                    <p className="text-sm font-semibold">Certificate Created!</p>
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
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
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

            <div className="bg-white border border-hair rounded-xl p-4 flex gap-3 shadow-sm">
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

            <div className="bg-white border border-hair rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-muted">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-teal mr-2"></div>
                  Loading registry...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-paper border-b border-hair text-xs font-mono tracking-wider uppercase text-muted">
                        <th className="p-4 font-semibold">Certificate ID / Recipient</th>
                        <th className="p-4 font-semibold">Course</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-12 text-center text-muted">
                            No matching certificate entries found.
                          </td>
                        </tr>
                      ) : (
                        certificates.map((cert) => (
                          <tr key={cert._id} className="border-b border-hair hover:bg-paper/30 transition-colors">
                            <td className="p-4">
                              <p className="font-mono text-xs font-semibold text-ink">{cert.certificateId}</p>
                              <p className="text-sm font-semibold text-teal mt-0.5">{cert.studentName}</p>
                            </td>
                            <td className="p-4 text-xs font-medium leading-relaxed">
                              <p className="font-semibold">{cert.courseName}</p>
                              <p className="text-muted text-[10px] mt-0.5">By: {cert.instructorName} • {formatDate(cert.issueDate)}</p>
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
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${cert.certificateId}/pdf`}
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
          </div>
        </div>
      </main>

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
    </div>
  );
}
