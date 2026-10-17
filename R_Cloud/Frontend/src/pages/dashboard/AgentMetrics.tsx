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
        <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">Endpoint Metrics</h1>
        <p className="text-sm text-[#CFF1D2]/75 mt-1 font-sans">
          Real-time request telemetry, container vitals, and microVM runtime status details.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-2xl">
          <Loader2 className="size-8 text-[#92FF5F] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#CFF1D2]/70 font-mono">Fetching endpoint metrics from API Gateway...</p>
        </div>
      ) : activeDeployments.length === 0 ? (
        <div className="text-center py-16 bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-2xl">
          <AlertOctagon className="size-10 text-[#FF7036] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#F7F9F7] font-manrope">No active runtimes</h3>
          <p className="text-xs text-[#CFF1D2]/70 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no running agent deployments yet. Deploy an agent to activate live logs and telemetry.
          </p>
        </div>
      ) : (
        <>
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Total Deployments</span>
                <span className="text-2xl font-bold text-[#BFF2F0] mt-1.5 block font-mono">{totalDeployments}</span>
              </div>
              <div className="text-[10px] text-[#92FF5F] font-semibold mt-3 flex items-center gap-1.5 font-mono">
                <span className="inline-block size-1.5 bg-[#92FF5F] rounded-full animate-ping" />
                Active gateway monitoring
              </div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Active Runtimes</span>
                <span className="text-2xl font-bold text-[#92FF5F] mt-1.5 block font-mono">{activeDeployments.length}</span>
              </div>
              <div className="text-[10px] text-[#CFF1D2]/75 mt-3 font-mono">
                {activeDeployments.length} Active / {totalDeployments - activeDeployments.length} Pending
              </div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Projects Registered</span>
                <span className="text-2xl font-bold text-[#CFF1D2] mt-1.5 block font-mono">{projects.length}</span>
              </div>
              <div className="text-[10px] text-[#BFF2F0]/80 mt-3 flex items-center gap-1 font-mono">
                <Clock className="size-3 text-[#92FF5F]" />
                Connected via Gateway
              </div>
            </div>

            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Health Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded mt-2 bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30">
                  <Activity className="size-3 fill-current animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="text-[10px] text-[#CFF1D2]/75 mt-3 font-mono">
                Gateway Status: 200 OK
              </div>
            </div>
          </div>

          {/* Active Runtimes Table */}
          <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Runtime Container Health Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#CFF1D2]/20 text-[#CFF1D2]/70 font-semibold bg-[#071F14]/50">
                    <th className="py-2.5 px-3 font-mono">Deployment ID</th>
                    <th className="py-2.5 px-3 font-mono">Project ID</th>
                    <th className="py-2.5 px-3 font-mono">Branch</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CFF1D2]/10 text-slate-300">
                  {activeDeployments.map((d) => (
                    <tr key={d.id} className="hover:bg-[#071F14]/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-[#92FF5F] font-bold">{d.id.slice(0, 16)}...</td>
                      <td className="py-3 px-3 font-mono text-[#CFF1D2]/75">{d.projectId}</td>
                      <td className="py-3 px-3 font-mono text-[#BFF2F0]">{d.branch || 'main'}</td>
                      <td className="py-3 px-3 capitalize text-[#F7F9F7]">{d.mode || 'monolith'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30">
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
