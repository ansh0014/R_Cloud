import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is R_Cloud and how does the knowledge graph work?',
      a: 'R_Cloud is a full-stack context cloud and autonomous agent deployment runtime. It ingests unstructured text, Git repos, API schemas, and databases, dynamically generating a live relational knowledge graph with semantic vector embeddings for ultra-fast, zero-hallucination agent retrieval.',
    },
    {
      q: 'How does the scroll-driven architecture work?',
      a: 'Our architecture separates agent lifecycle into discrete stages: Ingestion, Multi-Agent Reasoning, Isolated Runtime Deployment, and Real-time Telemetry. As you explore the platform, each stage functions independently with strict deterministic contracts and shared event buses.',
    },
    {
      q: 'What are the cold start times for deployed AI agents?',
      a: 'Our MicroVM sandboxes boot in under 75 milliseconds. We pre-warm language model tool definitions and preserve state snapshots across worker nodes, enabling instant scale-from-zero without latency spikes.',
    },
    {
      q: 'Can I connect private databases and custom VPCs?',
      a: 'Yes. R_Cloud supports wireguard-encrypted private VPC peering, enterprise single-sign-on (SSO), air-gapped deployments, and dedicated KMS hardware key vaults for multi-cloud enterprise setups.',
    },
    {
      q: 'How does pricing work?',
      a: 'We offer a free developer tier with 10,000 free agent execution minutes. Production tiers scale based on active runtime hours and token throughput with no hidden networking or egress fees.',
    },
  ];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="relative w-full py-24 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-instrument text-slate-900 mt-4 mb-3">
            Everything You Need To Know
          </h2>
          <p className="text-slate-600 font-inter text-base">
            Answers to common questions about deployment, architecture, and pricing.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={f.q} className="py-6 cursor-pointer" onClick={() => toggle(i)}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-manrope font-semibold text-slate-900 hover:text-emerald-700 transition-colors">
                    {f.q}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {isOpen ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>

                {isOpen && (
                  <p className="mt-4 font-inter text-slate-600 text-[15px] leading-relaxed animate-fadeIn pr-8">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
