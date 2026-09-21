import { Sliders, ShieldCheck } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function SystemControls() {
  const { isConnected } = useWebSocket();

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sliders className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope font-manrope">System Controls</h1>
          <p className="text-sm text-slate-400 mt-1">
            Production system orchestration, Gateway event monitoring, and status status.
          </p>
        </div>
      </div>

      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2b2344]/40 pb-4">
          <ShieldCheck className="size-6 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white font-manrope">Production Gateway Connected</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status: {isConnected ? 'WebSocket Active' : 'Connecting to API Gateway'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Platform orchestration is managed automatically by the microservices (API Gateway, Deployment Planner, Runtime Service, and AI Agent).
        </p>
      </div>
    </div>
  );
}
