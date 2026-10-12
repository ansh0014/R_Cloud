export default function TestimonialCards() {
  const testimonials = [
    {
      gradient: 'from-emerald-50 via-teal-50 to-white',
      border: 'border-emerald-200',
      tag: 'CASE STUDY • FINTECH',
      quote:
        '“R_Cloud cut our autonomous trade compliance pipeline latency from 4.2 seconds to 340 milliseconds while giving us 100% auditability across every agent reasoning step.”',
      author: 'Marcus Vance',
      role: 'Head of AI Engineering, Apex Capital',
    },
    {
      gradient: 'from-amber-50/60 via-emerald-50/40 to-white',
      border: 'border-amber-200/80',
      tag: 'CASE STUDY • ENTERPRISE SAAS',
      quote:
        '“The scroll-driven architecture and real-time knowledge graphs transformed our internal agent swarm. One-click deploy from GitHub made our staging-to-prod cycle instantaneous.”',
      author: 'Elena Rostova',
      role: 'VP of Platform, DataMesh',
    },
    {
      gradient: 'from-cyan-50/60 via-emerald-50/40 to-white',
      border: 'border-cyan-200/80',
      tag: 'CASE STUDY • HEALTHCARE AI',
      quote:
        '“Isolated sandboxes and strict hardware KMS vault policies made HIPAA compliance effortless. We scaled to 10M daily agent runs without managing single server.”',
      author: 'Dr. Tariq Al-Mansoor',
      role: 'Chief Medical AI Officer, BioSyn',
    },
  ];

  return (
    <section className="relative w-full py-24 bg-[#fafcfa] border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            PROVEN IMPACT
          </span>
          <h2 className="text-3xl sm:text-5xl font-instrument text-slate-900 mt-4 mb-3">
            Trusted in Mission-Critical Production
          </h2>
          <p className="text-slate-600 font-inter text-[16px] sm:text-[18px]">
            Hear how platform teams run their autonomous agent fleets on R_Cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className={`p-8 rounded-3xl bg-gradient-to-br ${t.gradient} border ${t.border} shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300`}
            >
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 block mb-4">
                  {t.tag}
                </span>
                <p className="font-instrument text-lg sm:text-xl text-slate-800 italic leading-relaxed mb-8">
                  {t.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <p className="font-manrope font-bold text-slate-900 text-sm">{t.author}</p>
                <p className="font-inter text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
