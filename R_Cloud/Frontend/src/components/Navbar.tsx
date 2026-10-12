import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── SVG Icons ──────────────────────────────────────────── */

const RCloudLogo = () => (
  <div className="flex items-center gap-2.5 group cursor-pointer">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center transition-transform group-hover:scale-105">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="font-manrope font-bold text-[18px] text-white tracking-tight">
      R_Cloud
    </span>
  </div>
);

const ChevronDown = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Nav Data ───────────────────────────────────────────── */

const navLinks = [
  { label: 'Product',       href: '#features',     hasDropdown: true  },
  { label: 'Architecture',  href: '#how-it-works', hasDropdown: false },
  { label: 'Solutions',     href: '#features',     hasDropdown: true  },
  { label: 'Pricing',       href: '#faq',          hasDropdown: false },
  { label: 'Docs',          href: '#faq',          hasDropdown: false },
];

/* ─── Component ──────────────────────────────────────────── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Fixed Constant Edge-to-Edge Rectangular Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 w-full z-40 h-[64px] bg-[#021d15]/95 backdrop-blur-md border-b border-emerald-900/60 flex items-center justify-between px-6 lg:px-10"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo — extreme left */}
        <Link to="/" className="flex items-center decoration-transparent shrink-0">
          <RCloudLogo />
        </Link>

        {/* Nav Links — center */}
        <ul className="hidden lg:flex items-center justify-center gap-7 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="flex items-center gap-1 font-manrope font-medium text-[14px]
                  text-emerald-100/80 hover:text-white transition-colors duration-200 no-underline"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown />}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons — extreme right */}
        <div className="hidden lg:flex items-center justify-end gap-4 shrink-0">
          <Link
            to="/login"
            id="nav-signin-btn"
            className="font-manrope font-semibold text-[14px] text-emerald-100 hover:text-white transition-colors duration-200 no-underline px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            id="nav-get-started-btn"
            className="font-manrope font-semibold text-[14px] text-slate-950
              bg-white rounded-full px-5 py-2 cursor-pointer no-underline
              shadow-[0_2px_14px_rgba(16,185,129,0.3)]
              hover:bg-emerald-50 transition-all duration-200"
          >
            Get started
          </Link>
        </div>

        {/* Hamburger — right (mobile) */}
        <button
          id="mobile-menu-toggle"
          className="lg:hidden p-1 cursor-pointer bg-transparent border-none text-white"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ── Mobile Full-screen Overlay ──────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#021f17] flex flex-col items-center justify-center gap-8 px-6 text-center animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <button
            id="mobile-menu-close"
            className="absolute top-6 right-6 p-2 cursor-pointer bg-transparent border-none text-white"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </button>

          <RCloudLogo />

          <ul className="flex flex-col gap-6 list-none m-0 p-0 text-xl font-manrope font-medium text-emerald-100">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 w-full max-w-xs pt-4 border-t border-emerald-900/60">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-white font-manrope font-semibold bg-emerald-950 border border-emerald-800"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-slate-900 font-manrope font-bold bg-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
