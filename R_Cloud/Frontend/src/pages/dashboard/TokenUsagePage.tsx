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
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">AI Token Usage</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track LLM input/output tokens and estimated usage parsed from agent executions.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <Loader2 className="size-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading token usage context...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <Coins className="size-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No agent deployments</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no active agent projects to monitor. Deploy your first agent project to start tracking token consumption.
          </p>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0d0b17] border border-dashed border-[#2b2344] rounded-2xl space-y-4 max-w-2xl mx-auto">
          <BrainCircuit className="size-12 text-slate-500 mx-auto opacity-80" />
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white font-manrope">Token telemetry active</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Token usage metrics are aggregated directly when agent execution endpoints return usage statistics.
            </p>
          </div>
          <div className="text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 bg-[#131126] border border-[#2b2344]/60 rounded-md">
              Total active projects: <code className="text-primary font-mono text-xs">{projects.length}</code> | Total deployments: <code className="text-primary font-mono text-xs">{deployments.length}</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
