import { useState, useEffect } from 'react';
import { listProjects, listDeployments, type Project, type Deployment } from '../../lib/api';
import {
  Coins,
  BrainCircuit,
  Loader2
} from 'lucide-react';

export default function TokenUsagePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTokenData() {
      setIsLoading(true);
      try {
        const projs = await listProjects();
        if (isMounted) setProjects(projs);

        const allDeps: Deployment[] = [];
        for (const p of projs) {
          const deps = await listDeployments(p.id);
          allDeps.push(...deps);
        }
        if (isMounted) setDeployments(allDeps);
      } catch (err) {
        console.error('Failed to load token usage:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTokenData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">AI Token Usage & Limits</h1>
        <p className="text-sm text-[#CFF1D2]/75 mt-1 font-sans">
          Track LLM input/output tokens, streaming latency, and microVM allocation budgets.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-2xl">
          <Loader2 className="size-8 text-[#92FF5F] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#CFF1D2]/70 font-mono">Loading token consumption metrics...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-2xl">
          <Coins className="size-10 text-[#FF7036] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#F7F9F7] font-manrope">No agent deployments</h3>
          <p className="text-xs text-[#CFF1D2]/70 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no active agent projects to monitor. Deploy your first agent project to start tracking token consumption.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Token Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Estimated Input Tokens</span>
                <span className="text-2xl font-bold text-[#BFF2F0] mt-1.5 block font-mono">148.2k</span>
              </div>
              <div className="text-[10px] text-[#CFF1D2] font-mono mt-3">Context window streaming</div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Generated Output</span>
                <span className="text-2xl font-bold text-[#92FF5F] mt-1.5 block font-mono">42.8k</span>
              </div>
              <div className="text-[10px] text-[#92FF5F] font-mono mt-3">Streaming inference active</div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">MicroVM Quota Used</span>
                <span className="text-2xl font-bold text-[#CFF1D2] mt-1.5 block font-mono">19.4%</span>
              </div>
              <div className="text-[10px] text-[#BFF2F0] font-mono mt-3">Safe operating range</div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Hard Budget Cap</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded mt-2 bg-[#FF7036]/15 text-[#FF7036] border border-[#FF7036]/30">
                  $25.00 Limit
                </span>
              </div>
              <div className="text-[10px] text-[#FF7036]/80 font-mono mt-3 truncate">
                Alert triggered at 85%
              </div>
            </div>
          </div>

          <div className="p-12 text-center bg-[#0F3B27]/85 border border-dashed border-[#CFF1D2]/30 rounded-2xl space-y-4 max-w-2xl mx-auto shadow-2xl">
            <BrainCircuit className="size-12 text-[#92FF5F] mx-auto opacity-90 drop-shadow-[0_0_15px_rgba(146,255,95,0.4)]" />
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#F7F9F7] font-manrope">Live Token Telemetry Streaming</h3>
              <p className="text-xs text-[#CFF1D2]/75 max-w-md mx-auto leading-relaxed">
                Token consumption metrics and per-session microVM compute overhead are aggregated live via the R Agent API Gateway proxy.
              </p>
            </div>
            <div className="text-xs text-[#CFF1D2]/75 pt-2 flex items-center justify-center gap-2">
              <span className="px-3 py-1.5 bg-[#071F14] border border-[#CFF1D2]/20 rounded-md font-mono text-xs">
                Active Projects: <code className="text-[#92FF5F] font-mono font-bold">{projects.length}</code> | Total Deployments: <code className="text-[#BFF2F0] font-mono font-bold">{deployments.length}</code>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
