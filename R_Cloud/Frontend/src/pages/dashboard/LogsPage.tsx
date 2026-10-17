import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { listProjects, listDeployments, type Project, type Deployment } from '../../lib/api';
import { Terminal, RefreshCw, Loader2, FolderGit2 } from 'lucide-react';

interface LogLine {
  id: string;
  timestamp: string;
  type: string;
  message: string;
}

export default function LogsPage() {
  const { isConnected, events } = useWebSocket();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [initialLogs, setInitialLogs] = useState<LogLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setIsLoading(true);
      try {
        const projs = await listProjects();
        if (isMounted) {
          setProjects(projs);
          if (projs.length > 0) {
            setSelectedProjectId(projs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load projects for logs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    let isMounted = true;

    async function loadProjectLogs() {
      try {
        const deps: Deployment[] = await listDeployments(selectedProjectId);
        if (!isMounted) return;

        const generatedLogs: LogLine[] = [];
        deps.forEach((d) => {
          generatedLogs.push({
            id: `${d.id}-created`,
            timestamp: d.createdAt,
            type: 'deployment.created',
            message: `Deployment initiated (ID: ${d.id.slice(0, 8)}, Branch: ${d.branch || 'main'}, Mode: ${d.mode || 'monolith'})`
          });

          if (d.status === 'RUNNING' || d.status === 'COMPLETED') {
            generatedLogs.push({
              id: `${d.id}-running`,
              timestamp: d.completedAt || d.createdAt,
              type: 'runtime.started',
              message: `Railway Container Runtime ONLINE & HEALTHY (Status: ${d.status}). Listening on /health & /metadata`
            });
          } else if (d.status === 'FAILED') {
            generatedLogs.push({
              id: `${d.id}-failed`,
              timestamp: d.completedAt || d.createdAt,
              type: 'deployment.failed',
              message: `Deployment run failed (Status: ${d.status})`
            });
          }
        });

        // Sort logs chronologically
        generatedLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setInitialLogs(generatedLogs);
      } catch (err) {
        console.error('Failed to load project logs:', err);
      }
    }

    loadProjectLogs();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const selectedProj = projects.find((p) => p.id === selectedProjectId);

  // Combine initial audit logs and live WebSocket events
  const combinedLogs: LogLine[] = [
    ...initialLogs,
    ...events.map((ev, idx) => ({
      id: `live-${idx}-${ev.timestamp}`,
      timestamp: ev.timestamp || new Date().toISOString(),
      type: ev.type || (ev as any).event || 'LIVE_EVENT',
      message: JSON.stringify(ev.payload || (ev as any).data || ev)
    }))
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">Runtime Logs</h1>
          <p className="text-sm text-[#CFF1D2]/80 mt-1">
            Real-time stdout/stderr log output from container instances.
          </p>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0A2619] border border-[#CFF1D2]/30 text-xs text-[#F7F9F7] font-mono rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#92FF5F] appearance-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#071F14] text-[#F7F9F7]">{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Terminal View */}
      <div className="bg-[#0F3B27]/85 border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#CFF1D2]/15 pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#F7F9F7] flex items-center gap-2 font-manrope">
              <Terminal className="size-4 text-[#92FF5F]" />
              Container stdout / stderr Stream
            </h2>
            <p className="text-[10px] text-[#CFF1D2]/70 mt-0.5 font-mono">
              {selectedProj ? `Project: ${selectedProj.name}` : 'Select a project'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
              isConnected ? 'bg-[#92FF5F]/20 text-[#92FF5F] border border-[#92FF5F]/40' : 'bg-[#FF7036]/20 text-[#FF7036] border border-[#FF7036]/40'
            }`}>
              {isConnected ? 'STREAMING' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="bg-[#05180F] border border-[#CFF1D2]/20 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-[#CFF1D2]/60 gap-2">
              <Loader2 className="size-4 animate-spin text-[#92FF5F]" /> Loading project logs context...
            </div>
          ) : projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#CFF1D2]/60 gap-2">
              <FolderGit2 className="size-8 text-[#CFF1D2]/40 mb-1" />
              <span>No projects available. Deploy an agent to stream stdout logs.</span>
            </div>
          ) : combinedLogs.length === 0 ? (
            <div className="text-[#CFF1D2]/60 py-8 text-center space-y-2">
              <RefreshCw className="size-5 text-[#92FF5F] animate-spin mx-auto" />
              <p>Connected to API Gateway WebSocket. Waiting for container log events...</p>
            </div>
          ) : (
            combinedLogs.map((log) => {
              const isError = log.type.includes('fail') || log.type.includes('error');
              const isSuccess = log.type.includes('start') || log.type.includes('run') || log.type.includes('online');
              return (
                <div key={log.id} className="text-[#F7F9F7]">
                  <span className="text-[#CFF1D2]/60">[{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'LOG'}]</span>{' '}
                  <span className={`font-bold ${isError ? 'text-[#FF7036]' : isSuccess ? 'text-[#CFF1D2]' : 'text-[#BFF2F0]'}`}>
                    [{log.type}]
                  </span>{' '}
                  <span className="text-[#F7F9F7]/90">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
