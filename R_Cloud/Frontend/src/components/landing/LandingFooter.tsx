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
        { label: 'About R_Cloud', href: '/' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security & Trust', href: '#features' },
        { label: 'Contact Team', href: 'mailto:support@rcloud.ai' },
      ],
    },
  ];

  return (
    <footer className="relative w-full bg-[#032018] text-white pt-20 pb-12 overflow-hidden border-t border-emerald-950">
      {/* Top Footer Content */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-14 pb-16 border-b border-emerald-900/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold font-mono">
                R
              </div>
              <span className="font-manrope font-bold text-xl tracking-tight text-white">
                R_Cloud
              </span>
            </div>
            <p className="font-inter text-emerald-200/70 text-sm max-w-sm leading-relaxed">
              The unified context cloud and autonomous agent runtime for modern enterprise AI engineering.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • 99.99% SLA</span>
            </div>
          </div>

          {/* Nav Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-manrope font-semibold text-xs tracking-wider uppercase text-emerald-300">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm font-inter">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-emerald-100/70 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/50 font-mono gap-4">
          <p>© {new Date().getFullYear()} R_Cloud Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-emerald-200 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-emerald-200 transition-colors">
              Terms of Service
            </a>
            <a href="/dashboard/deployments" className="hover:text-emerald-200 transition-colors">
              Status
            </a>
          </div>
        </div>
      </div>

      {/* Massive Geometric Shape Interactive Wireframe Watermark */}
      <InteractiveFooterWatermark />
    </footer>
  );
}
