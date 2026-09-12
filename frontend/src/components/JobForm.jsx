import { useState } from 'react';

const LIMITS = {
  title: 100,
  company: 100,
  location: 100,
  description: 2000,
  requirements: 1000,
  skills: 255
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

function CharCounter({ current = 0, max }) {
  const pct = current / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-gold-dark' : 'text-muted';
  return (
    <p className={`font-mono text-[10px] mt-0.5 text-right ${color}`}>
      {current} / {max}
    </p>
  );
}

export default function JobForm({ initialData = {}, onSubmit, submitting }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    company: initialData.company || '',
    location: initialData.location || '',
    salary: initialData.salary || '',
    job_type: initialData.job_type || 'Full-time',
    description: initialData.description || '',
    requirements: initialData.requirements || '',
    skills: initialData.skills || '',
    deadline: initialData.deadline ? initialData.deadline.slice(0, 10) : '',
    status: initialData.status || 'active'
  });
  const [error, setError] = useState('');
  const [showCustomTech, setShowCustomTech] = useState(false);
  const [customTech, setCustomTech] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Job Title Validation
    const titleRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#]+$/;
    if (!titleRegex.test(form.title.trim())) {
      setError('Job Title contains invalid characters. Only letters, numbers, spaces, and basic symbols (.,&()#-) are allowed.');
      return;
    }

    if (form.title.trim().length < 3) {
      setError('Job Title must be at least 3 characters.');
      return;
    }

    // Company Name Validation
    const companyRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#]+$/;
    if (!companyRegex.test(form.company.trim())) {
      setError('Company Name contains invalid characters. Only letters, numbers, spaces, and basic symbols (.,&()#-) are allowed.');
      return;
    }

    if (form.company.trim().length < 2) {
      setError('Company Name must be at least 2 characters.');
      return;
    }

    // Location Validation
    const locationRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\/\#]+$/;
    if (!locationRegex.test(form.location.trim())) {
      setError('Location contains invalid characters. Only letters, numbers, spaces, slashes, and basic punctuation are allowed.');
      return;
    }

    if (form.location.trim().length < 2) {
      setError('Location must be at least 2 characters.');
      return;
    }



    // Required Skills Validation
    if (form.skills.trim()) {
      const skillsRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#\+]+$/;
      if (!skillsRegex.test(form.skills.trim())) {
        setError('Required Skills contains invalid characters. Only alphanumeric chars, spaces, commas, and basic symbols are allowed.');
        return;
      }
    }

    onSubmit(form);
  }

  const inputClass = 'w-full border rounded-lg px-3.5 py-2 mt-1 focus:outline-none focus:border-teal text-sm bg-white';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white border border-hair p-6 rounded-2xl shadow-sm">
      {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-semibold">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase font-mono text-muted">Job Title *</label>
          <input
            name="title"
            maxLength={LIMITS.title}
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="e.g. Senior Frontend Developer"
          />
          <CharCounter current={form.title.length} max={LIMITS.title} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase font-mono text-muted">Company Name *</label>
          <input
            name="company"
            maxLength={LIMITS.company}
            value={form.company}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="e.g. ApexCorp"
          />
          <CharCounter current={form.company.length} max={LIMITS.company} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase font-mono text-muted">Location *</label>
          <input
            name="location"
            maxLength={LIMITS.location}
            value={form.location}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="e.g. San Francisco, CA / Remote"
          />
          <CharCounter current={form.location.length} max={LIMITS.location} />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase font-mono text-muted">Job Type</label>
          <select name="job_type" value={form.job_type} onChange={handleChange} className={inputClass}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase font-mono text-muted">Application Deadline</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase font-mono text-muted">Job Description *</label>
        <textarea
          name="description"
          maxLength={LIMITS.description}
          value={form.description}
          onChange={handleChange}
          required
          rows="5"
          className={inputClass}
          placeholder="Outline the daily duties, role scope, and work parameters..."
        />
        <CharCounter current={form.description.length} max={LIMITS.description} />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase font-mono text-muted">Job Requirements</label>
        <textarea
          name="requirements"
          maxLength={LIMITS.requirements}
          value={form.requirements}
          onChange={handleChange}
          rows="3"
          className={inputClass}
          placeholder="Outline qualifications, years of experience, and degrees needed..."
        />
        <CharCounter current={form.requirements.length} max={LIMITS.requirements} />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase font-mono text-muted block mb-1">Required Skills</label>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'Other') {
              setShowCustomTech(true);
              e.target.value = '';
              return;
            }
            if (!val) return;
            const currentTags = form.skills ? form.skills.split(',').map(t => t.trim()) : [];
            if (!currentTags.includes(val)) {
              const newTags = [...currentTags, val];
              setForm({ ...form, skills: newTags.join(', ') });
            }
            e.target.value = ''; // Reset select
          }}
          className={inputClass}
        >
          <option value="">-- Choose a Required Skill --</option>
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
                  const currentTags = form.skills ? form.skills.split(',').map(t => t.trim()) : [];
                  if (!currentTags.includes(val)) {
                    const newTags = [...currentTags, val];
                    setForm({ ...form, skills: newTags.join(', ') });
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
          {form.skills ? (
            form.skills.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal/10 text-teal text-xs font-mono font-semibold">
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const currentTags = form.skills.split(',').map(t => t.trim()).filter(Boolean);
                    const newTags = currentTags.filter(t => t !== tag);
                    setForm({ ...form, skills: newTags.join(', ') });
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
        <CharCounter current={form.skills.length} max={LIMITS.skills} />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase font-mono text-muted">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <button
        disabled={submitting}
        className="bg-ink text-white font-semibold px-6 py-3 rounded-full hover:bg-teal transition-all duration-300 disabled:opacity-50 shadow"
      >
        {submitting ? 'Saving...' : 'Save Job'}
      </button>
    </form>
  );
}
