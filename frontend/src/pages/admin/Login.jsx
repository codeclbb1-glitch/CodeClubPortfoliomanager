import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/login', { email, password });
      login(res.data.admin, res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg === 'Network Error' ? 'Network Error: Cannot connect to Backend API.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-paper rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-teal-light border border-teal/20 rounded-2xl flex items-center justify-center text-teal mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <p className="font-display text-2xl text-ink text-center mb-1">
            Job<span className="text-gold-dark">Portal</span>
          </p>
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted text-center">
            Admin Login
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-hair rounded-lg pl-10 pr-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
              placeholder="admin@codeclub.com"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-hair rounded-lg pl-10 pr-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-3 rounded-full font-medium hover:bg-teal transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
