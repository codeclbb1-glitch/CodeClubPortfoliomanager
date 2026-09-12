import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white text-muted mt-24 border-t border-hair">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo and About */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/assets/codeclub_logo.png"
                alt="Code Club"
                className="w-11 h-11 object-contain flex-shrink-0"
              />
              <span className="font-display text-2xl font-bold text-ink tracking-tight">CodeClub</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Modern, scalable, and intelligent software engineering solutions. Building the future of developers.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-mono text-xs tracking-wider uppercase text-ink mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal transition-colors">Custom Software Development</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">Web & Mobile Apps</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">Artificial Intelligence & ML</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">UI/UX Design Solutions</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">Cybersecurity Systems</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono text-xs tracking-wider uppercase text-ink mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-teal transition-colors">About Us</Link></li>
              <li><Link to="/news" className="hover:text-teal transition-colors">News & Media</Link></li>
              <li><Link to="/jobs" className="hover:text-teal transition-colors">Careers / Jobs</Link></li>
              <li><Link to="/verify" className="hover:text-teal transition-colors">Certificate Registry</Link></li>
              <li><Link to="/contact" className="hover:text-teal transition-colors">Contact Support</Link></li>
              <li className="text-[11px] text-[#526075] mt-3">SECP Reg: 0306424</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-mono text-xs tracking-wider uppercase text-ink mb-4">Get in Touch</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal mt-1">📍</span>
                <span>Liberty Mall, University Road, Peshawar, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">✉️</span>
                <a href="mailto:info@codeclub.tech" className="hover:text-teal transition-colors">info@codeclub.tech</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">📞</span>
                <span>+92 314 0078748</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-hair pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} CodeClub (SMC-PRIVATE) LIMITED. All rights reserved.</p>
          <div className="flex gap-6 text-[#526075]">
            <a href="#" className="hover:text-teal transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-teal transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-teal transition-colors">SECP Verified</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
