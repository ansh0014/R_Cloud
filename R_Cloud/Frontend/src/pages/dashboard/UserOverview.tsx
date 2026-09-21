import { useState, useEffect } from 'react';
import { listProjects, type Project, listDeployments, type Deployment } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { 
  Terminal, 
  Layers, 
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function UserOverview() {
  const { isConnected, events } = useWebSocket();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deploymentsMap, setDeploymentsMap] = useState<Record<string, Deployment[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const projs = await listProjects();
        if (isMounted) setProjects(projs);

        const dMap: Record<string, Deployment[]> = {};
        for (const p of projs) {
          const deps = await listDeployments(p.id);
          dMap[p.id] = deps;
        }
        if (isMounted) setDeploymentsMap(dMap);
      } catch (err) {
        console.error('Failed to load user overview data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = projects.length;
  const allDeployments = Object.values(deploymentsMap).flat();
  const totalDeployments = allDeployments.length;
  const activeRuntimes = allDeployments.filter(d => d.status === 'RUNNING' || d.status === 'COMPLETED').length;
  const failedDeployments = allDeployments.filter(d => d.status === 'FAILED').length;

  const successRate = totalDeployments > 0
    ? (((totalDeployments - failedDeployments) / totalDeployments) * 100).toFixed(1)
    : '100.0';

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Runtime Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your active projects, deployment lifecycles, and cluster events in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects, icon: Layers, color: 'text-primary' },
          { label: 'Active Runtimes', value: `${activeRuntimes}/${totalDeployments}`, icon: Cpu, color: 'text-emerald-400' },
          { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'WebSocket Stream', value: isConnected ? 'Connected' : 'Connecting...', icon: RefreshCw, color: isConnected ? 'text-emerald-400' : 'text-amber-400' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1.5 font-manrope">{stat.value}</p>
              </div>
              <div className={`p-2.5 bg-[#131126] border border-[#2b2344]/30 rounded-lg ${stat.color}`}>
                <Icon className="size-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-manrope">Your Projects</h2>
            <span className="text-xs text-slate-400">{projects.length} Projects registered</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl">
                <Loader2 className="size-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading projects from API Gateway...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl">
                <AlertCircle className="size-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No projects deployed yet</p>
                <p className="text-xs text-slate-500 mt-1">Go to "Deploy Agent" to create your first deployment.</p>
              </div>
            ) : (
              projects.map((proj) => {
                const proDeeps = deploymentsMap[proj.id] || [];
                const latestDeep = proDeeps[0];
                return (
                  <div
                    key={proj.id}
                    className="p-4 bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-[#110e1f]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-2.5 rounded-full ${
                        latestDeep?.status === 'RUNNING' || latestDeep?.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : latestDeep?.status === 'FAILED'
                          ? 'bg-rose-500'
                          : 'bg-amber-500 animate-pulse'
                      }`} />
                      <div>
                        <h3 className="text-sm font-semibold text-white">{proj.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{proj.githubRepoUrl || proj.description || 'No repo attached'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Branch</span>
                        <span className="text-slate-200 mt-1 block font-mono font-medium">{proj.defaultBranch || 'main'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Deployments</span>
                        <span className="text-slate-200 mt-1 block font-medium">{proDeeps.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Live WebSocket Log Events */}
        <div className="space-y-6">
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="size-4 text-primary" />
                  Live Platform Events
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Streamed directly from API Gateway</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="bg-[#05030a] border border-[#2b2344]/30 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin">
              {events.length === 0 ? (
                <div className="text-slate-500 py-4 text-center">
                  Listening for deployment & runtime events on WebSocket...
                </div>
              ) : (
                events.map((ev, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-primary font-bold">[{ev.type}]</span>{' '}
                    <span className="text-slate-400">{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ''}</span>
                    <pre className="text-[9px] text-slate-400 mt-0.5 whitespace-pre-wrap">
                      {JSON.stringify(ev.payload)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
