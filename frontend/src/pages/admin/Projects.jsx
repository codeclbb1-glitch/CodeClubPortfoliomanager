import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import api from '../../services/api';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

const LIMITS = {
  title: 150,
  projectType: 80,
  description: 1500,
  techStack: 255,
  link: 255,
  order: 9999
};

const PROJECT_TYPE_OPTIONS = [
  'Full-Stack',
  'Mobile App',
  'Web Development',
  'AI/ML & Data Science',
  'SaaS Platform',
  'E-Commerce',
  'Enterprise ERP',
  'UI/UX Design',
  'Cybersecurity',
  'Finance & FinTech',
  'Civic Tech & Portals'
];

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
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'CMS', 'ERP'
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

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [showCustomTech, setShowCustomTech] = useState(false);
  const [customTech, setCustomTech] = useState('');

  const [form, setForm] = useState({
    title: '',
    projectType: '',
    description: '',
    image: '',
    techStack: '',
    link: '',
    order: 0
  });

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  function loadProjects() {
    setLoading(true);
    api.get('/projects')
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setError('Failed to fetch case studies / projects.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    if (imgPath.startsWith('/assets/')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return `${BASE_URL}${imgPath}`;
    return `/assets/casestudy/${imgPath}`;
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Case study showcase image must be under 10MB.');
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
    setForm({
      title: '',
      projectType: 'Full-Stack',
      description: '',
      image: '',
      techStack: '',
      link: '',
      order: 0
    });
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(project) {
    setEditingId(project.id);
    const tagsList = project.tags && project.tags.length > 0 ? project.tags.join(', ') : project.techStack || '';
    setForm({
      title: project.title || '',
      projectType: project.projectType || '',
      description: project.description || '',
      image: project.image || '',
      techStack: tagsList,
      link: project.link || project.liveLink || '',
      order: project.order || 0
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('Project / Case Study title must be at least 3 characters.');
      return;
    }

    if (form.description.trim() && /[<>]/g.test(form.description)) {
      setError('Description cannot contain HTML tags or angle brackets (<, >).');
      return;
    }

    if (form.order < 0 || form.order > LIMITS.order) {
      setError(`Display order must be between 0 and ${LIMITS.order}.`);
      return;
    }

    const payload = {
      ...form,
      tags: form.techStack ? form.techStack.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong saving case study');
    }
  }

  function handleDeleteClick(id, title) {
    setDeleteConfirm({ show: true, id, title });
  }

  async function handleConfirmDelete() {
    const { id } = deleteConfirm;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) {
      alert('Failed to delete project');
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
            <h1 className="text-2xl font-bold font-display text-ink">Case Studies & Projects</h1>
            <p className="text-muted text-sm mt-1">
              Manage portfolio case studies, project types, images, tags, live links, and display order.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Case Study</span>
          </button>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">Loading case studies...</p>
        ) : (
          <div className="overflow-x-auto border border-hair rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-ink">
              <thead className="bg-teal-light text-left font-mono uppercase text-xs tracking-wider text-teal">
                <tr>
                  <th className="p-4 border-b border-hair">Image</th>
                  <th className="p-4 border-b border-hair">Title & Type</th>
                  <th className="p-4 border-b border-hair">Tags / Stack</th>
                  <th className="p-4 border-b border-hair">Live Link</th>
                  <th className="p-4 border-b border-hair">Order</th>
                  <th className="p-4 border-b border-hair">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-teal-light/20 transition-colors">
                    <td className="p-4 w-28">
                      {getImageUrl(project.image) ? (
                        <img
                          src={getImageUrl(project.image)}
                          alt={project.title}
                          className="h-14 w-24 object-cover bg-paper border rounded-lg shadow-xs"
                        />
                      ) : (
                        <div className="h-14 w-24 flex items-center justify-center text-xs text-muted bg-paper rounded-lg border border-dashed font-mono">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-ink leading-snug">{project.title}</div>
                      {project.projectType && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-teal/10 text-teal text-[10px] font-mono font-semibold">
                          {project.projectType}
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(project.tags && project.tags.length > 0 ? project.tags : (project.techStack ? project.techStack.split(',') : [])).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-paper border border-hair text-muted text-xs font-mono">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono">
                      {project.link || project.liveLink ? (
                        <a
                          href={project.link || project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal hover:underline truncate block max-w-[150px]"
                        >
                          {project.link || project.liveLink}
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-teal font-semibold">{project.order}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="text-teal hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(project.id, project.title)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted font-medium">
                      No case studies or projects found. Click "+ Add Case Study" to showcase your first portfolio item.
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
            <div className="bg-paper border border-hair rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold font-display text-ink mb-4">
                {editingId ? 'Edit Case Study' : 'Add New Case Study'}
              </h2>
              {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project Title */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Case Study Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={LIMITS.title}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                    placeholder="e.g. Haasil - Multi vendor E-commerce Platform"
                  />
                  <CharCounter current={form.title.length} max={LIMITS.title} />
                </div>

                {/* Project Type */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Project Type (e.g. Mobile App, Full-Stack, AI/ML)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={PROJECT_TYPE_OPTIONS.includes(form.projectType) ? form.projectType : 'Custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'Custom') {
                          setForm({ ...form, projectType: val });
                        }
                      }}
                      className="border border-hair rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink w-1/2"
                    >
                      <option value="">-- Select Project Type --</option>
                      {PROJECT_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="Custom">Custom (Type below)...</option>
                    </select>
                    <input
                      type="text"
                      maxLength={LIMITS.projectType}
                      placeholder="Or type custom type..."
                      value={form.projectType}
                      onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                      className="flex-1 border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Showcase Image (Max 10MB)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-teal-light file:text-teal hover:file:bg-teal/20 cursor-pointer"
                    />
                    {uploading && <span className="text-xs text-teal font-mono animate-pulse">Uploading...</span>}
                  </div>
                  {form.image && (
                    <div className="mt-3 p-2 border border-hair rounded-xl bg-white w-40 h-24 flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(form.image)}
                        alt="Project preview"
                        className="max-h-full max-w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Description / Project Overview
                  </label>
                  <textarea
                    rows="4"
                    maxLength={LIMITS.description}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink leading-relaxed"
                    placeholder="Short summary of the project architecture, features, and business value..."
                  />
                  <CharCounter current={form.description.length} max={LIMITS.description} />
                </div>

                {/* Tags / Multi-Tags Selection */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Tags / Tech Stack (Multi-Select)
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setShowCustomTech(true);
                        e.target.value = '';
                        return;
                      }
                      if (!val) return;
                      const currentTags = form.techStack ? form.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                      if (!currentTags.includes(val)) {
                        const newTags = [...currentTags, val];
                        setForm({ ...form, techStack: newTags.join(', ') });
                      }
                      e.target.value = '';
                    }}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                  >
                    <option value="">-- Add Tag / Technology --</option>
                    {TECH_OPTIONS.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                    <option value="Other">+ Custom Tag...</option>
                  </select>

                  {showCustomTech && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Type tag name..."
                        value={customTech}
                        onChange={(e) => setCustomTech(e.target.value)}
                        className="flex-1 border border-hair rounded-xl px-4 py-2 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customTech.trim();
                          if (val) {
                            const currentTags = form.techStack ? form.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                            if (!currentTags.includes(val)) {
                              setForm({ ...form, techStack: [...currentTags, val].join(', ') });
                            }
                          }
                          setCustomTech('');
                          setShowCustomTech(false);
                        }}
                        className="bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCustomTech(''); setShowCustomTech(false); }}
                        className="border border-hair text-muted text-xs font-semibold px-3 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2.5 bg-white border border-hair rounded-xl min-h-[44px]">
                    {form.techStack ? (
                      form.techStack.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal/10 text-teal text-xs font-mono font-semibold">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const currentTags = form.techStack.split(',').map(t => t.trim()).filter(Boolean);
                              const newTags = currentTags.filter(t => t !== tag);
                              setForm({ ...form, techStack: newTags.join(', ') });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted py-1 px-1">No tags added yet.</span>
                    )}
                  </div>
                </div>

                {/* Live Link */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Live Link / Website URL
                  </label>
                  <input
                    type="url"
                    maxLength={LIMITS.link}
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
                    placeholder="https://haasil.store/ or https://github.com/..."
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1 font-semibold">
                    Display Order (e.g. 1 shows first)
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
                    Save Case Study
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
