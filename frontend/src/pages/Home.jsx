import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard.jsx';
import {
  initialClients,
  initialProjects,
  initialNews,
  initialTestimonials,
  initialJobs
} from '../data/initialData';

export default function Home() {
  const [latestJobs, setLatestJobs] = useState(initialJobs);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState(initialClients);
  const [projects, setProjects] = useState(initialProjects);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [news, setNews] = useState(initialNews);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const getClientLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://') || logoPath.startsWith('data:')) {
      return logoPath;
    }
    if (logoPath.startsWith('/assets/')) {
      return logoPath;
    }
    if (logoPath.startsWith('assets/')) {
      return `/${logoPath}`;
    }
    if (logoPath.startsWith('/uploads/')) {
      return `${BASE_URL}${logoPath}`;
    }
    if (logoPath.startsWith('uploads/')) {
      return `${BASE_URL}/${logoPath}`;
    }
    return `/assets/clients/${logoPath}`;
  };

  const getProjectImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    if (imgPath.startsWith('/assets/')) {
      return imgPath;
    }
    if (imgPath.startsWith('assets/')) {
      return `/${imgPath}`;
    }
    if (imgPath.startsWith('/uploads/')) {
      return `${BASE_URL}${imgPath}`;
    }
    if (imgPath.startsWith('uploads/')) {
      return `${BASE_URL}/${imgPath}`;
    }
    return `/assets/casestudy/${imgPath}`;
  };

  const getNewsImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    if (imgPath.startsWith('/assets/')) {
      return imgPath;
    }
    if (imgPath.startsWith('assets/')) {
      return `/${imgPath}`;
    }
    if (imgPath.startsWith('/uploads/')) {
      return `${BASE_URL}${imgPath}`;
    }
    if (imgPath.startsWith('uploads/')) {
      return `${BASE_URL}/${imgPath}`;
    }
    return `/assets/news/${imgPath}`;
  };

  const getImageUrl = getNewsImageUrl;

  useEffect(() => {
    // Load latest jobs from API if available
    api.get('/jobs?limit=6')
      .then((res) => {
        if (res.data?.jobs && res.data.jobs.length > 0) {
          setLatestJobs(res.data.jobs);
        }
      })
      .catch(() => {});

    // Load clients from API if available
    api.get('/clients')
      .then((res) => {
        if (res.data?.clients && res.data.clients.length > 0) {
          setClients(res.data.clients);
        }
      })
      .catch(() => {});

    // Load projects from API if available
    api.get('/projects')
      .then((res) => {
        if (res.data?.projects && res.data.projects.length > 0) {
          setProjects(res.data.projects);
        }
      })
      .catch(() => {});

    // Load testimonials from API if available
    api.get('/testimonials')
      .then((res) => {
        if (res.data?.testimonials && res.data.testimonials.length > 0) {
          setTestimonials(res.data.testimonials);
        }
      })
      .catch(() => {});

    // Load latest news from API if available
    api.get('/news?limit=3')
      .then((res) => {
        if (res.data?.news && res.data.news.length > 0) {
          setNews(res.data.news);
        }
      })
      .catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  }

  return (
    <div className="bg-paper min-h-screen text-ink overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-5 min-h-[calc(100vh-68px)] flex flex-col justify-center py-12 relative">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-4 animate-pulse">
          001 — ACCREDITED VERIFIED TALENT REGISTRY
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink max-w-3xl font-bold">
          Find top software work that <span className="italic text-teal font-semibold">fits</span> your skills.
        </h1>
        <p className="text-muted mt-4 max-w-xl text-sm md:text-base leading-relaxed">
          Connecting CodeClub engineering graduates with leading tech companies. Verify credentials and apply for developer opportunities.
        </p>

        <form onSubmit={handleSearch} className="max-w-xl mt-10 flex gap-0 rounded-full border-2 border-ink overflow-hidden bg-white shadow-md focus-within:ring-2 focus-within:ring-teal/30 transition-all duration-300">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, skill, or company"
            className="flex-1 px-6 py-4 bg-transparent focus:outline-none text-ink placeholder:text-muted/60 text-sm"
          />
          <button className="bg-ink text-paper font-semibold px-8 hover:bg-teal hover:text-white transition-all duration-300">
            Search
          </button>
        </form>
      </section>

      {/* Certificate Verification Section */}
      <section className="bg-white border-y border-hair py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3">Cryptographic Verification</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink font-semibold mb-4">Verify CodeClub Certificates</h2>
              <p className="text-muted text-base leading-relaxed mb-6">
                Every CodeClub certificate is secured with HMAC-SHA256 cryptographic signatures. Instantly verify the authenticity of any certificate issued by CodeClub.
              </p>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-6 py-3 rounded-full hover:bg-teal transition-colors"
              >
                <ShieldCheck className="w-5 h-5" />
                Verify a Certificate
              </Link>
            </div>
            <div className="bg-paper border border-hair rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center text-teal">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink">Tamper-Proof Registry</h3>
                  <p className="text-xs text-muted">HMAC-SHA256 integrity checks</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted">
                <div className="flex items-start gap-2">
                  <span className="text-teal mt-0.5">✓</span>
                  <p>Each certificate is cryptographically signed with a unique server-side key</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal mt-0.5">✓</span>
                  <p>QR codes link to our verification endpoints for physical document validation</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal mt-0.5">✓</span>
                  <p>Real-time revocation tracking instantly updates verification states</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      {clients.length > 0 && (
        <section className="bg-teal-light/30 border-y border-hair py-16 px-5">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-teal text-center mb-8">
              Trusted by leading clients & partners
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
              {clients.map((client) => {
                const logoUrl = getClientLogoUrl(client.logo);
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="group cursor-pointer flex flex-col items-center transition-transform hover:scale-105 duration-300"
                  >
                    {logoUrl ? (
                      <>
                        <img
                          src={logoUrl}
                          alt={client.name}
                          className="h-12 max-w-[150px] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'block';
                            }
                          }}
                        />
                        <span className="font-display text-base font-bold text-muted group-hover:text-teal transition-colors hidden">
                          {client.name}
                        </span>
                      </>
                    ) : (
                      <span className="font-display text-base font-bold text-muted group-hover:text-teal transition-colors">
                        {client.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper border border-hair rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink text-xl"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-4">
              {getClientLogoUrl(selectedClient.logo) ? (
                <img
                  src={getClientLogoUrl(selectedClient.logo)}
                  alt={selectedClient.name}
                  className="h-12 w-24 object-contain bg-white p-1 border rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-display text-xl font-bold text-teal">{selectedClient.name}</span>
              )}
              <div>
                <h3 className="font-bold text-lg">{selectedClient.name}</h3>
                {selectedClient.service && (
                  <p className="text-xs font-mono text-teal font-medium">{selectedClient.service}</p>
                )}
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed">{selectedClient.description || selectedClient.about || 'No information available.'}</p>
          </div>
        </div>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-2">Our Work & Case Studies</p>
              <h2 className="font-display text-2xl md:text-3xl text-ink font-semibold">Featured Projects & Case Studies</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectImg = getProjectImageUrl(project.image);
              return (
                <div
                  key={project.id}
                  className="bg-white border border-hair rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {projectImg ? (
                    <div className="h-44 w-full overflow-hidden bg-teal-light/50 relative">
                      <img
                        src={projectImg}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {project.projectType && (
                        <span className="absolute top-2.5 right-2.5 bg-ink/80 backdrop-blur text-paper text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {project.projectType}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-teal-light flex items-center justify-center font-display text-teal text-base font-bold">
                      {project.title}
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-base text-ink font-semibold group-hover:text-teal transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-muted text-xs mt-1.5 leading-relaxed line-clamp-3">{project.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-hair">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(project.tags && project.tags.length > 0 ? project.tags : (project.techStack ? project.techStack.split(',') : [])).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-teal-light text-teal text-[10px] font-mono">
                            {String(tag).trim()}
                          </span>
                        ))}
                      </div>
                      {(project.link || project.liveLink) && (
                        <a
                          href={project.link || project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-teal hover:text-ink font-semibold transition-colors"
                        >
                          Live Project ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}



      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="border-t border-hair py-20 px-5 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3">Feedback</p>
              <h2 className="font-display text-3xl text-ink font-semibold">What Clients Say</h2>
            </div>

            {/* Slider Container */}
            <div className="relative max-w-2xl mx-auto">
              {/* Card wrapper with padding to give arrows space */}
              <div className="px-12">
                <div
                  className="bg-paper border border-hair rounded-2xl p-8 flex flex-col justify-between shadow-sm relative min-h-[240px] transition-all duration-500 animate-in fade-in"
                  key={currentTestimonialIndex} // resets key on index change to trigger CSS animation
                >
                  <div>
                    <div className="flex gap-1 text-gold mb-6 text-base justify-center">
                      {'★'.repeat(testimonials[currentTestimonialIndex].rating)}{'☆'.repeat(5 - testimonials[currentTestimonialIndex].rating)}
                    </div>
                    <p className="text-muted italic text-center text-sm md:text-base leading-relaxed">
                      "{testimonials[currentTestimonialIndex].content}"
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-hair/50">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-teal-light border">
                      {testimonials[currentTestimonialIndex].avatar ? (
                        <img
                          src={testimonials[currentTestimonialIndex].avatar.startsWith('http') ? testimonials[currentTestimonialIndex].avatar : `${BASE_URL}${testimonials[currentTestimonialIndex].avatar}`}
                          alt={testimonials[currentTestimonialIndex].name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-display text-teal text-sm font-bold bg-teal-light">
                          {testimonials[currentTestimonialIndex].name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-ink">{testimonials[currentTestimonialIndex].name}</h4>
                      <p className="text-xs text-muted font-mono">{testimonials[currentTestimonialIndex].role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prev Button */}
              <button
                onClick={() =>
                  setCurrentTestimonialIndex((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-hair w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-teal hover:text-white hover:border-teal transition-all shadow-sm focus:outline-none"
              >
                ←
              </button>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentTestimonialIndex((prev) =>
                    prev === testimonials.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-hair w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-teal hover:text-white hover:border-teal transition-all shadow-sm focus:outline-none"
              >
                →
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonialIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                    currentTestimonialIndex === idx ? 'bg-teal w-6' : 'bg-hair hover:bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Jobs / Careers Section */}
      <section className="max-w-6xl mx-auto px-5 py-24 border-t border-hair">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3">Careers</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink font-semibold">Current Openings</h2>
          </div>
          <Link to="/jobs" className="font-mono text-xs uppercase tracking-wider text-teal hover:underline font-bold">
            View all jobs →
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <p className="text-muted">No jobs posted yet — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Latest News & Press Releases Section */}
      {news.length > 0 && (
        <section className="bg-white border-t border-hair py-24 px-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline justify-between mb-12">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3">Press & Media</p>
                <h2 className="font-display text-3xl md:text-4xl text-ink font-semibold">Latest News & Updates</h2>
              </div>
              <Link to="/news" className="font-mono text-xs uppercase tracking-wider text-teal hover:underline font-bold">
                View all news →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-paper border border-hair rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <div
                    className="h-48 w-full overflow-hidden bg-teal-light relative cursor-pointer"
                    onClick={() => setSelectedNews(item)}
                  >
                    {getImageUrl(item.image) ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-teal text-base font-bold">
                        CodeClub
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-ink px-2.5 py-1 rounded-md text-[10px] font-mono font-medium shadow-xs">
                      📅 {item.date || 'CodeClub'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => setSelectedNews(item)}
                        className="font-display text-base font-bold text-ink group-hover:text-teal transition-colors duration-200 line-clamp-2 cursor-pointer mb-2"
                      >
                        {item.title}
                      </h3>
                      <p className="text-muted text-xs leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-hair/60 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="text-xs font-mono font-bold text-teal group-hover:text-ink transition-colors uppercase tracking-wider inline-flex items-center gap-1"
                      >
                        Read Story <span>→</span>
                      </button>
                      <span className="text-[10px] font-mono text-muted/70">Press Release</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full News Story Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="bg-paper border border-hair rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:px-6 bg-white border-b border-hair flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-teal font-semibold">
                <span>📰</span>
                <span>CodeClub Official Story</span>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 rounded-full bg-paper hover:bg-hair/50 flex items-center justify-center text-ink text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              {getImageUrl(selectedNews.image) && (
                <div className="w-full rounded-2xl overflow-hidden max-h-96 bg-teal-light border border-hair">
                  <img
                    src={getImageUrl(selectedNews.image)}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover max-h-96"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 text-xs font-mono text-muted border-b border-hair pb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal font-semibold">
                  📅 {selectedNews.date || 'Official Announcement'}
                </span>
                <span>•</span>
                <span>CodeClub Newsroom</span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight">
                {selectedNews.title}
              </h2>

              <div className="text-ink/80 leading-relaxed space-y-4 whitespace-pre-line text-sm md:text-base">
                {selectedNews.description}
              </div>
            </div>

            <div className="p-4 md:px-8 bg-white border-t border-hair flex items-center justify-between">
              <Link
                to="/news"
                className="text-xs font-mono text-teal hover:underline font-semibold"
              >
                View all news articles →
              </Link>
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-ink text-paper text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-teal transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About strip */}
      <section className="bg-teal-light border-t border-hair py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-4">About JobPortal</p>
          <h2 className="font-display text-3xl text-ink mb-4 font-semibold">
            We built this for people, not resumes.
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            JobPortal connects talented candidates with companies that are actually hiring —
            no dead listings, no guesswork. Post a role in minutes, apply in seconds.
          </p>
        </div>
      </section>
    </div>
  );
}
