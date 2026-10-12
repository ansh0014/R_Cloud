import { Check } from 'lucide-react';

export default function ComparisonTable() {
  const rows = [
    {
      feature: 'Knowledge Graph Synthesis',
      rcloud: 'Automated & real-time',
      tradCloud: 'Manual pipeline setup',
      langchain: 'DIY coding required',
      vectordb: 'Flat vector search only',
    },
    {
      feature: 'Cold Start Speed',
      rcloud: '< 75 ms (MicroVM)',
      tradCloud: '15-45 sec (Docker)',
      langchain: 'Variable / Unmanaged',
      vectordb: 'N/A',
    },
    {
      feature: 'Native Distributed Tracing',
      rcloud: 'Built-in OpenTelemetry',
      tradCloud: 'Requires 3rd party tooling',
      langchain: 'Complex custom wrappers',
      vectordb: 'None',
    },
    {
      feature: 'Deterministic Guardrails',
      rcloud: 'Hardware & policy level',
      tradCloud: 'None',
      langchain: 'Fragile prompt regex',
      vectordb: 'None',
    },
    {
      feature: 'Multi-Agent State Sharing',
      rcloud: 'High-speed NATS + Redis bus',
      tradCloud: 'DIY architecture',
      langchain: 'In-memory only',
      vectordb: 'Flat vectors only',
    },
    {
      feature: 'One-Click GitHub CI/CD',
      rcloud: 'Included out-of-the-box',
      tradCloud: 'Complex YAML pipelines',
      langchain: 'No hosting provided',
      vectordb: 'No compute',
    },
  ];

  return (
    <section className="relative w-full py-24 bg-[#fbfdfc] border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            COMPETITIVE BENCHMARK
          </span>
          <h2 className="text-3xl sm:text-5xl font-instrument text-slate-900 mt-4 mb-4">
            Why Engineering Teams Switch to R_Cloud
          </h2>
          <p className="text-slate-600 font-inter text-[16px] sm:text-[18px]">
            Compare how R_Cloud stacks up against legacy cloud providers and DIY orchestration libraries.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-manrope font-bold text-slate-600 uppercase">
                <th className="py-4 px-6 w-1/3">Feature / Capability</th>
                <th className="py-4 px-6 bg-emerald-50 text-emerald-900 border-x border-emerald-200">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    R_Cloud
                  </div>
                </th>
                <th className="py-4 px-6">Traditional Cloud</th>
                <th className="py-4 px-6">DIY Frameworks</th>
                <th className="py-4 px-6">Raw Vector DBs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-inter">
              {rows.map((r) => (
                <tr key={r.feature} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800 font-manrope">{r.feature}</td>
                  <td className="py-4 px-6 bg-emerald-50/60 font-semibold text-emerald-900 border-x border-emerald-100 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    {r.rcloud}
                  </td>
                  <td className="py-4 px-6 text-slate-500">{r.tradCloud}</td>
                  <td className="py-4 px-6 text-slate-500">{r.langchain}</td>
                  <td className="py-4 px-6 text-slate-400">{r.vectordb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
