import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  const linkClass = (path) =>
    `px-3 py-2.5 rounded-lg transition-colors ${
      pathname === path ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper'
    }`;

  return (
    <aside className="w-60 bg-ink text-paper min-h-screen p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <img
          src="/assets/codeclub_logo.png"
          alt="Code Club Logo"
          className="w-8 h-8 object-contain"
        />
        <p className="font-display text-xl font-bold">
          Code<span className="text-gold">Club</span>
        </p>
      </div>
      <p className="font-mono text-[10px] tracking-widest uppercase text-paper/40 mb-8">Admin Panel</p>
      <nav className="flex flex-col gap-1 text-sm font-medium flex-1">
        <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>Dashboard</Link>
        <Link to="/admin/jobs" className={linkClass('/admin/jobs')}>Jobs</Link>
        <Link to="/admin/jobs/create" className={linkClass('/admin/jobs/create')}>Create Job</Link>
        <Link to="/admin/applications" className={linkClass('/admin/applications')}>Applications</Link>
        <Link to="/admin/certificates" className={linkClass('/admin/certificates')}>Certificates</Link>
        <div className="border-t border-white/10 my-2"></div>
        <Link to="/admin/messages" className={linkClass('/admin/messages')}>Messages</Link>
        <Link to="/admin/news" className={linkClass('/admin/news')}>News & Media</Link>
        <Link to="/admin/clients" className={linkClass('/admin/clients')}>Clients</Link>
        <Link to="/admin/projects" className={linkClass('/admin/projects')}>Projects</Link>
        <Link to="/admin/testimonials" className={linkClass('/admin/testimonials')}>Testimonials</Link>
        <Link to="/admin/team" className={linkClass('/admin/team')}>Team</Link>
      </nav>
      <button
        onClick={handleLogout}
        className="text-left px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10 font-medium text-sm"
      >
        Logout
      </button>
    </aside>
  );
}
