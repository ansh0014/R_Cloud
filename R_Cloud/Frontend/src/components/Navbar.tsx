import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── SVG Icons ──────────────────────────────────────────── */

const RCloudLogo = () => (
  <div className="flex items-center gap-2.5">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#7b39fc" />
      <path
        d="M8 10h8a4 4 0 0 1 0 8h-4l5 6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="22" r="3" fill="white" fillOpacity="0.5" />
    </svg>
    <span className="font-manrope font-semibold text-[16px] text-white tracking-tight">
      R Agent Cloud
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
  { label: 'Platform',   hasDropdown: true  },
  { label: 'AgentOps',   hasDropdown: false },
  { label: 'Docs',       hasDropdown: false },
  { label: 'Pricing',    hasDropdown: false },
];

/* ─── Component ──────────────────────────────────────────── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Main Navbar ────────────────────────────────────── */}
      <nav
        className="absolute top-0 left-0 right-0 z-20 grid grid-cols-3 items-center
          px-6 lg:px-[120px] py-[18px]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo — left */}
        <Link to="/" className="flex items-center decoration-transparent">
          <RCloudLogo />
        </Link>

        {/* Nav Links — center */}
        <ul className="hidden lg:flex items-center justify-center gap-8 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href="#"
                className="flex items-center gap-1 font-manrope font-medium text-[14px]
                  text-white/90 hover:text-white hover:opacity-90
                  transition-all duration-200 no-underline"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown />}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons — right (desktop) */}
        <div className="hidden lg:flex items-center justify-end gap-3">
          {/* Sign In — default white style */}
          <Link
            to="/login"
            id="nav-signin-btn"
            className="font-manrope font-semibold text-[14px] text-[#171717]
              bg-white border border-[#d4d4d4] rounded-[8px]
              px-4 py-[7px] cursor-pointer no-underline
              hover:bg-gray-50 transition-colors duration-200"
          >
            Sign In
          </Link>
          {/* Get Started — opens animated signup page */}
          <Link
            to="/signup"
            id="nav-get-started-btn"
            className="font-manrope font-semibold text-[14px] text-white
              bg-[#7b39fc] rounded-[8px]
              px-4 py-[7px] cursor-pointer no-underline
              shadow-[0_2px_14px_rgba(123,57,252,0.5)]
              hover:bg-[#6620f0] transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger — right (mobile) */}
        <button
          id="mobile-menu-toggle"
          className="lg:hidden col-start-3 justify-self-end p-1
            cursor-pointer bg-transparent border-none"
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
          className="fixed inset-0 z-50 bg-[#0d0b17] flex flex-col
            items-center justify-center gap-10"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <button
            id="mobile-menu-close"
            className="absolute top-5 right-6 p-1 cursor-pointer
              bg-transparent border-none"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </button>

          {/* Brand in overlay */}
          <div className="mb-2">
            <RCloudLogo />
          </div>

          {/* Links */}
          <ul className="flex flex-col items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href="#"
                  className="flex items-center gap-2 font-manrope font-medium text-[20px]
                    text-white hover:text-white/80 transition-opacity duration-200
                    no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown />}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Buttons */}
          <div className="flex flex-col items-center gap-4 w-full px-8">
            <Link
              to="/login"
              id="mobile-signin-btn"
              className="font-manrope font-semibold text-[16px] text-[#171717]
                bg-white border border-[#d4d4d4] rounded-[8px]
                px-6 py-3 w-full cursor-pointer text-center no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              id="mobile-get-started-btn"
              className="font-manrope font-semibold text-[16px] text-white
                bg-[#7b39fc] rounded-[8px]
                px-6 py-3 w-full cursor-pointer text-center no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
