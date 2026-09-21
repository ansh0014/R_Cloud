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
        <Shield className="size-6 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">System Admin Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Global cluster health, platform projects overview, and infrastructure status logs.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Projects', value: projects.length, icon: Users, color: 'text-primary' },
          { label: 'Total Deployments', value: totalDeployments, icon: Layers, color: 'text-purple-400' },
          { label: 'Active Containers', value: activeContainers, icon: Cpu, color: 'text-emerald-400' },
          { label: 'WebSocket Stream', value: isConnected ? 'Connected' : 'Connecting...', icon: Activity, color: isConnected ? 'text-emerald-400' : 'text-amber-400' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1.5 font-manrope">{stat.value}</p>
              </div>
              <div className="p-2.5 bg-[#131126] border border-[#2b2344]/30 rounded-lg">
                <Icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Table */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white font-manrope">Platform Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Repo URL</th>
                <th className="py-2.5 px-3">Default Branch</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Fetching platform projects from API Gateway...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No platform projects registered yet.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#131126]/30">
                    <td className="py-3 px-3 font-semibold text-white">{p.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.id}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 truncate max-w-[200px]">{p.githubRepoUrl || '—'}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{p.defaultBranch || 'main'}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Live Platform Diagnostics
        </h2>

        <div className="bg-[#05030a] border border-[#2b2344]/30 rounded-lg p-3 h-40 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin text-slate-400">
          <div>[INFO] Gateway connection: {isConnected ? 'WebSocket stream active' : 'Connecting to API Gateway'}</div>
          {events.slice(0, 5).map((ev, i) => (
            <div key={i} className="text-slate-300">
              <span className="text-primary font-bold">[{ev.type}]</span> {JSON.stringify(ev.payload)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
