import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMockDataStream } from '../../hooks/useMockDataStream';
import type { Trace } from '../../hooks/useMockDataStream';
import {
  Shield,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

export default function TracesPage() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const { traces, agents } = useMockDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  // Filter traces based on project filter + search term + status code filter
  const filteredTraces = traces.filter((t) => {
    // Cross-reference trace's agent to match project context
    const agent = agents.find((a) => a.id === t.agentId);
    if (!agent) return false;

    const matchesProject = selectedProject === 'All Projects' || agent.project === selectedProject;
    const matchesSearch = t.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === '2xx' && t.status === 200) ||
                          (statusFilter === '5xx' && t.status === 500);

    return matchesProject && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: number) => {
    return status === 200 
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Request Traces</h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect proxy latency metrics and follow requests flow from external gateway down to the runtime containers.
        </p>
      </div>

      {/* Info Warning banner indicating Tenant Isolation */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
        <Shield className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-white">Tenant-Scoped Isolation Active</p>
          <p className="text-slate-400 leading-relaxed">
            For security, internal platform mechanics (such as internal gRPC calls, platform PostgreSQL queries, and Railway hypervisor stack traces) are filtered out of your view. You only see gateway proxy forwarding and container execution spans.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search trace or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status select */}
          <div className="relative w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="2xx">Success (200)</option>
              <option value="5xx">Errors (500)</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredTraces.length} dynamic request traces
        </span>
      </div>

      {/* Trace items Table */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold bg-[#110e1f]/30">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Method & Path</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Total Latency</th>
                <th className="py-3 px-4">Proxy Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
              {filteredTraces.map((t) => {
                const totalLat = t.gatewayLatency + t.proxyLatency + t.containerLatency;
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrace(t)}
                    className="hover:bg-[#131126]/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-primary font-semibold">{t.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{t.agentName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-400">
                        <span className="text-primary font-bold mr-1">{t.method}</span>
                        {t.path}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatTime(t.timestamp)}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{totalLat}ms</td>
                    <td className="py-3.5 px-4 text-slate-400">{t.proxyLatency}ms</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(t.status)}`}>
                        {t.status === 200 ? <CheckCircle className="size-3" /> : <AlertTriangle className="size-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="size-4 text-slate-500 inline" />
                    </td>
                  </tr>
                );
              })}

              {filteredTraces.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No traces match your filtering criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latency Waterfall details Sidepanel */}
      {selectedTrace && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelectedTrace(null)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 bg-[#0d0b17] border-l border-[#2b2344] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2b2344]/60 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-manrope">Trace Waterfall</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTrace.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTrace(null)}
                  className="p-1.5 hover:bg-[#1c1830] rounded-lg transition-colors"
                >
                  <X className="size-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              {/* Endpoint summary */}
              <div className="p-3 bg-[#131126] border border-[#2b2344]/55 rounded-xl flex items-center justify-between">
                <div className="font-mono text-xs text-white">
                  <span className="text-primary font-bold mr-1">{selectedTrace.method}</span>
                  {selectedTrace.path}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(selectedTrace.status)}`}>
                  {selectedTrace.status}
                </span>
              </div>

              {/* Waterfall latency bars visualization */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latency Segments Breakdown</h3>
                
                {(() => {
                  const gate = selectedTrace.gatewayLatency;
                  const proxy = selectedTrace.proxyLatency;
                  const cont = selectedTrace.containerLatency;
                  const total = gate + proxy + cont;
                  
                  // percentages
                  const gatePct = Math.max(8, Math.round((gate / total) * 100));
                  const proxyPct = Math.max(8, Math.round((proxy / total) * 100));
                  const contPct = Math.max(8, Math.round((cont / total) * 100));

                  return (
                    <div className="space-y-4 text-xs">
                      {/* Segment 1: Gateway */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">1. API Gateway Edge</span>
                          <span className="text-white font-mono">{gate}ms</span>
                        </div>
                        <div className="w-full bg-[#1c1a30] h-3 rounded-full overflow-hidden flex">
                          <div className="bg-[#a484d7] h-full" style={{ width: `${gatePct}%` }} />
                        </div>
                      </div>

                      {/* Segment 2: Proxy */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">2. Platform Proxy Route</span>
                          <span className="text-white font-mono">{proxy}ms</span>
                        </div>
                        <div className="w-full bg-[#1c1a30] h-3 rounded-full overflow-hidden flex">
                          <div className="bg-[#7b39fc] h-full" style={{ width: `${proxyPct}%` }} />
                        </div>
                      </div>

                      {/* Segment 3: Container runtime */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">3. Railway Container Execution</span>
                          <span className="text-white font-mono font-semibold">{cont}ms</span>
                        </div>
                        <div className="w-full bg-[#1c1a30] h-3 rounded-full overflow-hidden flex">
                          <div className={`h-full ${
                            selectedTrace.status === 200 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} style={{ width: `${contPct}%` }} />
                        </div>
                      </div>

                      {/* Total */}
                      <div className="pt-2 border-t border-[#2b2344]/30 flex justify-between text-sm font-semibold text-white">
                        <span>Total Request Latency</span>
                        <span className="text-primary font-mono">{total}ms</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Isolation note */}
              <div className="bg-[#131126] border border-[#2b2344]/30 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Security Isolation Logs</span>
                <p className="text-slate-400 leading-normal text-[11px]">
                  Internal calls to cluster load-balancers, metadata nodes, and platform internal networks are omitted. No private data is logged.
                </p>
              </div>

              {/* Mock Error details */}
              {selectedTrace.status !== 200 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider block">Runtime Error Log</span>
                  <p className="text-rose-300 font-mono text-[10px] leading-relaxed">
                    [ERROR] Connection reset during backend invocation of LLM context validator. Exception: timeout exception (exceeded 800ms threshold).
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTrace(null)}
              className="w-full py-2.5 bg-[#131126] border border-[#2b2344] hover:bg-[#1a1733] text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all mt-4"
            >
              Close Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}
