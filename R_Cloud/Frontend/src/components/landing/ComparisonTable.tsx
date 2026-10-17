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
    <section id="solutions" className="relative w-full py-24 bg-[#071F14] border-t border-[#0F3B27]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Small Signal Lime box with mono bold text */}
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0F3B27] bg-[#92FF5F] px-3 py-1 rounded-md shadow-xs">
            COMPETITIVE BENCHMARK
          </span>
          <h2 className="text-3xl sm:text-5xl font-instrument text-[#F7F9F7] mt-4 mb-4">
            Why Engineering Teams Switch to R_Cloud
          </h2>
          <p className="text-[#CFF1D2]/80 font-inter text-[16px] sm:text-[18px]">
            Compare how R_Cloud stacks up against legacy cloud providers and DIY orchestration libraries.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-[#CFF1D2]/20 bg-[#0F3B27]/85 shadow-2xl backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#CFF1D2]/20 bg-[#0A2619] text-xs font-manrope font-bold text-[#CFF1D2]/80 uppercase">
                <th className="py-4 px-6 w-1/3">Feature / Capability</th>
                <th className="py-4 px-6 bg-[#0F3B27] text-[#92FF5F] border-x border-[#92FF5F]/30">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#92FF5F]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#92FF5F] shadow-[0_0_8px_#92FF5F]" />
                    R_Cloud
                  </div>
                </th>
                <th className="py-4 px-6 text-[#F7F9F7]/70">Traditional Cloud</th>
                <th className="py-4 px-6 text-[#F7F9F7]/70">DIY Frameworks</th>
                <th className="py-4 px-6 text-[#F7F9F7]/60">Raw Vector DBs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CFF1D2]/10 text-sm font-inter">
              {rows.map((r) => (
                <tr key={r.feature} className="hover:bg-[#0A2619]/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#F7F9F7] font-manrope">{r.feature}</td>
                  <td className="py-4 px-6 bg-[#0F3B27] font-semibold text-[#92FF5F] border-x border-[#92FF5F]/20 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#92FF5F] shrink-0" />
                    {r.rcloud}
                  </td>
                  <td className="py-4 px-6 text-[#F7F9F7]/60">{r.tradCloud}</td>
                  <td className="py-4 px-6 text-[#F7F9F7]/60">{r.langchain}</td>
                  <td className="py-4 px-6 text-[#F7F9F7]/40">{r.vectordb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
