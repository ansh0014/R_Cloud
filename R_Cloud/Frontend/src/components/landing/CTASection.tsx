import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative w-full py-20 px-6 bg-[#f7fcf9] border-t border-slate-100">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 p-10 sm:p-16 text-center shadow-sm relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-300/30 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-mono font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            START IN 2 MINUTES
          </div>

          <h2 className="text-4xl sm:text-5xl font-instrument text-slate-900 leading-tight mb-4">
            Try R_Cloud Now.
          </h2>

          <p className="font-inter text-slate-600 text-base sm:text-lg mb-8">
            Deploy your first autonomous agent runtime with full semantic graph integration in under 120 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-manrope font-bold text-sm hover:bg-slate-800 transition-all shadow-md group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-manrope font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Live Demo Sandbox
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
