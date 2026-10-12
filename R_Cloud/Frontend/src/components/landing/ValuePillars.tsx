import { Gauge, ShieldCheck, RefreshCw, TerminalSquare } from 'lucide-react';

export default function ValuePillars() {
  const pillars = [
    {
      icon: Gauge,
      title: 'Sub-Millisecond Engine',
      desc: 'Optimized C++ & Rust core runtime with zero-copy vector graph traversal and instant response times.',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Air-Gapped Security',
      desc: 'Hardware enclave encryption, fine-grained access tokens, and zero data storage without explicit consent.',
    },
    {
      icon: RefreshCw,
      title: 'Self-Healing Resiliency',
      desc: 'Autonomous watchdog monitors unhealthy agent runs, restarts sandboxes, and reroutes traffic automatically.',
    },
    {
      icon: TerminalSquare,
      title: 'CLI & API First',
      desc: 'Deploy with git push or ragent deploy CLI. Manage your fleet programmatically via gRPC and REST APIs.',
    },
  ];

  return (
    <section className="relative w-full py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex flex-col items-start p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-5 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-manrope text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm font-inter text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
