import { useState } from 'react';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyNo: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!form.email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/messages', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        companyNo: form.companyNo.trim(),
        message: form.message.trim()
      });

      if (res.data?.success) {
        setSuccess(true);
        setForm({
          name: '',
          email: '',
          phone: '',
          companyNo: '',
          message: ''
        });
      } else {
        setError(res.data?.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper min-h-screen text-ink py-16 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header Badge */}
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal mb-3 font-semibold">
            003 — GET IN TOUCH
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Let's talk <span className="text-teal italic font-medium">engineering</span>.
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-base md:text-lg leading-relaxed">
            Whether you want to hire top talent, verify credentials, partner with CodeClub, or discuss software solutions — our team is here for you.
          </p>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Info & Location */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-hair rounded-3xl p-8 shadow-xs space-y-6">
              <h2 className="font-display text-xl font-bold text-ink border-b border-hair pb-4">
                Official Headquarters
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0 text-lg">
                    📍
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Physical Address</h4>
                    <p className="text-muted mt-0.5 leading-relaxed">
                      Liberty Mall, University Road, Peshawar, Khyber Pakhtunkhwa, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0 text-lg">
                    ✉️
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Direct Email</h4>
                    <a
                      href="mailto:info@codeclub.tech"
                      className="text-teal hover:underline mt-0.5 block font-mono text-xs"
                    >
                      info@codeclub.tech
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0 text-lg">
                    📞
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Phone Support</h4>
                    <a
                      href="tel:+923140078748"
                      className="text-teal hover:underline mt-0.5 block font-mono text-xs"
                    >
                      +92 314 0078748
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0 text-lg">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Corporate Status</h4>
                    <p className="text-muted text-xs font-mono mt-0.5">
                      SECP Registered Company (Reg: 0306424)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-light/40 border border-teal/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-teal font-mono text-xs font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal animate-ping"></span>
                  <span>Active Response Time</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Inquiries submitted via this portal are routed directly to our operations and talent teams with a standard reply window within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-hair rounded-3xl p-8 md:p-10 shadow-sm">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-ink">Send Us a Message</h2>
                <p className="text-muted text-sm mt-1">
                  Fill out the details below and we will get back to you promptly.
                </p>
              </div>

              {/* Success Notification */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl mb-6 flex items-start gap-3 animate-in fade-in duration-300">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                    <p className="text-xs text-green-700 mt-0.5">
                      Thank you for getting in touch. Your message has been received and our team will contact you shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-mono uppercase text-muted block mb-1.5 font-semibold">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full border border-hair rounded-xl px-4 py-3 bg-paper/50 focus:bg-white focus:outline-none focus:border-teal text-sm text-ink transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-mono uppercase text-muted block mb-1.5 font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full border border-hair rounded-xl px-4 py-3 bg-paper/50 focus:bg-white focus:outline-none focus:border-teal text-sm text-ink transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-mono uppercase text-muted block mb-1.5 font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full border border-hair rounded-xl px-4 py-3 bg-paper/50 focus:bg-white focus:outline-none focus:border-teal text-sm text-ink transition-colors"
                    />
                  </div>

                  {/* Company Number / Details */}
                  <div>
                    <label className="text-xs font-mono uppercase text-muted block mb-1.5 font-semibold">
                      Company Number / Organization
                    </label>
                    <input
                      type="text"
                      value={form.companyNo}
                      onChange={(e) => setForm({ ...form, companyNo: e.target.value })}
                      placeholder="e.g. +92 91 1234567 or ApexCorp"
                      className="w-full border border-hair rounded-xl px-4 py-3 bg-paper/50 focus:bg-white focus:outline-none focus:border-teal text-sm text-ink transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-mono uppercase text-muted block mb-1.5 font-semibold">
                    Message / Inquiry Details
                  </label>
                  <textarea
                    rows="5"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your project, talent requirements, or any inquiries..."
                    className="w-full border border-hair rounded-xl px-4 py-3 bg-paper/50 focus:bg-white focus:outline-none focus:border-teal text-sm text-ink leading-relaxed transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ink text-paper py-3.5 px-6 rounded-full font-semibold text-sm hover:bg-teal transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <span>✉️</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
