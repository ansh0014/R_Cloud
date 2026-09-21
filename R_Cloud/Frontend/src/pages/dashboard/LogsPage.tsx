import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { listProjects, type Project } from '../../lib/api';
import { Terminal, RefreshCw, Loader2, FolderGit2 } from 'lucide-react';

export default function LogsPage() {
  const { isConnected, events } = useWebSocket();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
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

  const selectedProj = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Runtime Logs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stdout/stderr log output from container instances.
          </p>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Terminal View */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              Container stdout / stderr Stream
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selectedProj ? `Project: ${selectedProj.name}` : 'Select a project'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isConnected ? 'STREAMING' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="bg-[#05030a] border border-[#2b2344]/30 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500 gap-2">
              <Loader2 className="size-4 animate-spin text-primary" /> Loading project logs context...
            </div>
          ) : projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <FolderGit2 className="size-8 text-slate-600 mb-1" />
              <span>No projects available. Deploy an agent to stream stdout logs.</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-slate-500 py-8 text-center space-y-2">
              <RefreshCw className="size-5 text-slate-600 animate-spin mx-auto" />
              <p>Connected to API Gateway WebSocket. Waiting for container log events...</p>
            </div>
          ) : (
            events.map((ev, idx) => (
              <div key={idx} className="text-slate-300">
                <span className="text-slate-500">[{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'LOG'}]</span>{' '}
                <span className="text-primary font-bold">[{ev.type}]</span>{' '}
                <span className="text-slate-200">{JSON.stringify(ev.payload)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
