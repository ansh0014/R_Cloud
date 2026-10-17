import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepItem {
  id: number;
  badge: string;
  phase: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  tags: string[];
  metrics: { label: string; val: string }[];
}

const STEPS: StepItem[] = [
  {
    id: 1,
    badge: 'Step 01',
    phase: 'Ingestion',
    title: 'Knowledge Ingestion & Graph Synthesis',
    shortDesc: 'Stream APIs, documentation, databases and GitHub repos directly into an enterprise semantic graph.',
    fullDesc:
      'R_Cloud automatically crawls structured schemas and unstructured text, constructing real-time contextual knowledge graphs with bi-directional relational edges for zero-loss agent retrieval.',
    tags: ['GitHub Sync', 'Postgres & Vector DBs', 'Auto-Schema Discovery', 'Real-time Webhooks'],
    metrics: [
      { label: 'Ingestion Latency', val: '< 180ms' },
      { label: 'Graph Density', val: '2.4M Edges' },
    ],
  },
  {
    id: 2,
    badge: 'Step 02',
    phase: 'Reasoning',
    title: 'Autonomous Multi-Agent Orchestration',
    shortDesc: 'Coordinate specialized reasoning agents with shared context memory and deterministic guardrails.',
    fullDesc:
      'Deploy autonomous swarms with planning, tool calling, and evaluation loops. Enforce policy controls, token budget caps, and dynamic fallback chains without writing boilerplate.',
    tags: ['Tool Execution', 'Context Memory Mesh', 'Policy Guardrails', 'Sub-Agent Delegation'],
    metrics: [
      { label: 'Reasoning Speed', val: '142 tps' },
      { label: 'Accuracy Score', val: '99.4%' },
    ],
  },
  {
    id: 3,
    badge: 'Step 03',
    phase: 'Deployment',
    title: 'One-Click Isolated Cloud Runtime',
    shortDesc: 'Package agents into secure MicroVM containers with automatic TLS, edge proxies, and auto-scaling.',
    fullDesc:
      'Ship to production in seconds. Each agent runtime runs in a dedicated hardened sandbox with sub-100ms cold starts, instant rollbacks, and multi-region edge deployment.',
    tags: ['MicroVM Isolation', 'Auto-Scale 0 to 10k', 'Sub-100ms Cold Starts', 'Automated CI/CD'],
    metrics: [
      { label: 'Cold Start', val: '72 ms' },
      { label: 'Global Edge PoPs', val: '310+' },
    ],
  },
  {
    id: 4,
    badge: 'Step 04',
    phase: 'AgentOps',
    title: 'Real-Time Observability & Self-Healing',
    shortDesc: 'Inspect live distributed traces, token expenditure breakdowns, and streaming logs with automated alerts.',
    fullDesc:
      'Full-fidelity OpenTelemetry distributed spans across every tool call and LLM generation. Automated runtime self-healing proactively restarts degraded instances before users notice.',
    tags: ['Distributed Traces', 'Token Cost Tracker', 'Live WebSocket Logs', 'Auto Self-Healing'],
    metrics: [
      { label: 'Telemetry Jitter', val: '0.8 ms' },
      { label: 'Uptime SLA', val: '99.99%' },
    ],
  },
];

interface ScrollStorytellingProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

export default function ScrollStorytelling({ activeStep, onStepChange }: ScrollStorytellingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStepRef = useRef(activeStep);

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Unified scroll-driven controller: maps 340vh scroll runway smoothly across all 4 steps
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = el.offsetHeight - windowHeight;

      if (totalScrollable <= 0) return;

      // Pinning starts when top reaches 80px (sticky top-20)
      const scrolled = -rect.top + 80;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

      // Map progress evenly across all 4 steps:
      // 0.00..0.25 (step 0), 0.25..0.50 (step 1), 0.50..0.75 (step 2), 0.75..1.0 (step 3)
      const computedStep = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));

      if (computedStep !== activeStepRef.current) {
        activeStepRef.current = computedStep;
        onStepChange(computedStep);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onStepChange]);


  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative w-full bg-[#fbfdfc] border-t border-slate-200/80 scroll-mt-0"
      style={{ height: '340vh' }}
    >
      {/* Background subtle radial grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(16, 185, 129, 0.12) 1px, transparent 1px), radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Pinned Viewport Stage: Firmly pinned below navbar throughout the entire scroll runway */}
      <div className="sticky top-16 md:top-20 w-full min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 sm:py-8 px-5 sm:px-8 lg:px-12">
        <div className="relative max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-instrument text-slate-900 leading-[1.14]">
              How R_Cloud Powers Autonomous AI{' '}
              <span className="italic text-emerald-700">From Ingestion to Scale</span>
            </h2>
          </div>

          {/* 2-Column Showcase (Left: Unified Card Stage, Right: Firmly Pinned 3D Story Slot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Pinned Card Stage (Exact same smooth sliding animation for steps 1, 2, 3, 4) */}
            <div className="lg:col-span-5 relative w-full h-[440px] sm:h-[460px]">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                const isAbove = activeStep > idx;

                return (
                  <div
                    key={step.id}
                    style={{
                      transform: isActive
                        ? 'translateY(0) scale(1)'
                        : isAbove
                        ? 'translateY(-28px) scale(0.96)'
                        : 'translateY(32px) scale(0.96)',
                      opacity: isActive ? 1 : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                      zIndex: isActive ? 20 : 10,
                      transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                    }}
                    className="absolute inset-0 rounded-3xl bg-white border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Card Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/30 border-b border-slate-100 flex items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          0{step.id}
                        </span>
                        <span className="font-manrope text-xs sm:text-sm font-bold text-slate-800">
                          {step.badge} • {step.phase}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-manrope font-bold text-slate-900 mb-2.5 leading-snug">
                          {step.title}
                        </h3>

                        <p className="font-inter text-slate-600 text-[13px] sm:text-[14px] leading-relaxed mb-5">
                          {step.fullDesc}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100">
                        {/* 4 Feature Tags */}
                        <div className="flex flex-wrap gap-2">
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100/90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>

                        {/* 2 Live Metrics */}
                        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                          {step.metrics.map((m) => (
                            <div key={m.label}>
                              <p className="text-[11px] font-medium text-slate-500 font-inter">{m.label}</p>
                              <p className="text-[16px] sm:text-[17px] font-bold text-slate-900 font-manrope">
                                {m.val}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Firmly Centered 3D Showcase Slot */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              {/* Story Slot where Floating 3D Particle Canvas Docks directly on clean white background */}
              <div
                id="story-sphere-slot"
                className="relative w-full h-[380px] sm:h-[420px] lg:h-[460px] flex items-center justify-center pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
