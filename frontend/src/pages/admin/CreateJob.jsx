import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import JobForm from '../../components/JobForm.jsx';
import api from '../../services/api';

export default function CreateJob() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(form) {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/jobs', form);
      navigate('/admin/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Create Job</h1>
        {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm max-w-2xl">{error}</p>}
        <JobForm onSubmit={handleSubmit} submitting={submitting} />
      </main>
    </div>
  );
}
