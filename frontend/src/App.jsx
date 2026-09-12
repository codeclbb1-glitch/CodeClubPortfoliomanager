import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AdminLogin from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminJobs from './pages/admin/Jobs.jsx';
import CreateJob from './pages/admin/CreateJob.jsx';
import EditJob from './pages/admin/EditJob.jsx';
import Applications from './pages/admin/Applications.jsx';
import ApplicationDetails from './pages/admin/ApplicationDetails.jsx';
import AdminMessages from './pages/admin/Messages.jsx';
import AdminNews from './pages/admin/News.jsx';
import AdminClients from './pages/admin/Clients.jsx';
import AdminProjects from './pages/admin/Projects.jsx';
import AdminTestimonials from './pages/admin/Testimonials.jsx';
import AdminCertificates from './pages/admin/Certificates.jsx';
import AdminTeam from './pages/admin/Team.jsx';

function PublicLayout({ children }) {
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirects to login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Login route - if already authenticated, go to dashboard */}
      <Route
        path="/admin/login"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
        }
      />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
      <Route path="/admin/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/edit/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/admin/applications/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
      <Route path="/admin/news" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
      <Route path="/admin/certificates" element={<ProtectedRoute><AdminCertificates /></ProtectedRoute>} />
      <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />

      {/* Catch-all redirects to login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
