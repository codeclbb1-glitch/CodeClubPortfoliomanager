import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

const LIMITS = {
  name: 100,
  role: 100,
  content: 1000,
  order: 9999
};

function CharCounter({ current = 0, max }) {
  const pct = current / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-gold-dark' : 'text-muted';
  return (
    <p className={`font-mono text-[10px] mt-0.5 text-right ${color}`}>
      {current} / {max}
    </p>
  );
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

  const [form, setForm] = useState({
    name: '',
    role: '',
    content: '',
    avatar: '',
    rating: 5,
    order: 0
  });

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  function loadTestimonials() {
    setLoading(true);
    api.get('/testimonials')
      .then((res) => setTestimonials(res.data.testimonials || []))
      .catch((err) => setError('Failed to fetch testimonials.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Avatar image must be under 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, avatar: res.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({ name: '', role: '', content: '', avatar: '', rating: 5, order: 0 });
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(testimonial) {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name || '',
      role: testimonial.role || '',
      content: testimonial.content || '',
      avatar: testimonial.avatar || '',
      rating: testimonial.rating || 5,
      order: testimonial.order || 0
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validations
    if (form.name.trim().length < 3) {
      setError('Client name must be at least 3 characters.');
      return;
    }

    const nameRegex = /^[a-zA-Z\s\-\.\'\’]+$/;
    if (!nameRegex.test(form.name.trim())) {
      setError('Client Name contains invalid characters. Only letters, spaces, hyphens, dots, and apostrophes are allowed.');
      return;
    }

    if (form.role.trim()) {
      const roleRegex = /^[a-zA-Z0-9\s\-\.\,\&\/\#]+$/;
      if (!roleRegex.test(form.role.trim())) {
        setError('Company / Role contains invalid characters. Only letters, numbers, spaces, commas, slashes, and ampersands are allowed.');
        return;
      }
    }

    if (form.content.trim().length < 10) {
      setError('Review content must be at least 10 characters.');
      return;
    }

    if (form.content.trim() && /[<>]/g.test(form.content)) {
      setError('Feedback content cannot contain HTML tags or angle brackets (<, >).');
      return;
    }

    if (form.order < 0 || form.order > LIMITS.order) {
      setError(`Display order must be between 0 and ${LIMITS.order}.`);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/testimonials/${editingId}`, form);
      } else {
        await api.post('/testimonials', form);
      }
      setShowModal(false);
      loadTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function handleDeleteClick(id, title) {
    setDeleteConfirm({ show: true, id, title });
  }

  async function handleConfirmDelete() {
    const { id } = deleteConfirm;
    try {
      await api.delete(`/testimonials/${id}`);
      loadTestimonials();
    } catch (err) {
      alert('Failed to delete testimonial');
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-ink">Testimonials</h1>
            <p className="text-muted text-sm mt-1">Manage customer feedback, ratings, and quotes displayed on the public site.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors"
          >
            + Add Testimonial
          </button>
        </div>

        {loading ? (
          <p className="text-muted">Loading testimonials...</p>
        ) : (
          <div className="overflow-x-auto border border-hair rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-ink">
              <thead className="bg-teal-light text-left font-mono uppercase text-xs tracking-wider text-teal">
                <tr>
                  <th className="p-4 border-b border-hair">Avatar</th>
                  <th className="p-4 border-b border-hair">Name</th>
                  <th className="p-4 border-b border-hair">Company / Role</th>
                  <th className="p-4 border-b border-hair">Rating</th>
                  <th className="p-4 border-b border-hair">Content</th>
                  <th className="p-4 border-b border-hair">Order</th>
                  <th className="p-4 border-b border-hair">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-teal-light/20 transition-colors">
                    <td className="p-4">
                      {t.avatar ? (
                        <img
                          src={t.avatar.startsWith('http') ? t.avatar : `${BASE_URL}${t.avatar}`}
                          alt={t.name}
                          className="h-10 w-10 object-cover rounded-full bg-paper border"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center text-xs text-muted bg-paper rounded-full border border-dashed font-mono">
                          No Avt
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{t.name}</td>
                    <td className="p-4 text-muted">{t.role || '-'}</td>
                    <td className="p-4 font-mono text-gold-dark font-semibold">
                      {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                    </td>
                    <td className="p-4 max-w-xs truncate text-muted">{t.content}</td>
                    <td className="p-4 font-mono text-teal font-semibold">{t.order}</td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="text-teal hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t.id, t.name)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {testimonials.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-muted font-medium">
                      No testimonials found. Add some client testimonials to show on the public page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-paper border border-hair rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative animate-in fade-in zoom-in duration-200 animate-slide-up">
              <h2 className="text-xl font-bold font-display text-ink mb-4">
                {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={LIMITS.name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                    placeholder="e.g. David Wilson"
                  />
                  <CharCounter current={form.name.length} max={LIMITS.name} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Company / Role</label>
                  <input
                    type="text"
                    maxLength={LIMITS.role}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                    placeholder="e.g. CTO, FinanceCorp"
                  />
                  <CharCounter current={form.role.length} max={LIMITS.role} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Feedback Content *</label>
                  <textarea
                    rows="4"
                    required
                    maxLength={LIMITS.content}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                    placeholder="Provide the review message left by the client..."
                  />
                  <CharCounter current={form.content.length} max={LIMITS.content} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Avatar Photo (Max 10MB)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-teal-light file:text-teal hover:file:bg-teal/20 cursor-pointer"
                    />
                    {uploading && <span className="text-xs text-teal font-mono animate-pulse">Uploading...</span>}
                  </div>
                  {form.avatar && (
                    <div className="mt-2 p-1 border border-hair rounded-full bg-white w-20 h-20 overflow-hidden flex items-center justify-center">
                      <img
                        src={form.avatar.startsWith('http') ? form.avatar : `${BASE_URL}${form.avatar}`}
                        alt="Avatar preview"
                        className="h-full w-full object-cover animate-in fade-in"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Display Order (e.g. 1 shows first)</label>
                  <input
                    type="number"
                    min="0"
                    max={LIMITS.order}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-hair">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-full border border-hair text-muted text-sm font-semibold hover:bg-teal-light/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-teal transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={deleteConfirm.show}
          title={deleteConfirm.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, id: null, title: '' })}
        />
      </main>
    </div>
  );
}
