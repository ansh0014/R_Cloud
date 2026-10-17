import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass, Terminal, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#05180F] text-[#F7F9F7] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* Background Subtle Tech Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(rgba(146, 255, 95, 0.25) 1px, transparent 1px), radial-gradient(rgba(207, 241, 210, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#92FF5F]/20 border border-[#92FF5F]/40 text-[#92FF5F] font-mono font-bold text-xs tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(146,255,95,0.2)]">
          <ShieldAlert className="w-4 h-4 text-[#92FF5F]" />
          <span>Error 404 • Autonomous Node Disconnected</span>
        </div>

        {/* Big Glitched 404 Header */}
        <h1 className="text-7xl sm:text-9xl font-extrabold font-instrument text-[#F7F9F7] tracking-tight mb-2 select-none">
          4<span className="text-[#92FF5F] italic">0</span>4
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-[#F7F9F7] mb-4">
          Route Not Found in Knowledge Graph
        </h2>

        <p className="text-[#CFF1D2]/80 font-inter text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          The requested agent microVM endpoint or URI does not exist or has been migrated to an isolated cluster.
        </p>

        {/* Terminal Debug Snippet */}
        <div className="w-full max-w-lg mx-auto bg-[#071F14] border border-[#0F3B27] rounded-xl p-4 text-left font-mono text-xs text-[#CFF1D2]/90 mb-8 shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#0F3B27] text-[#92FF5F]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#92FF5F]" />
              <span>rcloud-hypervisor://trace</span>
            </div>
            <span className="text-[10px] text-red-400">STATUS_ERR</span>
          </div>
          <p className="text-red-400">&gt; GET {typeof window !== 'undefined' ? window.location.pathname : '/unknown-route'}</p>
          <p className="text-[#CFF1D2]/60">&gt; resolving Bounded Context graph traversal...</p>
          <p className="text-red-300">&gt; [FATAL] 0x404_ORCHESTRATOR_ROUTE_UNRESOLVED: 0 nodes matched</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#92FF5F] text-[#0F3B27] font-manrope font-bold text-sm shadow-[0_4px_20px_rgba(146,255,95,0.35)] hover:bg-[#92FF5F]/90 transition-all cursor-pointer no-underline group"
          >
            <Home className="w-4 h-4 text-[#0F3B27]" />
            <span>Return to Control Plane</span>
            <ArrowLeft className="w-4 h-4 text-[#0F3B27] rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F3B27] border border-[#CFF1D2]/30 text-[#F7F9F7] font-manrope font-semibold text-sm hover:border-[#92FF5F]/50 transition-all cursor-pointer no-underline"
          >
            <Compass className="w-4 h-4 text-[#92FF5F]" />
            <span>Open Dashboard</span>
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
