export default function LogoCloud() {
  const logos = [
    { name: 'Linear', tag: 'Issue Tracking' },
    { name: 'Raycast', tag: 'Productivity' },
    { name: 'Supabase', tag: 'Database' },
    { name: 'Vercel', tag: 'Frontend Cloud' },
    { name: 'Retool', tag: 'Internal Tools' },
    { name: 'GitHub', tag: 'Source Control' },
    { name: 'Docker', tag: 'Containers' },
    { name: 'Postman', tag: 'API Platform' },
  ];

  return (
    <section className="relative w-full py-16 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-8">
          Trusted by high-velocity engineering and autonomous AI teams
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm font-manrope group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                {logo.name[0]}
              </div>
              <div className="text-left">
                <span className="font-manrope font-bold text-sm text-slate-700 group-hover:text-slate-900 block leading-tight">
                  {logo.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">{logo.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
