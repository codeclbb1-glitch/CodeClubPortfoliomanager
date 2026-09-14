import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, ShieldAlert, ShieldX, Download, RefreshCw, AlertTriangle, ArrowLeft, BookOpen, User, Calendar } from 'lucide-react';

export default function PublicVerify() {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/certificates/verify/${certificateId}`);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Connection failed. Could not communicate with the verification server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [certificateId, retryCount]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal/20 border-t-teal rounded-full animate-spin"></div>
          <ShieldCheck className="w-8 h-8 text-teal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-ink mt-6">Verifying Cryptographic Signature...</h3>
        <p className="text-sm text-muted mt-2">Checking database and validating HMAC integrity hashes.</p>
      </div>
    );
  }

  if (error || (result && !result.verified)) {
    const isTampered = result && result.reason === 'TAMPERED';
    return (
      <div className="max-w-xl mx-auto px-5 py-16">
        <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-500 mb-5">
              <ShieldX className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-red-900">
              {isTampered ? 'Tampering Detected' : 'Invalid Certificate'}
            </h3>

            <p className="text-sm text-red-700 mt-3 max-w-md">
              {isTampered
                ? 'Warning! This certificate database entry exists but its HMAC signature failed verification. The record might have been modified outside of the application server.'
                : `We could not find any certificate matching ID "${certificateId}" in our verification registry. Please check the ID and try again.`
              }
            </p>

            {isTampered && result?.certificate && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-5 mt-6 text-left space-y-2">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-widest">Tampered Data Signature Details</p>
                <p className="text-sm text-ink"><strong className="text-muted">ID:</strong> {result.certificate.certificateId}</p>
                <p className="text-sm text-ink"><strong className="text-muted">Student:</strong> {result.certificate.studentName}</p>
                <p className="text-sm text-ink"><strong className="text-muted">Course:</strong> {result.certificate.courseName}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Link
                to="/verify"
                className="flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-2.5 rounded-lg w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Verify</span>
              </Link>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex items-center justify-center gap-2 bg-white border border-hair hover:bg-paper text-ink px-5 py-2.5 rounded-lg w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { verified, status, certificate } = result || {};
  const isRevoked = status === 'Revoked';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cleanCourse = (certificate?.courseName || 'Frontend developer')
    .replace(/course|certified|bootcamp/gi, '')
    .trim();
  if (!cleanCourse.toLowerCase().includes('developer') && !cleanCourse.toLowerCase().includes('designer') && !cleanCourse.toLowerCase().includes('engineer')) {
    cleanCourse += ' developer';
  }
  const firstLetter = cleanCourse.charAt(0).toLowerCase();
  const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';

  const endDateVal = new Date(certificate?.issueDate || Date.now());
  const startDateVal = new Date(endDateVal.getTime() - 28 * 24 * 60 * 60 * 1000);
  const formattedStart = formatDate(startDateVal);
  const formattedEnd = formatDate(endDateVal);

  const joiningFormatted = formatDate(certificate?.joiningDate);
  const completionFormatted = formatDate(certificate?.completionDate);

  if (isRevoked) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-500 mb-5">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-amber-900">Certificate Revoked</h3>
            <p className="text-sm text-amber-700 mt-2 text-center max-w-md">
              This certificate was officially generated by CodeClub, but has since been marked as <strong>Revoked</strong> and is no longer active.
            </p>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 border-y border-hair py-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-xs text-muted uppercase">Student Name</p>
                  <p className="text-base font-semibold text-ink">{certificate?.studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-xs text-muted uppercase">Course Completed</p>
                  <p className="text-base font-semibold text-ink">{certificate?.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-xs text-muted uppercase">Issue Date</p>
                  <p className="text-base font-semibold text-ink">{formattedEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted uppercase">Status</p>
                  <p className="text-base font-semibold text-amber-600">Revoked</p>
                </div>
              </div>
            </div>

            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-left">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Revocation Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-900">
                <p><strong>Revoked By:</strong> {certificate?.revokedBy || 'System Administrator'}</p>
                <p><strong>Revoked On:</strong> {certificate?.revokedAt ? formatDate(certificate.revokedAt) : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/verify"
                className="flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Check Another ID</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mb-5">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-bold text-emerald-900">Verified</h3>
          <p className="text-sm text-emerald-700 mt-2 text-center max-w-md">
            This certificate is authentic, issued by <strong>CodeClub</strong>, and cryptographically validated.
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-y border-hair py-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Student Name</p>
                <p className="text-lg font-bold text-ink">{certificate?.studentName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Course Name</p>
                <p className="text-lg font-bold text-ink">{certificate?.courseName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Issue Date</p>
                <p className="text-lg font-bold text-ink">{formattedEnd}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Instructor</p>
                <p className="text-lg font-bold text-ink">{certificate?.instructorName}</p>
              </div>
            </div>
            {joiningFormatted && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Joining Date</p>
                  <p className="text-lg font-bold text-ink">{joiningFormatted}</p>
                </div>
              </div>
            )}
            {completionFormatted && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Completion Date</p>
                  <p className="text-lg font-bold text-ink">{completionFormatted}</p>
                </div>
              </div>
            )}
            {certificate?.email && (
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-ink break-all">{certificate.email}</p>
                </div>
              </div>
            )}
            {certificate?.progress && (
              <div className="flex items-start gap-3 md:col-span-2">
                <ShieldAlert className="w-5 h-5 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Progress</p>
                  <p className="text-sm font-semibold text-ink">{certificate.progress}</p>
                </div>
              </div>
            )}
            {certificate?.ceoReview && (
              <div className="flex items-start gap-3 md:col-span-2">
                <ShieldAlert className="w-5 h-5 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">CEO Review</p>
                  <p className="text-sm font-semibold text-ink whitespace-pre-line">{certificate.ceoReview}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-paper border border-hair rounded-xl p-4 mt-6 text-left text-xs text-muted space-y-1">
            <p><strong>Certificate ID:</strong> {certificate?.certificateId}</p>
            <p><strong>Status:</strong> Active & Verified</p>
            <p><strong>Audited By:</strong> {certificate?.issuedBy || 'System Administrator'}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${certificate?.certificateId}/pdf`}
              download
              className="flex items-center justify-center gap-2 bg-teal hover:bg-teal/90 text-white font-bold px-6 py-3.5 rounded-lg transition-all shadow-sm w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF Certificate</span>
            </a>
            <Link
              to="/verify"
              className="flex items-center justify-center gap-2 bg-white border border-hair hover:bg-paper text-ink font-semibold px-6 py-3.5 rounded-lg w-full sm:w-auto"
            >
              <span>Verify Another ID</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
