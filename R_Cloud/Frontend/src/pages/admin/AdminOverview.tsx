import { useState, useEffect } from 'react';
import { listProjects, listDeployments, type Project, type Deployment } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  Users,
  Layers,
  Activity,
  Cpu,
  Shield,
  Loader2
} from 'lucide-react';

export default function AdminOverview() {
  const { isConnected, events } = useWebSocket();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
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
        console.error('Failed to load admin overview data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalDeployments = deployments.length;
  const activeContainers = deployments.filter(d => d.status === 'RUNNING' || d.status === 'COMPLETED').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-6 text-[#FF7036]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">System Admin Overview</h1>
          <p className="text-sm text-[#CFF1D2]/75 mt-1 font-sans">
            Global cluster health, platform projects overview, and infrastructure status logs.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Projects', value: projects.length, icon: Users, color: 'text-[#92FF5F]' },
          { label: 'Total Deployments', value: totalDeployments, icon: Layers, color: 'text-[#BFF2F0]' },
          { label: 'Active Containers', value: activeContainers, icon: Cpu, color: 'text-[#CFF1D2]' },
          { label: 'WebSocket Stream', value: isConnected ? 'Connected' : 'Connecting...', icon: Activity, color: isConnected ? 'text-[#92FF5F]' : 'text-[#FF7036]' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs text-[#CFF1D2]/70 font-mono uppercase font-semibold">{stat.label}</p>
                <p className="text-xl font-bold text-[#F7F9F7] mt-1.5 font-mono">{stat.value}</p>
              </div>
              <div className="p-2.5 bg-[#071F14] border border-[#CFF1D2]/20 rounded-lg">
                <Icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Table */}
      <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Platform Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#CFF1D2]/20 text-[#CFF1D2]/70 font-semibold bg-[#071F14]/50 font-mono">
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3 font-mono">Project ID</th>
                <th className="py-2.5 px-3 font-mono">Repo URL</th>
                <th className="py-2.5 px-3 font-mono">Default Branch</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CFF1D2]/10 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#CFF1D2]/70 font-mono">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-[#92FF5F]" />
                    Fetching platform projects from API Gateway...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#CFF1D2]/60 font-mono">
                    No platform projects registered yet.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#071F14]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#F7F9F7]">{p.name}</td>
                    <td className="py-3 px-3 font-mono text-[#92FF5F]">{p.id.slice(0, 16)}...</td>
                    <td className="py-3 px-3 font-mono text-[#BFF2F0] truncate max-w-[200px]">{p.githubRepoUrl || '—'}</td>
                    <td className="py-3 px-3 font-mono text-[#CFF1D2]/75">{p.defaultBranch || 'main'}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics Event Log */}
      <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-[#F7F9F7] flex items-center gap-2 font-manrope">
          <Activity className="size-4 text-[#92FF5F]" />
          Live Platform Diagnostics
        </h2>

        <div className="bg-[#071F14] border border-[#CFF1D2]/20 rounded-lg p-3 h-40 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin text-[#CFF1D2]/80">
          <div>[INFO] Gateway connection: {isConnected ? 'WebSocket stream active' : 'Connecting to API Gateway'}</div>
          {events.slice(0, 5).map((ev, i) => (
            <div key={i} className="text-slate-300">
              <span className="text-[#92FF5F] font-bold">[{ev.type}]</span> {JSON.stringify(ev.payload)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
