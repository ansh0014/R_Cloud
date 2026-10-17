import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LimelightNav, type NavItem } from './ui/limelight-nav';
import { Cpu, Box, BarChart3, CircleDollarSign, BookOpen } from 'lucide-react';

/* ─── SVG Icons ──────────────────────────────────────────── */

const RCloudLogo = () => (
  <div className="flex items-center gap-2.5 group cursor-pointer">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center transition-transform group-hover:scale-105">
      <svg
        width="18"
        height="18"
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
    <span className="font-manrope font-bold text-[17px] text-white tracking-tight">
      R_Cloud
    </span>
  </div>
);

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
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
    width="20"
    height="20"
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

/* ─── Main Component ─────────────────────────────────────── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth scroll handler with offset for top floating islands
  const scrollToTarget = (targetHash: string, tabIndex: number) => {
    setActiveTab(tabIndex);
    setMobileOpen(false);

    if (location.pathname !== '/') {
      navigate(`/${targetHash}`);
      return;
    }

    const cleanId = targetHash.replace('#', '');
    const targetElement =
      document.getElementById(cleanId) ||
      (cleanId === 'product' ? document.getElementById('features') : null) ||
      (cleanId === 'features' ? document.getElementById('product') : null);

    if (targetElement) {
      let offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

      // When opening Architecture, snap cleanly to its top boundary so 0% of the Hero section is visible
      if (cleanId === 'how-it-works') {
        offsetPosition = offsetPosition + 2;
      } else {
        offsetPosition = Math.max(0, offsetPosition - 60);
      }

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      window.history.pushState(null, '', targetHash);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveTab(0);
    }
  };

  // Nav Items with project functionality and money icon for pricing
  const limelightItems: NavItem[] = [
    {
      id: 'nav-architecture',
      icon: <Cpu strokeWidth={1.8} />,
      label: 'Architecture',
      onClick: () => scrollToTarget('#how-it-works', 0),
    },
    {
      id: 'nav-product',
      icon: <Box strokeWidth={1.8} />,
      label: 'Product',
      onClick: () => scrollToTarget('#product', 1),
    },
    {
      id: 'nav-solutions',
      icon: <BarChart3 strokeWidth={1.8} />,
      label: 'Solutions',
      onClick: () => scrollToTarget('#solutions', 2),
    },
    {
      id: 'nav-pricing',
      icon: <CircleDollarSign strokeWidth={1.8} />,
      label: 'Pricing',
      onClick: () => scrollToTarget('#pricing', 3),
    },
    {
      id: 'nav-docs',
      icon: <BookOpen strokeWidth={1.8} />,
      label: 'Docs',
      onClick: () => scrollToTarget('#faq', 4),
    },
  ];

  // Auto-detect active section based on scroll position accurately
  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollY = window.pageYOffset;

      // When near top (hero), activate Architecture tab
      if (scrollY < 300) {
        setActiveTab(0);
        return;
      }

      const sections = [
        { id: 'how-it-works', fallbackId: '', index: 0 },
        { id: 'product', fallbackId: 'features', index: 1 },
        { id: 'solutions', fallbackId: '', index: 2 },
        { id: 'pricing', fallbackId: '', index: 3 },
        { id: 'faq', fallbackId: '', index: 4 },
      ];

      for (const { id, fallbackId, index } of sections) {
        const el = document.getElementById(id) || (fallbackId ? document.getElementById(fallbackId) : null);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Element is active if it's within the reading/active viewport zone
          if (rect.top <= 240 && rect.bottom >= 120) {
            setActiveTab(index);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  return (
    <>
      {/* ── 1. Left Island: Logo Pill ────────────────────────── */}
      <header className="fixed top-4 left-4 sm:left-8 z-40">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#021d15]/85 backdrop-blur-xl border border-emerald-900/60 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-all duration-300 no-underline cursor-pointer group"
          aria-label="R_Cloud Home"
        >
          <RCloudLogo />
        </Link>
      </header>

      {/* ── 2. Center Island: Limelight Navigation Pill ──────── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center justify-center">
        <LimelightNav
          items={limelightItems}
          activeIndex={activeTab}
          onTabChange={(index) => setActiveTab(index)}
          className="bg-[#0e0e11]/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-xl h-12 px-1.5"
          limelightClassName="bg-white shadow-[0_0_8px_#ffffff,0_0_18px_rgba(255,255,255,0.8)]"
          showLabels={false}
        />
      </div>

      {/* ── 3. Right Island: Auth & Action Buttons Pill ──────── */}
      <div className="fixed top-4 right-4 sm:right-8 z-40 flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#021d15]/85 backdrop-blur-xl border border-emerald-900/60 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <Link
            to="/login"
            id="nav-signin-btn"
            className="font-manrope font-semibold text-xs text-emerald-100/80 hover:text-white transition-colors duration-200 no-underline px-3 py-1.5 rounded-full hover:bg-emerald-900/40"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            id="nav-get-started-btn"
            className="font-manrope font-bold text-xs text-slate-950 bg-white rounded-full px-4 py-1.5 cursor-pointer no-underline shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:bg-emerald-50 hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)] transition-all duration-200"
          >
            Get started
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden p-2.5 rounded-full bg-[#021d15]/85 backdrop-blur-xl border border-emerald-900/60 shadow-lg text-white hover:border-emerald-500/50 cursor-pointer"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* ── Mobile Full-screen Overlay ──────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#021f17]/98 backdrop-blur-2xl flex flex-col items-center justify-start pt-16 px-6 text-center animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <button
            id="mobile-menu-close"
            className="absolute top-6 right-6 p-2 rounded-full bg-emerald-950/80 border border-emerald-800 text-white cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </button>

          <Link to="/" onClick={handleLogoClick} className="mb-8">
            <RCloudLogo />
          </Link>

          <div className="w-full max-w-sm flex flex-col gap-3">
            {limelightItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border text-left transition-all ${
                  activeTab === idx
                    ? 'bg-emerald-900/40 border-emerald-500/60 text-white shadow-lg'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-manrope font-bold text-sm">{item.label}</span>
                </div>
                {activeTab === idx && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm pt-8 mt-4 border-t border-emerald-900/60">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-white font-manrope font-semibold bg-emerald-950/80 border border-emerald-800 text-center"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-slate-900 font-manrope font-bold bg-white text-center shadow-md hover:bg-emerald-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
