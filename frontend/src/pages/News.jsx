import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { initialNews } from '../data/initialData';

export default function News() {
  const [newsList, setNewsList] = useState(initialNews);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [copied, setCopied] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchNews();
  }, []);

  function fetchNews() {
    api.get('/news')
      .then((res) => {
        if (res.data?.news && res.data.news.length > 0) {
          setNewsList(res.data.news);
        }
      })
      .catch((err) => {
        console.error('Failed to load news from API, using fallback:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Format image url safely
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
    // Simple filename fallback
    return `/assets/news/${imgPath}`;
  };

  const filteredNews = newsList.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.date && item.date.toLowerCase().includes(q))
    );
  });

  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const regularNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  function handleShare(item) {
    const textToCopy = `${item.title} - Read more on CodeClub: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-paper min-h-screen text-ink pb-24">
      {/* Hero Header */}
      <section className="border-b border-hair bg-white/50 backdrop-blur-sm py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3 font-semibold">
              002 — PRESS, MEDIA & ANNOUNCEMENTS
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink">
              CodeClub <span className="text-teal italic font-medium">Newsroom</span>
            </h1>
            <p className="text-muted mt-4 text-base md:text-lg leading-relaxed">
              Explore key milestones, partnerships, innovation conferences, and student-led startup announcements shaping technology and youth enablement.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news by keyword, topic, or date..."
                className="w-full bg-white border border-hair rounded-full py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:border-teal shadow-sm transition-all text-ink placeholder:text-muted/60"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-base">
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-5 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted text-sm font-mono tracking-wider">Loading CodeClub news stories...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white border border-hair rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <span className="text-4xl block mb-3">📰</span>
            <h3 className="font-display text-xl font-bold text-ink mb-2">No News Articles Found</h3>
            <p className="text-muted text-sm mb-6">
              {search ? `No articles matching "${search}". Try another search keyword.` : 'No news articles have been published yet.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="bg-teal text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-teal/90 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Hero Story (Only if no search filter active or matching first item) */}
            {!search && featuredNews && (
              <div className="bg-white border border-hair rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid md:grid-cols-12 gap-0 group">
                <div className="md:col-span-7 h-72 md:h-auto overflow-hidden bg-teal-light relative">
                  {getImageUrl(featuredNews.image) ? (
                    <img
                      src={getImageUrl(featuredNews.image)}
                      alt={featuredNews.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-teal text-xl font-bold">
                      CodeClub News
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-ink/80 backdrop-blur text-paper text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured Story
                  </span>
                </div>
                <div className="md:col-span-5 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-teal font-mono text-xs font-semibold mb-3">
                      <span>📅</span>
                      <span>{featuredNews.date || 'Recent'}</span>
                    </div>
                    <h2
                      onClick={() => setSelectedNews(featuredNews)}
                      className="font-display text-2xl md:text-3xl font-bold text-ink hover:text-teal cursor-pointer transition-colors leading-tight mb-4"
                    >
                      {featuredNews.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed line-clamp-4">
                      {featuredNews.description}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-hair flex items-center justify-between">
                    <button
                      onClick={() => setSelectedNews(featuredNews)}
                      className="inline-flex items-center gap-2 font-mono text-xs font-bold text-teal hover:text-ink transition-colors uppercase tracking-wider"
                    >
                      Read Full Story <span>→</span>
                    </button>
                    <span className="text-xs text-muted font-mono">CodeClub Media</span>
                  </div>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div>
              {!search && regularNews.length > 0 && (
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-2xl font-bold text-ink">More Stories & Releases</h3>
                  <span className="text-xs font-mono text-muted">{filteredNews.length} Total Articles</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(search ? filteredNews : regularNews).map((item) => (
                  <article
                    key={item.id}
                    className="bg-white border border-hair rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    <div className="h-48 w-full overflow-hidden bg-teal-light relative cursor-pointer" onClick={() => setSelectedNews(item)}>
                      {getImageUrl(item.image) ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-teal text-lg font-bold">
                          CodeClub
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-ink px-2.5 py-1 rounded-md text-[11px] font-mono font-medium shadow-sm">
                        📅 {item.date || 'CodeClub'}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => setSelectedNews(item)}
                          className="font-display text-lg font-bold text-ink group-hover:text-teal transition-colors duration-200 line-clamp-2 cursor-pointer mb-3 leading-snug"
                        >
                          {item.title}
                        </h4>
                        <p className="text-muted text-xs leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-hair flex items-center justify-between">
                        <button
                          onClick={() => setSelectedNews(item)}
                          className="text-xs font-mono font-bold text-teal group-hover:text-ink transition-colors uppercase tracking-wider inline-flex items-center gap-1"
                        >
                          Read Article <span>→</span>
                        </button>
                        <span className="text-[11px] font-mono text-muted/80">Press Release</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full News Story Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="bg-paper border border-hair rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="p-4 md:px-6 bg-white border-b border-hair flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-teal font-semibold">
                <span>📰</span>
                <span>CodeClub Official Story</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedNews)}
                  className="px-3 py-1.5 rounded-full border border-hair text-xs font-mono text-muted hover:text-ink hover:bg-teal-light/20 transition-colors flex items-center gap-1.5"
                  title="Copy link to clipboard"
                >
                  <span>🔗</span>
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-8 h-8 rounded-full bg-paper hover:bg-hair/50 flex items-center justify-center text-ink text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              {/* Image banner */}
              {getImageUrl(selectedNews.image) && (
                <div className="w-full rounded-2xl overflow-hidden max-h-96 bg-teal-light border border-hair">
                  <img
                    src={getImageUrl(selectedNews.image)}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover max-h-96"
                  />
                </div>
              )}

              {/* Publication Date */}
              <div className="flex items-center gap-3 text-xs font-mono text-muted border-b border-hair pb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal font-semibold">
                  📅 {selectedNews.date || 'Official Announcement'}
                </span>
                <span>•</span>
                <span>CodeClub Tech & Engineering Portal</span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight">
                {selectedNews.title}
              </h2>

              {/* Description body */}
              <div className="prose prose-sm md:prose-base text-ink/80 leading-relaxed space-y-4 whitespace-pre-line text-sm md:text-base font-normal">
                {selectedNews.description}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:px-8 bg-white border-t border-hair flex items-center justify-between">
              <Link
                to="/jobs"
                className="text-xs font-mono text-teal hover:underline font-semibold"
              >
                Explore Careers & Opportunities →
              </Link>
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-ink text-paper text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-teal transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
