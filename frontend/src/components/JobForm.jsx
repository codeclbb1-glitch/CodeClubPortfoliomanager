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

function FieldGroup({ label, required, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase font-mono text-muted">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
      {children}
    </div>
  );
}

export default function JobForm({ initialData = {}, onSubmit, submitting, className = '' }) {
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

    const titleRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#]+$/;
    if (!titleRegex.test(form.title.trim())) {
      setError('Job Title contains invalid characters. Only letters, numbers, spaces, and basic symbols (.,&()#-) are allowed.');
      return;
    }
    if (form.title.trim().length < 3) {
      setError('Job Title must be at least 3 characters.');
      return;
    }

    const companyRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#]+$/;
    if (!companyRegex.test(form.company.trim())) {
      setError('Company Name contains invalid characters. Only letters, numbers, spaces, and basic symbols (.,&()#-) are allowed.');
      return;
    }
    if (form.company.trim().length < 2) {
      setError('Company Name must be at least 2 characters.');
      return;
    }

    const locationRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\/\#]+$/;
    if (!locationRegex.test(form.location.trim())) {
      setError('Location contains invalid characters. Only letters, numbers, spaces, slashes, and basic punctuation are allowed.');
      return;
    }
    if (form.location.trim().length < 2) {
      setError('Location must be at least 2 characters.');
      return;
    }

    if (form.skills.trim()) {
      const skillsRegex = /^[a-zA-Z0-9\s\-\(\)\.\,\&\#\+]+$/;
      if (!skillsRegex.test(form.skills.trim())) {
        setError('Required Skills contains invalid characters. Only alphanumeric chars, spaces, commas, and basic symbols are allowed.');
        return;
      }
    }

    onSubmit(form);
  }

  const inputClass = 'w-full border border-hair rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-teal transition-colors text-sm text-ink';
  const sectionClass = 'bg-white border border-hair rounded-2xl p-6 shadow-sm space-y-5';

  return (
    <form onSubmit={handleSubmit} className={`max-w-3xl ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className={sectionClass}>
        <div className="grid md:grid-cols-2 gap-5">
          <FieldGroup label="Job Title" required hint="e.g. Senior Frontend Developer">
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
          </FieldGroup>

          <FieldGroup label="Company Name" required hint="e.g. ApexCorp">
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
          </FieldGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FieldGroup label="Location" required hint="e.g. San Francisco, CA / Remote">
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
          </FieldGroup>

          <FieldGroup label="Job Type">
            <select name="job_type" value={form.job_type} onChange={handleChange} className={inputClass}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </FieldGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FieldGroup label="Application Deadline" hint="Leave empty if there is no deadline">
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className={inputClass}
            />
          </FieldGroup>

          <FieldGroup label="Status">
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </FieldGroup>
        </div>
      </div>

      <div className={sectionClass}>
        <FieldGroup label="Job Description" required hint="Outline the daily duties, role scope, and work parameters...">
          <textarea
            name="description"
            maxLength={LIMITS.description}
            value={form.description}
            onChange={handleChange}
            required
            rows="6"
            className={inputClass}
            placeholder="Outline the daily duties, role scope, and work parameters..."
          />
          <CharCounter current={form.description.length} max={LIMITS.description} />
        </FieldGroup>

        <FieldGroup label="Job Requirements" hint="Outline qualifications, years of experience, and degrees needed...">
          <textarea
            name="requirements"
            maxLength={LIMITS.requirements}
            value={form.requirements}
            onChange={handleChange}
            rows="4"
            className={inputClass}
            placeholder="Outline qualifications, years of experience, and degrees needed..."
          />
          <CharCounter current={form.requirements.length} max={LIMITS.requirements} />
        </FieldGroup>
      </div>

      <div className={sectionClass}>
        <FieldGroup label="Required Skills" hint="Choose from predefined skills or add your own.">
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
              e.target.value = '';
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
            <div className="flex gap-2 mt-3">
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
                className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
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

          <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white border border-hair rounded-xl min-h-[48px]">
            {form.skills ? (
              form.skills.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 text-teal text-xs font-mono font-semibold">
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
              <span className="text-xs text-muted font-sans py-1">No skills selected yet.</span>
            )}
          </div>
          <CharCounter current={form.skills.length} max={LIMITS.skills} />
        </FieldGroup>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-white font-semibold px-8 py-3 rounded-full hover:bg-teal transition-all duration-300 disabled:opacity-50 shadow"
        >
          {submitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
}
