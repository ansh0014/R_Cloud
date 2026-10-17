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
          { label: 'Total Projects', value: totalProjects, icon: Layers, color: 'text-[#BFF2F0]', bg: 'bg-[#BFF2F0]/10 border-[#BFF2F0]/30' },
          { label: 'Active Runtimes', value: `${activeRuntimes}/${totalDeployments}`, icon: Cpu, color: 'text-[#CFF1D2]', bg: 'bg-[#CFF1D2]/10 border-[#CFF1D2]/30' },
          { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-[#92FF5F]', bg: 'bg-[#92FF5F]/10 border-[#92FF5F]/30' },
          { label: 'WebSocket Stream', value: isConnected ? 'Connected' : 'Connecting...', icon: RefreshCw, color: isConnected ? 'text-[#CFF1D2]' : 'text-[#FF7036]', bg: isConnected ? 'bg-[#CFF1D2]/10 border-[#CFF1D2]/30' : 'bg-[#FF7036]/10 border-[#FF7036]/30' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#0F3B27]/80 border border-[#CFF1D2]/20 rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs text-[#CFF1D2]/70 font-mono font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-[#F7F9F7] mt-1.5 font-manrope">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color}`}>
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
            <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Your Projects</h2>
            <span className="text-xs font-mono text-[#CFF1D2]/70">{projects.length} Projects registered</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center bg-[#0F3B27]/80 border border-[#CFF1D2]/20 rounded-xl">
                <Loader2 className="size-6 text-[#92FF5F] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#CFF1D2]/70">Loading projects from API Gateway...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-[#0F3B27]/80 border border-[#CFF1D2]/20 rounded-xl">
                <AlertCircle className="size-8 text-[#FF7036] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#F7F9F7]">No projects deployed yet</p>
                <p className="text-xs text-[#CFF1D2]/70 mt-1">Go to "Deploy Agent" to create your first deployment.</p>
              </div>
            ) : (
              projects.map((proj) => {
                const proDeeps = deploymentsMap[proj.id] || [];
                const latestDeep = proDeeps[0];
                return (
                  <div
                    key={proj.id}
                    className="p-4 bg-[#0F3B27]/75 border border-[#CFF1D2]/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-[#0F3B27] hover:border-[#92FF5F]/40 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-2.5 rounded-full ${
                        latestDeep?.status === 'RUNNING' || latestDeep?.status === 'COMPLETED'
                          ? 'bg-[#92FF5F] shadow-[0_0_8px_#92FF5F]'
                          : latestDeep?.status === 'FAILED'
                          ? 'bg-[#FF7036] shadow-[0_0_8px_#FF7036]'
                          : 'bg-[#BFF2F0] animate-pulse'
                      }`} />
                      <div>
                        <h3 className="text-sm font-semibold text-[#F7F9F7] font-manrope">{proj.name}</h3>
                        <p className="text-xs text-[#CFF1D2]/70 mt-0.5">{proj.githubRepoUrl || proj.description || 'No repo attached'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-[#CFF1D2]/60 block uppercase font-mono font-bold tracking-wider">Branch</span>
                        <span className="text-[#BFF2F0] mt-1 block font-mono font-semibold">{proj.defaultBranch || 'main'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#CFF1D2]/60 block uppercase font-mono font-bold tracking-wider">Deployments</span>
                        <span className="text-[#F7F9F7] mt-1 block font-mono font-bold">{proDeeps.length}</span>
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
          <div className="bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#CFF1D2]/15 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#F7F9F7] flex items-center gap-2 font-manrope">
                  <Terminal className="size-4 text-[#92FF5F]" />
                  Live Platform Events
                </h2>
                <p className="text-[10px] text-[#CFF1D2]/70 mt-0.5 font-mono">Streamed directly from API Gateway</p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                isConnected ? 'bg-[#92FF5F]/20 text-[#92FF5F] border border-[#92FF5F]/40' : 'bg-[#FF7036]/20 text-[#FF7036] border border-[#FF7036]/40'
              }`}>
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="bg-[#05180F] border border-[#CFF1D2]/15 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin">
              {events.length === 0 ? (
                <div className="text-[#CFF1D2]/50 py-4 text-center font-mono">
                  Listening for deployment & runtime events on WebSocket...
                </div>
              ) : (
                events.map((ev, i) => (
                  <div key={i} className="text-[#F7F9F7]">
                    <span className="text-[#92FF5F] font-bold">[{ev.type}]</span>{' '}
                    <span className="text-[#CFF1D2]/60">{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ''}</span>
                    <pre className="text-[9px] text-[#BFF2F0] mt-0.5 whitespace-pre-wrap font-mono">
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
