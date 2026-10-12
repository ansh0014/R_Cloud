import { useEffect, useRef, useState } from 'react';
import { Layers, Shield, Cpu, Zap, Activity, GitFork, ArrowUpRight, Sparkles } from 'lucide-react';

export default function BentoFeatures() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const cards = [
    {
      id: 'matrix',
      icon: Cpu,
      title: 'Neural Matrix & Context Graphs',
      desc: 'Automatic entity extraction and topological graph embedding. Query cross-database relationships in sub-millisecond graph traversals.',
      badge: 'Context Engine',
      colSpan: 'lg:col-span-7',
      stat: '2.4M Nodes',
      statLabel: 'Graph Traversals < 1.2ms',
      diagram: (
        <div className="w-full h-36 flex items-center justify-between px-2 sm:px-6">
          <div className="relative w-full max-w-md h-28 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 240 100" className="w-full h-full stroke-emerald-600 fill-none" strokeWidth="1.5">
              {/* Connected Edges */}
              <path d="M40 50 L95 25 M40 50 L95 75 M95 25 L150 25 M95 75 L150 75 M150 25 L200 50 M150 75 L200 50 M95 25 L95 75 M150 25 L150 75" strokeDasharray="3 3" className="stroke-emerald-400" />
              {/* Nodes */}
              <circle cx="40" cy="50" r="14" className="fill-emerald-100 stroke-emerald-600" />
              <circle cx="95" cy="25" r="12" className="fill-emerald-50 stroke-emerald-500" />
              <circle cx="95" cy="75" r="12" className="fill-emerald-50 stroke-emerald-500" />
              <circle cx="150" cy="25" r="12" className="fill-emerald-50 stroke-emerald-500" />
              <circle cx="150" cy="75" r="12" className="fill-emerald-50 stroke-emerald-500" />
              <circle cx="200" cy="50" r="14" className="fill-emerald-600 stroke-emerald-700" />
              {/* Inner Node Labels */}
              <text x="40" y="53" textAnchor="middle" className="fill-emerald-800 text-[8px] font-mono font-bold">API</text>
              <text x="95" y="28" textAnchor="middle" className="fill-emerald-700 text-[8px] font-mono font-bold">SQL</text>
              <text x="95" y="78" textAnchor="middle" className="fill-emerald-700 text-[8px] font-mono font-bold">VEC</text>
              <text x="150" y="28" textAnchor="middle" className="fill-emerald-700 text-[8px] font-mono font-bold">ENT</text>
              <text x="150" y="78" textAnchor="middle" className="fill-emerald-700 text-[8px] font-mono font-bold">REL</text>
              <text x="200" y="53" textAnchor="middle" className="fill-white text-[8px] font-mono font-bold">LLM</text>
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: 'sandboxes',
      icon: Layers,
      title: 'Isolated MicroVM Sandboxes',
      desc: 'Run untrusted agent code in deterministic hardware-isolated microVMs. Instant freeze/thaw capabilities with zero noisy-neighbor risk.',
      badge: 'Zero-Trust Compute',
      colSpan: 'lg:col-span-5',
      stat: '100% Isolated',
      statLabel: 'Sub-70ms Cold Starts',
      diagram: (
        <div className="w-full h-36 flex items-center justify-center">
          <div className="border border-emerald-300/80 rounded-xl p-3 bg-white/95 shadow-xs w-full max-w-xs text-left font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between border-b border-slate-100 pb-1 text-emerald-800 font-bold">
              <span>SANDBOX #vm_92</span>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px]">ISOLATED</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Memory Limit:</span>
              <span className="font-semibold text-slate-700">512MB / 1024MB</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Network:</span>
              <span className="font-semibold text-slate-700">Egress Filtered</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold text-[10px] pt-0.5">
              <span>Hardware Isolation:</span>
              <span className="text-emerald-700">Active (0.04% CPU)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stream',
      icon: Zap,
      title: 'Real-Time Streaming Bus',
      desc: 'Powered by embedded NATS & Redis pub/sub. Broadcast real-time agent thoughts, token chunks, and status updates over WebSocket.',
      badge: 'Low-Latency Bus',
      colSpan: 'lg:col-span-5',
      stat: '0.8ms Jitter',
      statLabel: '140k msgs/sec throughput',
      diagram: (
        <div className="w-full h-36 flex items-center justify-center">
          <div className="flex items-center gap-2 max-w-xs w-full justify-center">
            <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 shadow-xs">
              Agent
            </div>
            <div className="flex-1 h-0.5 bg-emerald-500 relative min-w-[36px]">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-[11px] font-mono text-white font-bold shadow-xs">
              NATS Bus
            </div>
            <div className="flex-1 h-0.5 bg-emerald-500 relative min-w-[36px]" />
            <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 shadow-xs">
              Client
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'swarm',
      icon: GitFork,
      title: 'Multi-Agent Swarm Mesh',
      desc: 'Deploy cooperative multi-agent networks. Agents delegate sub-tasks, share context memory, and reach verified consensus autonomously.',
      badge: 'Agent Mesh',
      colSpan: 'lg:col-span-7',
      stat: 'Dynamic Swarms',
      statLabel: 'Hierarchical Task Hand-off',
      diagram: (
        <div className="w-full h-36 flex items-center justify-center px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-md text-center font-mono text-[10px]">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/90 shadow-xs flex flex-col justify-center">
              <span className="text-slate-400 text-[9px]">Agent 01</span>
              <span className="font-bold text-slate-800">Research</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/90 shadow-xs flex flex-col justify-center">
              <span className="text-slate-400 text-[9px]">Agent 02</span>
              <span className="font-bold text-slate-800">CodeGen</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/90 shadow-xs flex flex-col justify-center">
              <span className="text-slate-400 text-[9px]">Agent 03</span>
              <span className="font-bold text-slate-800">Validator</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs flex flex-col justify-center">
              <span className="text-emerald-200 text-[9px]">Master</span>
              <span className="font-bold">Director</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'vault',
      icon: Shield,
      title: 'Enterprise RBAC & KMS Vault',
      desc: 'Hardware security module (HSM) encryption for OpenAI, Anthropic, and Gemini API keys with granular audit trails.',
      badge: 'SOC2 & HIPAA',
      colSpan: 'lg:col-span-4',
      stat: 'AES-256-GCM',
      statLabel: 'Hardware KMS Encryption',
      diagram: (
        <div className="w-full h-36 flex items-center justify-center">
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/90 flex items-center gap-3 shadow-xs max-w-xs w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left font-mono">
              <div className="text-[12px] font-bold text-slate-900">ENCRYPTED_VAULT</div>
              <div className="text-[10px] text-slate-500">AES-256-GCM Hardware Lock</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'telemetry',
      icon: Activity,
      title: 'End-to-End OpenTelemetry Spans',
      desc: 'Native OpenTelemetry distributed trace collector. Trace every prompt, tool call, token cost, and HTTP request down to microsecond precision.',
      badge: 'Observability',
      colSpan: 'lg:col-span-8',
      stat: '100% Fidelity',
      statLabel: 'Live Distributed Spans & Metrics',
      diagram: (
        <div className="w-full h-36 flex items-center justify-center px-2 sm:px-6">
          <div className="w-full max-w-lg bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[10px] space-y-1.5 shadow-sm">
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
              <span>DISTRIBUTED TRACE SPAN</span>
              <span>LATENCY</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">root.agent.swarm_exec</span>
              <span className="text-emerald-400 font-bold">182 ms</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 pl-3">
              <span>└─ tool.knowledge_graph_traversal</span>
              <span className="text-slate-400">14 ms</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 pl-3">
              <span>└─ llm.reasoning_generate (gemini-flash)</span>
              <span className="text-emerald-300">160 ms</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-28 bg-[#fafdfb] border-t border-slate-200/80 overflow-hidden"
    >
      {/* Background subtle radial ambient light */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), radial-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Expanded Container Width: Uses left & right space to maximize visual breadth */}
      <div className="relative max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[12px] font-bold text-emerald-800 tracking-wider uppercase font-manrope">
              ENGINEERING CAPABILITIES
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-instrument text-slate-900 leading-[1.14] mt-2 mb-4">
            Everything Required To Run Agents in Production
          </h2>

          <p className="text-slate-600 font-inter text-[15px] sm:text-[17px] leading-relaxed max-w-2xl mx-auto">
            Engineered from the ground up for deterministic speed, isolated hardware sandboxes, and enterprise compliance.
          </p>
        </div>

        {/* Master Bento Container: Forms a single, flush outer rectangle when the user scrolls into view */}
        <div
          className={`relative p-3 sm:p-4 rounded-[32px] bg-gradient-to-b from-emerald-100/50 via-slate-100/30 to-emerald-100/30 border border-emerald-200/80 shadow-[0_24px_60px_rgba(16,185,129,0.06),0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-80 translate-y-6 scale-[0.99]'
          }`}
        >
          {/* 3D Bento Shape Docking Slot: Canvas smoothly docks and morphs into a 3D Rectangle over the boxes */}
          <div
            id="bento-sphere-slot"
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-20"
          />
          {/* 12-Column Asymmetric Bento Grid:
              Row 1: 7 + 5 = 12
              Row 2: 5 + 7 = 12
              Row 3: 4 + 8 = 12
              Result: Completely flush master outer rectangle with randomized, dynamic card proportions! */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
            {cards.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  style={{
                    transitionDelay: `${idx * 60}ms`,
                  }}
                  className={`group relative p-6 sm:p-7 rounded-2xl bg-white hover:bg-[#f6fcf8] border border-slate-200/90 hover:border-emerald-300/90 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.08)] hover:-translate-y-0.5 ${
                    c.colSpan
                  } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  {/* Top Bar: Icon, Badge, Arrow Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-emerald-700" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                          {c.badge}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold font-manrope text-slate-900 mb-2 leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-[13px] sm:text-[14px] font-inter text-slate-600 leading-relaxed mb-5">
                      {c.desc}
                    </p>
                  </div>

                  {/* Bottom Diagram Showcase */}
                  <div className="mt-auto pt-3 border-t border-slate-100/80">
                    {c.diagram}

                    {/* Stat Footnote */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/60 font-mono text-[11px]">
                      <span className="font-bold text-slate-900">{c.stat}</span>
                      <span className="text-slate-500">{c.statLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

