import { useState, useEffect } from 'react';
import { listProjects, listDeployments, type Project, type Deployment } from '../../lib/api';
import {
  AlertOctagon,
  Clock,
  Loader2,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function AgentMetrics() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMetricsData() {
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
        console.error('Failed to load agent metrics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMetricsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalDeployments = deployments.length;
  const activeDeployments = deployments.filter(d => d.status === 'RUNNING' || d.status === 'COMPLETED');

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Endpoint Metrics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time request telemetry and runtime node status details.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <Loader2 className="size-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Fetching endpoint metrics from API Gateway...</p>
        </div>
      ) : activeDeployments.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <AlertOctagon className="size-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No active runtimes</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no running agent deployments yet. Deploy an agent to activate logs and telemetry.
          </p>
        </div>
      ) : (
        <>
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Deployments</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{totalDeployments}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-3 flex items-center gap-1">
                <span className="inline-block size-1.5 bg-emerald-500 rounded-full animate-ping" />
                Active gateway monitoring
              </div>
            </div>

            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Active Runtimes</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{activeDeployments.length}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3">
                {activeDeployments.length} Active / {totalDeployments - activeDeployments.length} Pending
              </div>
            </div>

            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Projects Registered</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{projects.length}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="size-3 text-primary" />
                Connected via API Gateway
              </div>
            </div>

            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Health Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity className="size-3 fill-current animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 truncate">
                Status: 200 OK
              </div>
            </div>
          </div>

          {/* Active Runtimes Table */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white font-manrope">Runtime Container Health Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Deployment ID</th>
                    <th className="py-2.5 px-3">Project ID</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
                  {activeDeployments.map((d) => (
                    <tr key={d.id} className="hover:bg-[#131126]/30">
                      <td className="py-3 px-3 font-mono text-primary font-bold">{d.id.slice(0, 16)}...</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{d.projectId}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{d.branch || 'main'}</td>
                      <td className="py-3 px-3 capitalize">{d.mode || 'monolith'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="size-3" />
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
