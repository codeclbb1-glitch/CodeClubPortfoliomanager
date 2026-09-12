import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

const LIMITS = {
  name: 100,
  designation: 100,
  experience: 50,
  stack: 255,
  order: 9999
};

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'HTML5', 'CSS3', 'TailwindCSS', 'Bootstrap',
  'JavaScript', 'TypeScript', 'Redux', 'Zustand',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django',
  'FastAPI', 'Flask', 'Golang', 'Java', 'Spring Boot',
  'Ruby on Rails', 'PHP', 'Laravel', 'gRPC',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
  'Cassandra', 'Elasticsearch', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Terraform', 'Git', 'CI/CD',
  'React Native', 'Flutter', 'Swift', 'Kotlin'
];

const DESIGNATION_OPTIONS = [
  'Chief Technology Officer (CTO)',
  'Lead Software Engineer',
  'Senior Software Engineer',
  'Software Engineer',
  'Junior Software Engineer',
  'Principal Architect',
  'Lead Product Manager',
  'Product Manager',
  'Senior UX/UI Designer',
  'UX/UI Designer',
  'DevOps Engineer',
  'QA Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer'
];

function CharCounter({ current = 0, max }) {
  const pct = current / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-gold-dark' : 'text-muted';
  return (
    <p className={`font-mono text-[10px] mt-0.5 text-right ${color}`}>
      {current} / {max}
    </p>
  );
}

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [showCustomTech, setShowCustomTech] = useState(false);
  const [customTech, setCustomTech] = useState('');

  const [form, setForm] = useState({
    name: '',
    designation: '',
    experience: '',
    stack: '',
    photo: '',
    order: 0
  });

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  function loadTeam() {
    setLoading(true);
    api.get('/team')
      .then((res) => setTeamMembers(res.data.team || []))
      .catch((err) => setError('Failed to fetch team members.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTeam();
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Profile photo image must be under 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, photo: res.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({ name: '', designation: '', experience: '', stack: '', photo: '', order: 0 });
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(member) {
    setEditingId(member.id);
    setForm({
      name: member.name || '',
      designation: member.designation || '',
      experience: member.experience || '',
      stack: member.stack || '',
      photo: member.photo || '',
      order: member.order || 0
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (form.name.trim().length < 3) {
      setError('Member name must be at least 3 characters.');
      return;
    }

    const nameRegex = /^[a-zA-Z\s\-\.\'\’]+$/;
    if (!nameRegex.test(form.name.trim())) {
      setError('Member Name contains invalid characters. Only letters, spaces, hyphens, dots, and apostrophes are allowed.');
      return;
    }

    const designationRegex = /^[a-zA-Z0-9\s\-\.\,\&\/\#]+$/;
    if (!designationRegex.test(form.designation.trim())) {
      setError('Designation contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, and ampersands are allowed.');
      return;
    }

    if (form.experience.trim()) {
      const expRegex = /^[a-zA-Z0-9\s\-\+\.\,\/]+$/;
      if (!expRegex.test(form.experience.trim())) {
        setError('Experience contains invalid characters. Only numbers, letters, spaces, slashes, and +, - signs are allowed.');
        return;
      }
    }

    if (form.stack.trim()) {
      const stackRegex = /^[a-zA-Z0-9\s\-\.\,\&\#\+\/]+$/;
      if (!stackRegex.test(form.stack.trim())) {
        setError('Skills Stack contains invalid characters. Only alphanumeric tags, commas, spaces, and basic symbols are allowed.');
        return;
      }
    }

    if (form.order < 0 || form.order > LIMITS.order) {
      setError(`Display order must be between 0 and ${LIMITS.order}.`);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/team/${editingId}`, form);
      } else {
        await api.post('/team', form);
      }
      setShowModal(false);
      loadTeam();
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
      await api.delete(`/team/${id}`);
      loadTeam();
    } catch (err) {
      alert('Failed to delete team member');
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
            <h1 className="text-2xl font-bold font-display text-ink">Team Members</h1>
            <p className="text-muted text-sm mt-1">Manage team profiles, designations, tech stack skillsets, experience, and listing order.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors"
          >
            + Add Member
          </button>
        </div>

        {loading ? (
          <p className="text-muted">Loading team members...</p>
        ) : (
          <div className="overflow-x-auto border border-hair rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-ink">
              <thead className="bg-teal-light text-left font-mono uppercase text-xs tracking-wider text-teal">
                <tr>
                  <th className="p-4 border-b border-hair">Photo</th>
                  <th className="p-4 border-b border-hair">Name</th>
                  <th className="p-4 border-b border-hair">Designation</th>
                  <th className="p-4 border-b border-hair">Experience</th>
                  <th className="p-4 border-b border-hair">Stack / Skills</th>
                  <th className="p-4 border-b border-hair">Order</th>
                  <th className="p-4 border-b border-hair">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-teal-light/20 transition-colors">
                    <td className="p-4">
                      {member.photo ? (
                        <img
                          src={member.photo.startsWith('http') ? member.photo : `${BASE_URL}${member.photo}`}
                          alt={member.name}
                          className="h-10 w-10 object-cover rounded-full bg-paper border"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center text-xs text-muted bg-paper rounded-full border border-dashed font-mono">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{member.name}</td>
                    <td className="p-4 text-muted">{member.designation || '-'}</td>
                    <td className="p-4 text-muted font-mono">{member.experience || '-'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {member.stack ? (
                          member.stack.split(',').map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-teal/10 text-teal text-xs font-mono">
                              {tag.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-teal font-semibold">{member.order}</td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="text-teal hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member.id, member.name)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-muted font-medium">
                      No team members found. Add some team members to show off your stellar team.
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
            <div className="bg-paper border border-hair rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold font-display text-ink mb-4">
                {editingId ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={LIMITS.name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                    placeholder="e.g. Sarah Jenkins"
                  />
                  <CharCounter current={form.name.length} max={LIMITS.name} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Designation</label>
                  <select
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                  >
                    <option value="">-- Select Designation --</option>
                    {DESIGNATION_OPTIONS.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Experience</label>
                  <input
                    type="text"
                    maxLength={LIMITS.experience}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                    placeholder="e.g. 5+ Years"
                  />
                  <CharCounter current={form.experience.length} max={LIMITS.experience} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Tech Stack Skills</label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setShowCustomTech(true);
                        e.target.value = '';
                        return;
                      }
                      if (!val) return;
                      const currentTags = form.stack ? form.stack.split(',').map(t => t.trim()) : [];
                      if (!currentTags.includes(val)) {
                        const newTags = [...currentTags, val];
                        setForm({ ...form, stack: newTags.join(', ') });
                      }
                      e.target.value = ''; // Reset select
                    }}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm"
                  >
                    <option value="">-- Choose a Skill --</option>
                    {TECH_OPTIONS.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                    <option value="Other">Other (specify...)</option>
                  </select>
                  
                  {showCustomTech && (
                    <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <input
                        type="text"
                        placeholder="Type custom skill..."
                        value={customTech}
                        onChange={(e) => setCustomTech(e.target.value)}
                        className="flex-1 border border-hair rounded-xl px-4 py-2 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customTech.trim();
                          if (val) {
                            const currentTags = form.stack ? form.stack.split(',').map(t => t.trim()) : [];
                            if (!currentTags.includes(val)) {
                              const newTags = [...currentTags, val];
                              setForm({ ...form, stack: newTags.join(', ') });
                            }
                          }
                          setCustomTech('');
                          setShowCustomTech(false);
                        }}
                        className="bg-teal hover:bg-teal/95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomTech('');
                          setShowCustomTech(false);
                        }}
                        className="border border-hair text-muted hover:bg-teal-light/20 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Selected skills tags display */}
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-white border border-hair rounded-xl min-h-[48px]">
                    {form.stack ? (
                      form.stack.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal/10 text-teal text-xs font-mono font-semibold">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const currentTags = form.stack.split(',').map(t => t.trim()).filter(Boolean);
                              const newTags = currentTags.filter(t => t !== tag);
                              setForm({ ...form, stack: newTags.join(', ') });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted font-sans py-1 px-0.5">No skills selected yet.</span>
                    )}
                  </div>
                  <CharCounter current={form.stack.length} max={LIMITS.stack} />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1">Profile Photo (Max 10MB)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-teal-light file:text-teal hover:file:bg-teal/20 cursor-pointer"
                    />
                    {uploading && <span className="text-xs text-teal font-mono animate-pulse">Uploading...</span>}
                  </div>
                  {form.photo && (
                    <div className="mt-2 p-1 border border-hair rounded-full bg-white w-20 h-20 overflow-hidden flex items-center justify-center">
                      <img
                        src={form.photo.startsWith('http') ? form.photo : `${BASE_URL}${form.photo}`}
                        alt="Profile preview"
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
