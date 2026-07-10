import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMockDataStream } from '../../hooks/useMockDataStream';
import {
  Terminal,
  Search,
  Download,
  Play,
  Pause,
  ArrowDown,
  Info,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

export default function LogsPage() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const { agents } = useMockDataStream();

  // Filter agents based on active project context
  const filteredAgents = agents.filter(
    (a) => selectedProject === 'All Projects' || a.project === selectedProject
  );

  const [activeAgentId, setActiveAgentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const selectedAgent = agents.find((a) => a.id === activeAgentId) || filteredAgents[0] || agents[0];

  // Set default active agent once agents load
  useEffect(() => {
    if (filteredAgents.length > 0 && !activeAgentId) {
      setActiveAgentId(filteredAgents[0].id);
    }
  }, [filteredAgents, activeAgentId]);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAgent?.logs.length, autoScroll]);

  // Buffer to capture logs while paused
  const [frozenLogs, setFrozenLogs] = useState<string[]>([]);
  useEffect(() => {
    if (!isPaused && selectedAgent) {
      setFrozenLogs(selectedAgent.logs);
    }
  }, [selectedAgent?.logs, isPaused]);

  // Filter logs based on search term
  const displayedLogs = frozenLogs.filter((line) =>
    line.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parse color classes for log levels
  const getLogLineStyle = (line: string) => {
    if (line.includes('[ERROR]')) return 'text-rose-400 font-semibold';
    if (line.includes('[WARN]')) return 'text-amber-400';
    if (line.includes('[SYSTEM]')) return 'text-[#7b39fc] font-medium';
    return 'text-slate-300';
  };

  const getLogLevelIcon = (line: string) => {
    if (line.includes('[ERROR]')) return <AlertCircle className="size-3.5 text-rose-400 inline mr-1.5 shrink-0" />;
    if (line.includes('[WARN]')) return <AlertTriangle className="size-3.5 text-amber-400 inline mr-1.5 shrink-0" />;
    if (line.includes('[SYSTEM]')) return <Terminal className="size-3.5 text-[#7b39fc] inline mr-1.5 shrink-0" />;
    return <Info className="size-3.5 text-slate-500 inline mr-1.5 shrink-0" />;
  };

  // Convert buffer to download link
  const downloadLogs = () => {
    const text = displayedLogs.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedAgent.name}_logs.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Runtime Logs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Live-streamed build logs and stdout transcripts pulled directly from your container node.
          </p>
        </div>

        {/* Agent Selector Dropdown */}
        {filteredAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Target Container:</span>
            <select
              value={activeAgentId}
              onChange={(e) => {
                setActiveAgentId(e.target.value);
                setIsPaused(false); // Reset pause state on agent switch
              }}
              className="bg-[#0d0b17] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {filteredAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredAgents.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl flex-1 flex flex-col items-center justify-center">
          <Terminal className="size-10 text-slate-500 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No agent logs</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            There are no agents in this project context to pull logs from. Start or deploy an agent container first.
          </p>
        </div>
      ) : (
        <div className="bg-[#05030a] border border-[#2b2344]/40 rounded-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
          {/* Console Top Toolbar */}
          <div className="bg-[#0b0914] border-b border-[#2b2344]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {/* Active Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  {!isPaused && selectedAgent.status === 'Running' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isPaused ? 'bg-amber-500' : selectedAgent.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}></span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {isPaused ? 'Logs Paused' : 'Streaming stdout'}
                </span>
              </div>

              <span className="h-4 w-px bg-[#2b2344]/40" />

              {/* Pause/Resume logs */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#131126] border border-[#2b2344] text-[10px] text-slate-300 hover:text-white rounded-md transition-colors"
              >
                {isPaused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Log text */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter stdout..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#131126] border border-[#2b2344]/60 text-[11px] text-slate-200 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-primary"
                />
              </div>

              <span className="h-4 w-px bg-[#2b2344]/40 hidden sm:inline" />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`p-1.5 border rounded-md transition-colors ${
                    autoScroll 
                      ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
                      : 'bg-[#131126] border-[#2b2344] text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Auto-Scroll to Bottom"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  onClick={downloadLogs}
                  className="p-1.5 bg-[#131126] border border-[#2b2344] text-slate-400 hover:text-white rounded-md hover:border-primary transition-all"
                  title="Download Log Transcript"
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Log Lines console view */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-1.5 scrollbar-thin select-text">
            {displayedLogs.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-start hover:bg-slate-900/40 p-0.5 rounded transition-colors ${getLogLineStyle(line)}`}
              >
                {getLogLevelIcon(line)}
                <span className="break-all">{line}</span>
              </div>
            ))}

            {displayedLogs.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-sans text-xs">
                No logs match your filter criteria.
              </div>
            )}

            {/* End mark */}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
