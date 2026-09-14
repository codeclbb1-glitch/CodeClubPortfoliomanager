import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.stats)).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { label: 'Total Clients', value: stats.totalClients || 0, color: 'bg-orange-50 text-orange-700' },
        { label: 'Total Jobs', value: stats.totalJobs, color: 'bg-teal-light text-teal' },
        { label: 'Active Jobs', value: stats.activeJobs, color: 'bg-green-50 text-green-700' },
        { label: 'Total Applications', value: stats.totalApplications, color: 'bg-blue-50 text-blue-700' },
        { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
        { label: 'Accepted', value: stats.accepted, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
        { label: 'News & Announcements', value: stats.totalNews || 0, color: 'bg-purple-50 text-purple-700' },
        { label: 'Total Certificates', value: stats.totalCertificates || 0, color: 'bg-indigo-50 text-indigo-700' },
        { label: 'Active Certificates', value: stats.activeCertificates || 0, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Revoked Certificates', value: stats.revokedCertificates || 0, color: 'bg-amber-50 text-amber-700' }
      ]
    : [];

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {!stats ? (
          <p className="text-gray-500">Loading stats...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.label} className={`rounded-lg p-6 ${c.color}`}>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-3xl font-bold mt-2">{c.value}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
