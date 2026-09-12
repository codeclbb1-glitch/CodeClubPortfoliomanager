import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path ? 'text-ink' : 'text-muted hover:text-ink'
    }`;

  return (
    <nav className="bg-paper/90 backdrop-blur sticky top-0 z-50 border-b border-hair">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-[68px]">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/codeclub_logo.png"
            alt="Code Club"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <span className="font-display text-2xl font-bold text-ink tracking-tight">CodeClub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/jobs" className={linkClass('/jobs')}>Jobs</Link>
          <Link to="/news" className={linkClass('/news')}>News</Link>
          <Link to="/verify" className={linkClass('/verify')}>Verify</Link>
          <Link to="/about" className={linkClass('/about')}>About</Link>
          <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => { logout(); }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="font-mono text-xs tracking-wide uppercase border border-ink/20 rounded-full px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-ink"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-hair bg-paper px-5 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-ink">Home</Link>
          <Link to="/jobs" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted">Jobs</Link>
          <Link to="/news" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted">News</Link>
          <Link to="/verify" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted">Verify</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted">About</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted">Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-ink">Dashboard</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-ink">Admin Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
