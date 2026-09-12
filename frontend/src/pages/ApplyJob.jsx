import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// Character limits — enforced both by the browser and validated on submit.
const LIMITS = {
  first_name: 50,
  last_name: 50,
  email: 150,
  phone: 20,
  address: 255,
  education: 150,
  experience: 150,
  skills: 255,
  linkedin: 255,
  github: 255,
  cover_letter: 1000
};

const EDUCATION_LEVELS = [
  'Matric / O-Level',
  'Intermediate / A-Level',
  'Bachelor\'s Degree (BS / BA)',
  'Master\'s Degree (MS / MA)',
  'Doctorate (PhD)',
  'Diploma / Certification',
  'Other'
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
  'React Native', 'Flutter', 'Swift', 'Kotlin'
];

function FieldLabel({ children, required }) {
  return (
    <label className="text-sm font-medium text-ink">
      {children} {required && <span className="text-gold-dark">*</span>}
    </label>
  );
}

function CharCounter({ current = 0, max }) {
  const pct = current / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-gold-dark' : 'text-muted';
  return (
    <p className={`font-mono text-[11px] mt-1 text-right ${color}`}>
      {current} / {max}
    </p>
  );
}

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [countryCode, setCountryCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [experienceValue, setExperienceValue] = useState('');
  const [skillsValue, setSkillsValue] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCustomTech, setShowCustomTech] = useState(false);
  const [customTech, setCustomTech] = useState('');

  const handleExperienceChange = (e) => {
    const val = e.target.value;
    const filtered = val.replace(/\D/g, ''); // Keep only digits
    setExperienceValue(filtered);
    setValue('experience', filtered, { shouldValidate: true });
  };

  const handleSkillsSelect = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setShowCustomTech(true);
      e.target.value = '';
      return;
    }
    if (!val) return;
    const currentTags = skillsValue ? skillsValue.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(val)) {
      const newTags = [...currentTags, val];
      const joined = newTags.join(', ');
      setSkillsValue(joined);
      setValue('skills', joined, { shouldValidate: true });
    }
    e.target.value = ''; // Reset select
  };

  const handleFormSubmit = (data) => {
    setFormDataToSubmit(data);
    setShowConfirmModal(true);
  };

  const COUNTRIES = [
    { code: '+92', name: 'PK 🇵🇰' },
    { code: '+1', name: 'US/CA 🇺🇸' },
    { code: '+44', name: 'UK 🇬🇧' },
    { code: '+971', name: 'AE 🇦🇪' },
    { code: '+966', name: 'SA 🇸🇦' },
    { code: '+91', name: 'IN 🇮🇳' },
    { code: '+61', name: 'AU 🇦🇺' },
    { code: '+49', name: 'DE 🇩🇪' },
    { code: '+33', name: 'FR 🇫🇷' },
    { code: '+81', name: 'JP 🇯🇵' }
  ];

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Keep only digits
    const filtered = val.replace(/\D/g, '');
    setPhoneNumber(filtered);
    setValue('phone', filtered, { shouldValidate: true });
  };

  useEffect(() => {
    // Fetch job details to verify status and availability
    api.get(`/jobs/${id}`)
      .then((res) => {
        const fetchedJob = res.data.job;
        setJob(fetchedJob);
        
        // Validation check for availability
        if (!fetchedJob) {
          setJobError('The specified job posting does not exist.');
        } else if (fetchedJob.status !== 'active') {
          setJobError('This job posting is closed and no longer accepting applications.');
        } else if (fetchedJob.deadline && new Date() > new Date(fetchedJob.deadline)) {
          setJobError('The application deadline for this position has passed.');
        }
      })
      .catch((err) => {
        setJobError('Failed to retrieve job details. It might have been deleted.');
      })
      .finally(() => {
        setLoadingJob(false);
      });
  }, [id]);

  async function onSubmit(data) {
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('job_id', id);
      
      // Concatenate First Name & Last Name to full name for backend compatibility
      const fullName = `${data.first_name.trim()} ${data.last_name.trim()}`;
      formData.append('name', fullName);

      Object.keys(data).forEach((key) => {
        if (key === 'resume') {
          if (data.resume && data.resume[0]) {
            formData.append('resume', data.resume[0]);
          }
        } else if (key === 'phone') {
          // Combine selected country code and digit-only phone number
          const combinedPhone = `${countryCode} ${data.phone.trim()}`;
          formData.append('phone', combinedPhone);
        } else if (key === 'education' && data.education === 'Other') {
          formData.append('education', data.custom_education ? data.custom_education.trim() : 'Other');
        } else if (key === 'linkedin' || key === 'github') {
          const val = data[key]?.trim();
          if (val) {
            const formattedUrl = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
            formData.append(key, formattedUrl);
          }
        } else if (key !== 'first_name' && key !== 'last_name' && key !== 'custom_education') {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        }
      });

      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowSuccessModal(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full border border-hair rounded-lg px-4 py-2.5 mt-1.5 bg-white focus:outline-none focus:border-teal transition-colors text-sm';
  const errorClass = 'text-red-500 text-xs mt-1 font-medium';

  if (loadingJob) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal mb-4"></div>
        <p className="text-muted font-mono text-sm">Verifying job availability...</p>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center bg-white border border-hair rounded-2xl my-10 shadow-sm">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-2xl font-bold">
          !
        </div>
        <h2 className="font-display text-2xl text-ink font-semibold mb-3">Application Closed</h2>
        <p className="text-muted text-md mb-8 max-w-md mx-auto">{jobError}</p>
        <Link to="/jobs" className="bg-ink text-paper px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal transition-colors">
          Browse Active Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <Link to={`/jobs/${id}`} className="font-mono text-xs uppercase tracking-wide text-teal hover:underline">
        ← Back to job
      </Link>

      <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mt-6 mb-2">Application Form</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold mb-2">
        Apply for {job?.title}
      </h1>
      <p className="text-muted text-sm mb-8">{job?.company} — {job?.location}</p>

      {submitError && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-xs font-semibold">{submitError}</p>}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 bg-white border border-hair rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Name Fields (First Name / Last Name Split) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>First name</FieldLabel>
            <input
              maxLength={LIMITS.first_name}
              placeholder="e.g. John"
              className={inputClass}
              {...register('first_name', { 
                required: 'First name is required', 
                maxLength: LIMITS.first_name,
                pattern: { value: /^[a-zA-Z\s]+$/, message: 'Only letters allowed' }
              })}
            />
            {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
            <CharCounter current={watch('first_name')?.length || 0} max={LIMITS.first_name} />
          </div>
          <div>
            <FieldLabel required>Last name</FieldLabel>
            <input
              maxLength={LIMITS.last_name}
              placeholder="e.g. Doe"
              className={inputClass}
              {...register('last_name', { 
                required: 'Last name is required', 
                maxLength: LIMITS.last_name,
                pattern: { value: /^[a-zA-Z\s]+$/, message: 'Only letters allowed' }
              })}
            />
            {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
            <CharCounter current={watch('last_name')?.length || 0} max={LIMITS.last_name} />
          </div>
        </div>

        <div>
          <FieldLabel required>Email address</FieldLabel>
          <input
            type="email"
            placeholder="john.doe@example.com"
            className={inputClass}
            {...register('email', { 
              required: 'Email is required', 
              pattern: { 
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                message: 'Please enter a valid email address (e.g. name@example.com)' 
              }
            })}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <FieldLabel required>Phone number</FieldLabel>
          <div className="flex gap-2 mt-1.5">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border border-hair rounded-lg px-3 py-2.5 bg-white text-sm focus:outline-none focus:border-teal text-ink w-32"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
            <input
              type="text"
              maxLength={LIMITS.phone}
              placeholder="e.g. 3001234567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="flex-1 border border-hair rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:border-teal text-sm text-ink"
            />
          </div>
          <input
            type="hidden"
            {...register('phone', { 
              required: 'Phone number is required', 
              validate: (val) => (val && val.length >= 7) || 'Phone number must be at least 7 digits'
            })}
          />
          <div className="flex justify-between items-start mt-1">
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            <div className="flex-1" />
            <CharCounter current={phoneNumber.length} max={LIMITS.phone} />
          </div>
        </div>

        <div>
          <FieldLabel>Home address</FieldLabel>
          <input 
            maxLength={LIMITS.address} 
            placeholder="Street address, City, Country"
            className={inputClass} 
            {...register('address', { maxLength: LIMITS.address })} 
          />
          <CharCounter current={watch('address')?.length || 0} max={LIMITS.address} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Highest education level</FieldLabel>
            <select
              className={inputClass}
              {...register('education', { required: 'Education level is required' })}
            >
              <option value="">-- Choose Education --</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.education && <p className={errorClass}>{errors.education.message}</p>}
            
            {watch('education') === 'Other' && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="Please specify your education level..."
                  className={inputClass}
                  {...register('custom_education', { required: 'Please specify your education level' })}
                />
                {errors.custom_education && <p className={errorClass}>{errors.custom_education.message}</p>}
              </div>
            )}
          </div>

          <div>
            <FieldLabel required>Years of professional experience</FieldLabel>
            <input
              type="text"
              maxLength={2}
              placeholder="e.g. 3"
              value={experienceValue}
              onChange={handleExperienceChange}
              className={inputClass}
            />
            <input
              type="hidden"
              {...register('experience', { 
                required: 'Years of experience is required'
              })}
            />
            {errors.experience && <p className={errorClass}>{errors.experience.message}</p>}
          </div>
        </div>

        <div>
          <FieldLabel required>Skills</FieldLabel>
          <select
            onChange={handleSkillsSelect}
            className={inputClass}
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
                    const currentTags = skillsValue ? skillsValue.split(',').map(t => t.trim()) : [];
                    if (!currentTags.includes(val)) {
                      const newTags = [...currentTags, val];
                      const joined = newTags.join(', ');
                      setSkillsValue(joined);
                      setValue('skills', joined, { shouldValidate: true });
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
          <input
            type="hidden"
            {...register('skills', {
              required: 'At least one skill is required'
            })}
          />
          {/* Selected Skills Badges display */}
          <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-white border border-hair rounded-xl min-h-[48px]">
            {skillsValue ? (
              skillsValue.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal/10 text-teal text-xs font-mono font-semibold">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const currentTags = skillsValue.split(',').map(t => t.trim()).filter(Boolean);
                      const newTags = currentTags.filter(t => t !== tag);
                      const joined = newTags.join(', ');
                      setSkillsValue(joined);
                      setValue('skills', joined, { shouldValidate: true });
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
          {errors.skills && <p className={errorClass}>{errors.skills.message}</p>}
        </div>

        {/* Professional & Social Profiles */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>LinkedIn profile</FieldLabel>
            <div className="relative mt-1.5">
              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                className={inputClass}
                {...register('linkedin', {
                  required: 'LinkedIn profile URL is required',
                  validate: (val) => {
                    if (!val || !val.trim()) return 'LinkedIn profile URL is required';
                    const cleanVal = val.trim();
                    const urlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_\-–%]+\/?.*$/i;
                    if (!urlPattern.test(cleanVal)) {
                      return 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)';
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.linkedin && <p className={errorClass}>{errors.linkedin.message}</p>}
          </div>

          <div>
            <FieldLabel>GitHub profile <span className="text-muted font-normal text-xs">(optional)</span></FieldLabel>
            <div className="relative mt-1.5">
              <input
                type="text"
                placeholder="https://github.com/username"
                className={inputClass}
                {...register('github', {
                  validate: (val) => {
                    if (!val || !val.trim()) return true;
                    const cleanVal = val.trim();
                    const urlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9\-_.]+\/?$/i;
                    if (!urlPattern.test(cleanVal)) {
                      return 'Please enter a valid GitHub URL (e.g. https://github.com/username)';
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.github && <p className={errorClass}>{errors.github.message}</p>}
          </div>
        </div>

        <div>
          <FieldLabel required>Resume upload (PDF format only, max 10MB)</FieldLabel>
          <input
            type="file"
            accept="application/pdf"
            className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-light file:text-teal file:font-semibold file:cursor-pointer`}
            {...register('resume', { 
              required: 'Resume is required',
              validate: {
                fileType: (value) => !value[0] || value[0].type === 'application/pdf' || 'Only PDF format is supported',
                fileSize: (value) => !value[0] || value[0].size <= 10 * 1024 * 1024 || 'File size must be under 10MB'
              }
            })}
          />
          {errors.resume && <p className={errorClass}>{errors.resume.message}</p>}
        </div>

        <div>
          <FieldLabel>Cover letter (optional)</FieldLabel>
          <textarea
            rows="5"
            placeholder="Write a brief cover letter outlining your suitability..."
            maxLength={LIMITS.cover_letter}
            className={inputClass}
            {...register('cover_letter', { maxLength: LIMITS.cover_letter })}
          />
          <CharCounter current={watch('cover_letter')?.length || 0} max={LIMITS.cover_letter} />
        </div>

        <button
          disabled={submitting}
          className="w-full bg-ink text-paper font-semibold py-3.5 rounded-full hover:bg-teal hover:text-white transition-all duration-300 disabled:opacity-50 shadow"
        >
          {submitting ? 'Submitting Application…' : 'Submit application'}
        </button>
      </form>

      {/* Submission Confirmation Modal Overlay */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="text-center">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="font-display text-xl font-bold text-ink text-center">
              Confirm Submission
            </h3>
            <p className="text-xs text-muted leading-relaxed text-center">
              Are you sure all the entered application details and uploaded documents are correct?
              <br/><span className="text-teal font-semibold">Please verify your details before clicking confirm.</span>
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-hair rounded-lg py-2.5 text-xs font-semibold hover:bg-paper transition-colors text-ink"
              >
                Review Data
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmit(formDataToSubmit);
                }}
                className="flex-1 bg-teal hover:bg-teal/90 text-white rounded-lg py-2.5 text-xs font-semibold transition-colors shadow-sm"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-hair rounded-2xl p-8 max-w-sm w-full shadow-lg text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="h-16 w-16 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-ink">
                Application Submitted!
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Thank you for applying. Your job application has been successfully received. We will review your profile and contact you soon.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/jobs/${id}`, { state: { applied: true } });
              }}
              className="w-full bg-ink hover:bg-teal hover:text-white text-white rounded-full py-3 text-sm font-semibold transition-colors shadow-sm"
            >
              Back to Job Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
