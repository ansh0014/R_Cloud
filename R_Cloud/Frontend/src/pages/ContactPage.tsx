import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    agentCount: '1-10 agents',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('submitted');
    }, 900);
  };

  const contactChannels = [
    {
      title: 'Enterprise Architecture',
      email: 'sales@rcloud.ai',
      sla: '< 2 hour response',
      desc: 'Private cloud deployments, custom KMS integration, VPC peering, and volume pricing.',
      icon: '🏢',
    },
    {
      title: 'Technical Support & SLA',
      email: 'support@rcloud.ai',
      sla: '< 15 min Tier-1 SLA',
      desc: '24/7 dedicated engineering support for production agent clusters and runtime errors.',
      icon: '⚡',
    },
    {
      title: 'Security & Compliance',
      email: 'security@rcloud.ai',
      sla: 'Priority triage',
      desc: 'SOC2 Type II compliance reports, penetration testing attestations, and vulnerability disclosures.',
      icon: '🔒',
    },
  ];

  const locations = [
    { city: 'San Francisco', region: 'US-West-1 Core PoP' },
    { city: 'Frankfurt', region: 'EU-Central-1 Node' },
    { city: 'Bengaluru', region: 'AP-South-1 Engineering Node' },
    { city: 'Singapore', region: 'AP-Southeast-1 Edge' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#05180F] text-[#F7F9F7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#92FF5F] mb-6">
          <Link to="/" className="hover:underline transition-colors">HOME</Link>
          <span className="text-[#CFF1D2]/40">/</span>
          <span className="text-[#F7F9F7] font-bold">CONTACT & SUPPORT</span>
        </div>

        {/* Header */}
        <header className="border-b border-[#0F3B27] pb-12 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F3B27] border border-[#92FF5F]/30 text-xs font-mono text-[#92FF5F] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#92FF5F] animate-pulse" />
            DIRECT ENGINEERING ESCALATION
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-manrope text-[#F7F9F7] mb-4">
            Connect with <span className="text-[#92FF5F]">R_Cloud</span>
          </h1>
          <p className="text-base sm:text-lg font-inter text-[#CFF1D2]/80 max-w-2xl leading-relaxed">
            Whether you are migrating an enterprise agent fleet, discussing high-throughput SLAs, or seeking runtime support, our engineering team is here to assist.
          </p>
        </header>

        {/* Channels Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactChannels.map((c) => (
            <div
              key={c.title}
              className="bg-[#0F3B27]/50 border border-[#CFF1D2]/15 rounded-2xl p-6 hover:border-[#92FF5F]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-3">{c.icon}</div>
                <h3 className="text-lg font-bold font-manrope text-[#F7F9F7] mb-1">
                  {c.title}
                </h3>
                <span className="inline-block text-[11px] font-mono text-[#92FF5F] bg-[#92FF5F]/10 px-2 py-0.5 rounded border border-[#92FF5F]/20 mb-3">
                  {c.sla}
                </span>
                <p className="text-sm font-inter text-[#CFF1D2]/75 leading-relaxed mb-4">
                  {c.desc}
                </p>
              </div>
              <a
                href={`mailto:${c.email}`}
                className="text-sm font-mono text-[#92FF5F] hover:underline flex items-center gap-1.5"
              >
                {c.email} &rarr;
              </a>
            </div>
          ))}
        </section>

        {/* Main Form & Edge Locations */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-[#0F3B27]/40 border border-[#CFF1D2]/15 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold font-manrope text-[#F7F9F7] mb-2">
              Send a Direct Message
            </h2>
            <p className="text-sm font-inter text-[#CFF1D2]/70 mb-6">
              Fill in your details and an infrastructure engineer will get back to you shortly.
            </p>

            {status === 'submitted' ? (
              <div className="p-8 rounded-2xl bg-[#05180F] border border-[#92FF5F]/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#92FF5F]/20 text-[#92FF5F] mx-auto flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold font-manrope text-[#F7F9F7]">
                  Message Dispatched
                </h3>
                <p className="text-sm font-inter text-[#CFF1D2]/80 max-w-sm mx-auto">
                  Thank you, {formData.name || 'there'}. Your ticket has been logged in our escalation queue. An engineer will follow up at <span className="text-[#92FF5F]">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setFormData({ name: '', email: '', company: '', agentCount: '1-10 agents', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0F3B27] border border-[#CFF1D2]/25 text-xs font-mono text-[#F7F9F7] hover:border-[#92FF5F]"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#CFF1D2]/80 mb-1.5">
                      YOUR NAME *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/20 text-sm text-[#F7F9F7] placeholder-[#CFF1D2]/30 focus:border-[#92FF5F] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CFF1D2]/80 mb-1.5">
                      WORK EMAIL *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/20 text-sm text-[#F7F9F7] placeholder-[#CFF1D2]/30 focus:border-[#92FF5F] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#CFF1D2]/80 mb-1.5">
                      COMPANY / ORG
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Autonomous AI"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/20 text-sm text-[#F7F9F7] placeholder-[#CFF1D2]/30 focus:border-[#92FF5F] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CFF1D2]/80 mb-1.5">
                      PLANNED FLEET SIZE
                    </label>
                    <select
                      value={formData.agentCount}
                      onChange={(e) => setFormData({ ...formData, agentCount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/20 text-sm text-[#F7F9F7] focus:border-[#92FF5F] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="1-10 agents">1 - 10 Agents (Developer)</option>
                      <option value="10-100 agents">10 - 100 Agents (Growth)</option>
                      <option value="100+ agents">100+ Agents (Enterprise Scale)</option>
                      <option value="Custom Dedicated Cluster">Custom Bare-Metal Cluster</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#CFF1D2]/80 mb-1.5">
                    PROJECT ARCHITECTURE & REQUIREMENTS *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your agents' memory requirements, tool integrations, and expected request volume..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/20 text-sm text-[#F7F9F7] placeholder-[#CFF1D2]/30 focus:border-[#92FF5F] focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 rounded-xl bg-[#92FF5F] text-[#05180F] font-bold text-sm hover:bg-[#92FF5F]/90 transition-all shadow-lg shadow-[#92FF5F]/20 disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Transmitting Request...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Locations & Quick Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0F3B27]/30 border border-[#CFF1D2]/15 rounded-3xl p-6 sm:p-7 space-y-4">
              <h3 className="text-lg font-bold font-manrope text-[#F7F9F7] flex items-center gap-2">
                <span>🌐</span> Global Edge Substrates
              </h3>
              <p className="text-xs font-inter text-[#CFF1D2]/75 leading-relaxed">
                R_Cloud orchestrates low-latency microVM execution points across major international hubs with sub-20ms roundtrip latency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {locations.map((loc) => (
                  <div
                    key={loc.city}
                    className="p-3 rounded-xl bg-[#05180F] border border-[#CFF1D2]/10"
                  >
                    <div className="text-sm font-semibold text-[#F7F9F7]">{loc.city}</div>
                    <div className="text-[11px] font-mono text-[#92FF5F]">{loc.region}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0F3B27]/30 border border-[#CFF1D2]/15 rounded-3xl p-6 sm:p-7 space-y-3 font-mono text-xs">
              <div className="text-[#92FF5F] font-bold">EMERGENCY ESCALATION HOTLINE</div>
              <p className="text-[#CFF1D2]/75 leading-relaxed font-inter text-xs">
                Active enterprise customers with Enterprise 24/7 SLA contracts may ping the emergency PagerDuty rota directly via their assigned Slack Connect channel.
              </p>
              <div className="text-[11px] text-[#CFF1D2]/50 pt-2 border-t border-[#CFF1D2]/10">
                PGP Fingerprint: <span className="text-[#92FF5F]">E72A 940B F13C 4991</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
