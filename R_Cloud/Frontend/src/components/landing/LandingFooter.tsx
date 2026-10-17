import { Link } from 'react-router-dom';
import InteractiveFooterWatermark from './InteractiveFooterWatermark';

export default function LandingFooter() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Knowledge Graph', href: '#features' },
        { label: 'Agent Runtimes', href: '#how-it-works' },
        { label: 'Distributed Tracing', href: '#features' },
        { label: 'MicroVM Sandbox', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#faq' },
        { label: 'Architecture Specs', href: '#features' },
        { label: 'API Reference', href: '/dashboard' },
        { label: 'AgentOps Guide', href: '/dashboard/agents' },
        { label: 'System Status', href: '/dashboard/deployments' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About R_Cloud', href: '/about' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security & Trust', href: '#features' },
        { label: 'Contact Team', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="relative w-full bg-[#05180F] text-[#F7F9F7] pt-20 pb-12 overflow-hidden border-t border-[#0F3B27]">
      {/* Top Footer Content */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-14 pb-16 border-b border-[#0F3B27]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#92FF5F] flex items-center justify-center text-[#0F3B27] font-bold font-mono">
                R
              </div>
              <span className="font-manrope font-bold text-xl tracking-tight text-[#F7F9F7]">
                R_Cloud
              </span>
            </div>
            <p className="font-inter text-[#CFF1D2]/70 text-sm max-w-sm leading-relaxed">
              The unified context cloud and autonomous agent runtime for modern enterprise AI engineering.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-[#92FF5F]">
              <span className="w-2 h-2 rounded-full bg-[#92FF5F] animate-pulse" />
              <span>All Systems Operational • 99.99% SLA</span>
            </div>
          </div>

          {/* Nav Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-manrope font-bold text-xs tracking-wider uppercase text-[#92FF5F]">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm font-inter">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-[#CFF1D2]/70 hover:text-[#F7F9F7] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[#CFF1D2]/70 hover:text-[#F7F9F7] transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#CFF1D2]/50 font-mono gap-4">
          <p>© {new Date().getFullYear()} R_Cloud Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#92FF5F] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#92FF5F] transition-colors">
              Terms of Service
            </Link>
            <Link to="/dashboard/deployments" className="hover:text-[#92FF5F] transition-colors">
              Status
            </Link>
          </div>
        </div>
      </div>

      {/* Massive Geometric Shape Interactive Wireframe Watermark */}
      <InteractiveFooterWatermark />
    </footer>
  );
}
