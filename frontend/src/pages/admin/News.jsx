import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

const LIMITS = {
  title: 150,
  date: 60,
  description: 3000,
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

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

  const [form, setForm] = useState({
    title: '',
    date: '',
    description: '',
    image: '',
    order: 0
  });

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  function loadNews() {
    setLoading(true);
    api.get('/news')
      .then((res) => setNews(res.data.news || []))
      .catch(() => setError('Failed to fetch news articles.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNews();
  }, []);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    if (imgPath.startsWith('/assets/')) {
      return imgPath;
    }
    if (imgPath.startsWith('/uploads/')) {
      return `${BASE_URL}${imgPath}`;
    }
    return `/assets/news/${imgPath}`;
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('News picture must be under 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function handleOpenCreate() {
    setEditingId(null);
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setForm({
      title: '',
      date: today,
      description: '',
      image: '',
      order: 0
    });
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      date: item.date || '',
      description: item.description || '',
      image: item.image || '',
      order: item.order || 0
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('News title must be at least 3 characters.');
      return;
    }

    if (form.description.trim() && /[<>]/g.test(form.description)) {
      setError('Description cannot contain raw HTML tags or angle brackets (<, >).');
      return;
    }

    if (form.order < 0 || form.order > LIMITS.order) {
      setError(`Display order must be between 0 and ${LIMITS.order}.`);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/news/${editingId}`, form);
      } else {
        await api.post('/news', form);
      }
      setShowModal(false);
      loadNews();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong saving news article.');
    }
  }

  function handleDeleteClick(id, title) {
    setDeleteConfirm({ show: true, id, title });
  }

  async function handleConfirmDelete() {
    const { id } = deleteConfirm;
    try {
      await api.delete(`/news/${id}`);
      loadNews();
    } catch (err) {
      alert('Failed to delete news article');
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
            <h1 className="text-2xl font-bold font-display text-ink">News & Media</h1>
            <p className="text-muted text-sm mt-1">
              Manage CodeClub press releases, media coverage, partnerships, and announcements.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Add News Article</span>
          </button>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">Loading news items...</p>
        ) : (
          <div className="overflow-x-auto border border-hair rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-ink">
              <thead className="bg-teal-light text-left font-mono uppercase text-xs tracking-wider text-teal">
                <tr>
                  <th className="p-4 border-b border-hair">Picture</th>
                  <th className="p-4 border-b border-hair">Title & Excerpt</th>
                  <th className="p-4 border-b border-hair">Date</th>
                  <th className="p-4 border-b border-hair">Order</th>
                  <th className="p-4 border-b border-hair">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-light/20 transition-colors">
                    <td className="p-4 w-28">
                      {getImageUrl(item.image) ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="h-14 w-24 object-cover bg-paper border rounded-lg shadow-xs"
                        />
                      ) : (
                        <div className="h-14 w-24 flex items-center justify-center text-xs text-muted bg-paper rounded-lg border border-dashed font-mono">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-semibold text-ink leading-snug">{item.title}</div>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {item.description || 'No description provided.'}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted whitespace-nowrap">
                      {item.date || '-'}
                    </td>
                    <td className="p-4 font-mono text-teal font-semibold">
                      {item.order}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-teal hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.title)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {news.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-muted font-medium">
                      No news articles found. Click "+ Add News Article" to create your first announcement.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Form for Add / Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-paper border border-hair rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold font-display text-ink mb-4">
                {editingId ? 'Edit News Article' : 'Add New News Article'}
              </h2>
              {error && (
                <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">
                  {error}
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={LIMITS.title}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                    placeholder="e.g. CodeClub Signs Partnership with Tech Pioneer"
                  />
                  <CharCounter current={form.title.length} max={LIMITS.title} />
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Publication Date (e.g. October 16, 2025)
                  </label>
                  <input
                    type="text"
                    maxLength={LIMITS.date}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                    placeholder="October 16, 2025"
                  />
                  <CharCounter current={form.date.length} max={LIMITS.date} />
                </div>

                {/* Picture Upload */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    News Picture (Max 10MB)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-teal-light file:text-teal hover:file:bg-teal/20 cursor-pointer"
                    />
                    {uploading && (
                      <span className="text-xs text-teal font-mono animate-pulse">Uploading...</span>
                    )}
                  </div>
                  {form.image && (
                    <div className="mt-3 p-2 border border-hair rounded-xl bg-white w-40 h-24 flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(form.image)}
                        alt="News preview"
                        className="max-h-full max-w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Description / Story Details *
                  </label>
                  <textarea
                    rows="6"
                    maxLength={LIMITS.description}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink leading-relaxed"
                    placeholder="Provide full description of the news announcement, background, quotes, and impact..."
                  />
                  <CharCounter current={form.description.length} max={LIMITS.description} />
                </div>

                {/* Display Order */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Display Order (Lower numbers appear first, e.g. 1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={LIMITS.order}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                  />
                </div>

                {/* Action Buttons */}
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
                    className="px-6 py-2.5 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-teal transition-colors shadow-sm"
                  >
                    Save Article
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
