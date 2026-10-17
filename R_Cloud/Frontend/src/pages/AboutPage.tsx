import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function AboutPage() {
  const stats = [
    { value: '< 12ms', label: 'Cold Start Latency', sub: 'Zero-overhead Firecracker microVMs' },
    { value: '99.99%', label: 'Uptime SLA', sub: 'Redundant multi-region edge nodes' },
    { value: '1.2B+', label: 'Agent Events Handled', sub: 'Deterministic event bus over NATS' },
    { value: 'Zero Trust', label: 'Hardware KMS', sub: 'Dedicated per-tenant hardware isolation' },
  ];

  const pillars = [
    {
      title: 'MicroVM Isolation',
      desc: 'Each autonomous agent executes inside a hardware-isolated microVM sandbox with ephemeral memory lifecycles and strictly policy-enforced egress rules.',
      tag: 'KERNEL LEVEL',
    },
    {
      title: 'Persistent Cognitive Graphs',
      desc: 'Agents retain dynamic semantic memories across sessions using our high-throughput vector & relational context fabric without token context bloat.',
      tag: 'CONTEXT FABRIC',
    },
    {
      title: 'Universal Multi-Model Swarm',
      desc: 'Seamlessly orchestrate hybrid fleets across Anthropic Claude, OpenAI o-series, Google Gemini, and open-weights models with automated fallback routing.',
      tag: 'MULTI-LLM',
    },
    {
      title: 'Real-Time Observability',
      desc: 'Sub-millisecond distributed tracing, token consumption diagnostics, live execution logs, and automated anomaly halting directly in your control plane.',
      tag: 'TELEMETRY',
    },
  ];

  const milestones = [
    {
      year: '2024 Q3',
      title: 'Inception of R_Cloud Protocol',
      desc: 'Engineered the initial distributed runtime architecture to overcome latency and context-loss bottlenecks in production multi-agent workflows.',
    },
    {
      year: '2025 Q1',
      title: 'MicroVM Sandbox Engine v1',
      desc: 'Achieved sub-15ms cold start deployments on bare metal clusters with custom Linux kernel patches and eBPF network instrumentation.',
    },
    {
      year: '2025 Q4',
      title: 'Enterprise Context Mesh Launch',
      desc: 'Rolled out hardware KMS encrypted persistent state, enabling Fortune 500 engineering teams to run production-grade autonomous agent clusters.',
    },
    {
      year: '2026',
      title: 'Global Autonomous Mesh',
      desc: 'Powering mission-critical agent workflows across 14 global regions with zero-downtime hot migration and automated budget caps.',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#05180F] text-[#F7F9F7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#92FF5F] mb-6">
          <Link to="/" className="hover:underline transition-colors">HOME</Link>
          <span className="text-[#CFF1D2]/40">/</span>
          <span className="text-[#F7F9F7] font-bold">ABOUT R_CLOUD</span>
        </div>

        {/* Hero Section */}
        <header className="border-b border-[#0F3B27] pb-14 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F3B27] border border-[#92FF5F]/30 text-xs font-mono text-[#92FF5F] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#92FF5F] animate-pulse" />
            ENGINEERED FOR THE AUTONOMOUS ERA
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-manrope text-[#F7F9F7] mb-6 max-w-4xl leading-tight">
            We build the compute & context backbone for <span className="text-[#92FF5F]">autonomous AI agents</span>.
          </h1>
          <p className="text-lg sm:text-xl font-inter text-[#CFF1D2]/80 max-w-3xl leading-relaxed">
            Standard cloud infrastructure was designed for web servers and stateless microservices. R_Cloud provides the specialized compute substrates, millisecond cognitive memory, and kernel-isolated sandboxes required to run reliable, production-ready AI agents at scale.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0F3B27]/70 border border-[#CFF1D2]/15 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm hover:border-[#92FF5F]/40 transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl font-extrabold font-manrope text-[#92FF5F] mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-[#F7F9F7] mb-1">
                {stat.label}
              </div>
              <div className="text-xs font-mono text-[#CFF1D2]/60">
                {stat.sub}
              </div>
            </div>
          ))}
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-4xl font-bold font-manrope text-[#F7F9F7] border-l-4 border-[#92FF5F] pl-4">
              Our Core Mission
            </h2>
            <p className="text-base font-inter text-[#CFF1D2]/85 leading-relaxed">
              When autonomous agents break out of chat interfaces into real-world codebases, databases, and business systems, they face three fatal obstacles: memory drift, sandbox escapes, and opaque failures.
            </p>
            <p className="text-base font-inter text-[#CFF1D2]/85 leading-relaxed">
              R_Cloud solves this foundational layer. We deliver deterministic environments where agents can plan, execute code, access tools, and persist state safely — with real-time human oversight and cryptographic security guarantees.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#92FF5F] text-[#05180F] font-bold text-sm hover:bg-[#92FF5F]/90 transition-all shadow-lg shadow-[#92FF5F]/20"
              >
                Deploy Free Sandbox
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0F3B27] border border-[#CFF1D2]/25 text-[#F7F9F7] font-semibold text-sm hover:border-[#92FF5F] transition-all"
              >
                Contact Enterprise Team
              </Link>
            </div>
          </div>

          <div className="bg-[#0F3B27]/40 border border-[#CFF1D2]/15 rounded-2xl p-6 sm:p-8 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#CFF1D2]/10 text-[#CFF1D2]/60">
              <span>MANIFEST SPEC v2.4</span>
              <span className="text-[#92FF5F]">STATUS: ACTIVE</span>
            </div>
            <pre className="text-[#92FF5F] overflow-x-auto leading-relaxed">
{`agent:
  id: "ragent-autonomous-orchestrator"
  runtime: "firecracker-microvm-v2"
  isolation: "kernel-level-cgroups-v2"
  memory_limit: "4096Mi"
  timeout_ms: 300000
  secrets_vault: "kms://vault-prod-e1"
  telemetry:
    tracing: "opentelemetry"
    anomaly_halt: true`}
            </pre>
            <div className="pt-2 text-[#CFF1D2]/70 text-[11px] border-t border-[#CFF1D2]/10">
              * Every agent runs with fine-grained CPU pinning and hardware memory encryption.
            </div>
          </div>
        </section>

        {/* Architectural Pillars */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-[#F7F9F7] mb-3">
              Architectural Pillars
            </h2>
            <p className="text-sm font-inter text-[#CFF1D2]/75">
              Engineered from the silicon up for zero-downtime autonomous workloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[#0F3B27]/50 border border-[#CFF1D2]/15 rounded-2xl p-7 hover:border-[#92FF5F]/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-manrope text-[#F7F9F7] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm font-inter text-[#CFF1D2]/80 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-[#F7F9F7] mb-3">
              Our Journey
            </h2>
            <p className="text-sm font-inter text-[#CFF1D2]/75">
              Rapid iteration driven by real-world enterprise agent deployments.
            </p>
          </div>

          <div className="space-y-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 bg-[#0F3B27]/40 border border-[#CFF1D2]/10 rounded-2xl p-6"
              >
                <div className="w-28 flex-shrink-0 font-mono text-sm font-bold text-[#92FF5F] bg-[#05180F] px-3 py-1.5 rounded-lg border border-[#92FF5F]/30 text-center">
                  {m.year}
                </div>
                <div>
                  <h4 className="text-lg font-bold font-manrope text-[#F7F9F7] mb-1">
                    {m.title}
                  </h4>
                  <p className="text-sm font-inter text-[#CFF1D2]/80 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
