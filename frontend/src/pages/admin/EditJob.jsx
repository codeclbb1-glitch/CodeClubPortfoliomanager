import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import JobForm from '../../components/JobForm.jsx';
import api from '../../services/api';

export default function EditJob() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data.job));
  }, [id]);

  async function handleSubmit(form) {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/jobs/${id}`, form);
      navigate('/admin/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
        {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm max-w-2xl">{error}</p>}
        {job ? <JobForm initialData={job} onSubmit={handleSubmit} submitting={submitting} /> : <p>Loading...</p>}
      </main>
    </div>
  );
}
