import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

  function loadMessages() {
    setLoading(true);
    api.get('/messages')
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => setError('Failed to fetch messages.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleViewMessage(item) {
    setSelectedMessage(item);
    if (item.status === 'unread') {
      try {
        await api.put(`/messages/${item.id}`, { status: 'read' });
        setMessages((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, status: 'read' } : m))
        );
      } catch (e) {
        // silent error
      }
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    try {
      await api.put(`/messages/${id}`, { status: newStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  }

  function handleDeleteClick(id, name) {
    setDeleteConfirm({ show: true, id, title: `Message from ${name}` });
  }

  async function handleConfirmDelete() {
    const { id } = deleteConfirm;
    try {
      await api.delete(`/messages/${id}`);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
      loadMessages();
    } catch (err) {
      alert('Failed to delete message');
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
            <h1 className="text-2xl font-bold font-display text-ink">Inquiries & Messages</h1>
            <p className="text-muted text-sm mt-1">
              View and manage contact messages and corporate inquiries sent via the Contact page.
            </p>
          </div>
          <button
            onClick={loadMessages}
            className="border border-hair bg-white px-4 py-2 rounded-full text-xs font-mono text-muted hover:text-ink hover:bg-teal-light/20 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">Loading messages...</p>
        ) : (
          <div className="overflow-x-auto border border-hair rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-ink">
              <thead className="bg-teal-light text-left font-mono uppercase text-xs tracking-wider text-teal">
                <tr>
                  <th className="p-4 border-b border-hair">Status</th>
                  <th className="p-4 border-b border-hair">Sender</th>
                  <th className="p-4 border-b border-hair">Phone & Company No</th>
                  <th className="p-4 border-b border-hair">Message Preview</th>
                  <th className="p-4 border-b border-hair">Received</th>
                  <th className="p-4 border-b border-hair">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {messages.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-teal-light/20 transition-colors ${
                      item.status === 'unread' ? 'bg-teal-light/10 font-medium' : ''
                    }`}
                  >
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono uppercase font-semibold ${
                          item.status === 'unread'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status || 'unread'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink">{item.name}</div>
                      <a
                        href={`mailto:${item.email}`}
                        className="text-xs text-teal hover:underline font-mono"
                      >
                        {item.email}
                      </a>
                    </td>
                    <td className="p-4 text-xs font-mono">
                      <div>📞 {item.phone || '-'}</div>
                      <div className="text-muted mt-0.5">🏢 {item.companyNo || '-'}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {item.message || 'No message text provided.'}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-muted">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : '-'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewMessage(item)}
                          className="text-teal hover:underline font-semibold text-xs"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.name)}
                          className="text-red-600 hover:underline font-semibold text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted font-medium">
                      No messages received yet. Inquiries submitted on the Contact page will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Message Details Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-paper border border-hair rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-hair pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono text-teal uppercase font-semibold">
                    Inquiry Details
                  </span>
                  <h2 className="text-xl font-bold font-display text-ink mt-0.5">
                    Message from {selectedMessage.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-full bg-paper hover:bg-hair/50 flex items-center justify-center text-ink text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-hair text-sm">
                  <div>
                    <span className="text-xs font-mono text-muted uppercase block">Email</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-teal font-medium hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-muted uppercase block">Phone Number</span>
                    <span className="text-ink font-mono">{selectedMessage.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-muted uppercase block">Company Number</span>
                    <span className="text-ink font-mono">{selectedMessage.companyNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-muted uppercase block">Status</span>
                    <span className="capitalize font-medium text-ink">{selectedMessage.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-muted mb-2 font-semibold">
                    Message Content
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-hair text-sm text-ink leading-relaxed whitespace-pre-line min-h-[120px]">
                    {selectedMessage.message || 'No message text provided.'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-hair">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted">Update Status:</span>
                    <button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                        selectedMessage.status === 'replied'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-hair bg-white text-ink hover:bg-emerald-50'
                      }`}
                    >
                      ✓ Mark Replied
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                        selectedMessage.status === 'read'
                          ? 'bg-ink text-paper border-ink'
                          : 'border-hair bg-white text-ink hover:bg-gray-50'
                      }`}
                    >
                      Mark Read
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: Inquiry from CodeClub Portal`}
                      className="px-5 py-2 rounded-full bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors flex items-center gap-1"
                    >
                      <span>✉️ Reply via Email</span>
                    </a>
                  </div>
                </div>
              </div>
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
