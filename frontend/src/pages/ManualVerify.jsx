import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HelpCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function ManualVerify() {
  const [certId, setCertId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = certId.trim().toUpperCase();

    if (!trimmedId) {
      setError('Please enter a certificate ID.');
      return;
    }

    const pattern = /^CC-\d{4}-[A-Z0-9]{6}$/;
    if (!pattern.test(trimmedId)) {
      setError('Invalid ID format. Correct format is: CC-YYYY-XXXXXX (e.g. CC-2026-X1Y2Z3)');
      return;
    }

    navigate(`/verify/${trimmedId}`);
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20 flex flex-col justify-center min-h-[60vh]">
      <div className="bg-white border border-hair rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-teal-light border border-teal/20 rounded-2xl flex items-center justify-center text-teal mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink text-center">
            Verify a Certificate
          </h1>
          <p className="text-sm text-muted text-center mt-2">
            Enter the unique CodeClub certificate ID printed on the document.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="certId" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Certificate ID
            </label>
            <input
              type="text"
              id="certId"
              value={certId}
              onChange={(e) => {
                setCertId(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. CC-2026-A1B2C3"
              className="w-full px-4 py-3 border border-hair rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal bg-paper"
            />
            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal/90 text-white font-semibold py-3 rounded-lg transition-colors text-sm shadow-sm"
          >
            <span>Check Authenticity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 border-t border-hair pt-6 text-center">
          <p className="text-xs text-muted">
            Format: <code className="bg-paper px-1.5 py-0.5 rounded border border-hair font-mono font-bold text-ink">CC-[Year]-[Code]</code>
          </p>
        </div>
      </div>
    </div>
  );
}
