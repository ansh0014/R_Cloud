import { Sliders, ShieldCheck } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function SystemControls() {
  const { isConnected } = useWebSocket();

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sliders className="size-6 text-[#92FF5F]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">System Controls</h1>
          <p className="text-sm text-[#CFF1D2]/75 mt-1 font-sans">
            Production system orchestration, Gateway event monitoring, and microVM health status.
          </p>
        </div>
      </div>

      <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#CFF1D2]/20 pb-4">
          <ShieldCheck className="size-6 text-[#92FF5F]" />
          <div>
            <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Production Gateway Connected</h2>
            <p className="text-xs text-[#CFF1D2]/80 mt-0.5 font-mono">
              Live status: {isConnected ? 'WebSocket Active (100% Uptime)' : 'Connecting to API Gateway...'}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#CFF1D2]/80 leading-relaxed font-sans">
          Platform orchestration is managed automatically across microservices (API Gateway, Deployment Planner, Runtime Service, and AI Agent Validation Pipeline).
        </p>
      </div>
    </div>
  );
}
