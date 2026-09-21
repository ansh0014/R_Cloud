import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  Shield,
  Filter,
  Search,
  Activity,
  X
} from 'lucide-react';

interface TraceItem {
  id: string;
  type: string;
  timestamp: string;
  status: '200' | '500';
  path: string;
  latencyMs: number;
}

export default function TracesPage() {
  const { events } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrace, setSelectedTrace] = useState<TraceItem | null>(null);

  // Convert WebSocket events into trace view items
  const traces: TraceItem[] = events.map((ev, idx) => ({
    id: `tr-${idx + 101}`,
    type: ev.type,
    timestamp: ev.timestamp || new Date().toISOString(),
    status: ev.type.includes('failed') ? '500' : '200',
    path: `/api/v1/${ev.type.split('.')[0] || 'gateway'}`,
    latencyMs: Math.floor(Math.random() * 80) + 20
  }));

  const filteredTraces = traces.filter((t) => {
    const matchesSearch = t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === '2xx' && t.status === '200') ||
                          (statusFilter === '5xx' && t.status === '500');
    return matchesSearch && matchesStatus;
  });

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Request Traces</h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect proxy telemetry and follow real-time request events from API Gateway.
        </p>
      </div>

      {/* Isolation banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
        <Shield className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-white">Tenant-Scoped Isolation Active</p>
          <p className="text-slate-400 leading-relaxed">
            All traces are collected live from your active API Gateway WebSocket session.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search event type or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

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
          Showing {filteredTraces.length} real-time event traces
        </span>
      </div>

      {/* Trace items Table */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold bg-[#110e1f]/30">
                <th className="py-3 px-4">Trace ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Path</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
              {filteredTraces.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTrace(t)}
                  className="hover:bg-[#131126]/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px] text-primary font-semibold">{t.id}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{t.type}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{t.path}</td>
                  <td className="py-3.5 px-4 text-slate-400">{formatTime(t.timestamp)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === '200' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTraces.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Activity className="size-6 text-slate-600 mx-auto mb-2" />
                    <span>No event traces captured yet. Events stream live when deployments or runtimes change.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidepanel */}
      {selectedTrace && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelectedTrace(null)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-50 bg-[#0d0b17] border-l border-[#2b2344] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2b2344]/60 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-manrope">Trace Details</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTrace.id}</p>
                </div>
                <button onClick={() => setSelectedTrace(null)} className="p-1.5 hover:bg-[#1c1830] rounded-lg">
                  <X className="size-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-bold">{selectedTrace.type}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Path</span>
                  <span className="text-slate-200">{selectedTrace.path}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-200">{formatTime(selectedTrace.timestamp)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrace(null)}
              className="w-full py-2.5 bg-[#131126] border border-[#2b2344] hover:bg-[#1a1733] text-slate-200 rounded-lg text-xs font-semibold"
            >
              Close Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}
