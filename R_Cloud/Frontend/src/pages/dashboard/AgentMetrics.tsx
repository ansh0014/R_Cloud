import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMockDataStream } from '../../hooks/useMockDataStream';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Heart,
  AlertOctagon,
  Clock
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

export default function AgentMetrics() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const { agents } = useMockDataStream();

  // Filter agents that are Running
  const runningAgents = agents.filter(
    (a) => (selectedProject === 'All Projects' || a.project === selectedProject) && a.status === 'Running'
  );

  const [activeAgentId, setActiveAgentId] = useState<string>('');

  const selectedAgent = agents.find((a) => a.id === activeAgentId) || runningAgents[0] || agents[0];

  // Set default active agent once running agents load
  React.useEffect(() => {
    if (runningAgents.length > 0 && !activeAgentId) {
      setActiveAgentId(runningAgents[0].id);
    }
  }, [runningAgents, activeAgentId]);

  const successPercentage = selectedAgent.requestCount > 0
    ? ((selectedAgent.successCount / selectedAgent.requestCount) * 100).toFixed(1)
    : '100.0';

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '—';
    }
  };

  // Generate dynamic 10-point chart history shifting with live parameters
  const chartData = React.useMemo(() => {
    const baseAvg = selectedAgent.avgLatency;
    const baseP95 = selectedAgent.p95Latency;
    const count = selectedAgent.requestCount;
    const successRatio = count > 0 ? selectedAgent.successCount / count : 0.99;

    return Array.from({ length: 12 }).map((_, idx) => {
      // Create wave pattern
      const wave = Math.sin(idx * 0.5) * 15;
      const avg = selectedAgent.status === 'Running' ? Math.max(10, Math.round(baseAvg + wave)) : 0;
      const p95 = selectedAgent.status === 'Running' ? Math.max(avg, Math.round(baseP95 + wave * 1.5)) : 0;
      
      const totalReq = Math.max(1, Math.round(count / 15 + Math.cos(idx) * 4));
      const succ = Math.max(0, Math.round(totalReq * successRatio));
      const fail = Math.max(0, totalReq - succ);

      const d = new Date(Date.now() - (12 - idx) * 10000);
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

      return {
        time: timeStr.slice(-8),
        avg,
        p95,
        success: succ,
        failure: fail
      };
    });
  }, [selectedAgent.id, selectedAgent.avgLatency, selectedAgent.p95Latency, selectedAgent.requestCount]);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header & Agent Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope font-manrope">Endpoint Metrics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time and historical request telemetry, latencies distribution, and node status details.
          </p>
        </div>

        {/* Running Agent Tabs Selector */}
        {runningAgents.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0d0b17] border border-[#2b2344]/40 p-1 rounded-xl max-w-full overflow-x-auto">
            {runningAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveAgentId(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedAgent.id === a.id
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {runningAgents.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <AlertOctagon className="size-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No active runtimes</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no running agents in this project context to display metrics. Redeploy an agent to activate logs and telemetry.
          </p>
        </div>
      ) : (
        <>
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Request Count Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Requests</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{selectedAgent.requestCount}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-3 flex items-center gap-1">
                <span className="inline-block size-1.5 bg-emerald-500 rounded-full animate-ping" />
                Active endpoints monitoring
              </div>
            </div>

            {/* Success Rate Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Success Rate</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{successPercentage}%</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3">
                {selectedAgent.successCount} Success / {selectedAgent.failureCount} Failed
              </div>
            </div>

            {/* Average Latency Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Latency (Avg / P95)</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">
                  {selectedAgent.avgLatency}ms <span className="text-xs text-slate-500 font-normal">/ {selectedAgent.p95Latency}ms</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="size-3 text-primary" />
                Updated 2 seconds ago
              </div>
            </div>

            {/* Health Probes Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Health Status</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 ${
                  selectedAgent.healthStatus === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <Heart className={`size-3 fill-current ${selectedAgent.healthStatus === 'healthy' ? 'animate-pulse' : ''}`} />
                  {selectedAgent.healthStatus === 'healthy' ? 'Healthy' : 'Degraded'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 truncate">
                Last probe: {formatTimestamp(selectedAgent.lastHealthCheck)}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart: Request Volume */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white font-manrope">Endpoint Load</h2>
                <p className="text-xs text-slate-400 mt-0.5">Stacked request volumes breakdown (Success vs Failure)</p>
              </div>

              <div className="h-64 bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="success" name="Success" stroke="#10b981" fill="rgba(16, 185, 129, 0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="failure" name="Failure" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Response Latencies */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white font-manrope">Latency Distribution</h2>
                <p className="text-xs text-slate-400 mt-0.5">Comparing average response times vs p95 percentile threshold (ms)</p>
              </div>

              <div className="h-64 bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="avg" name="Avg Latency" stroke="#7b39fc" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="p95" name="p95 Latency" stroke="#a484d7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Core Info list */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white font-manrope">Runtime Container Health Audit</h2>
            <div className="grid md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Railway Pod Info</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">Pod Status</span><span className="text-white font-medium">Running</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Image Ref</span><span className="text-slate-400 truncate max-w-[140px]" title="ghcr.io/r-agent/support-bot:latest">support-bot:latest</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Container Port</span><span className="text-white font-mono">8000</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Failure & Restart Logs</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">Auto-Restarts</span><span className="text-amber-400 font-semibold">{selectedAgent.restarts} times</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Last Restart Reason</span><span className="text-slate-400">{selectedAgent.restarts > 0 ? 'Out Of Memory (exited 137)' : 'None'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Restart Loop Guard</span><span className="text-emerald-400 font-medium">Active</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Health Probes Logs</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">Liveness Probe</span><span className="text-emerald-400 font-medium">Passing</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Readiness Probe</span><span className="text-emerald-400 font-medium">Passing</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">HTTP Probe Status</span><span className="text-white font-mono">200 OK (0.04s)</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
