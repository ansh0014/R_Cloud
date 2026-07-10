import React from 'react';
import { useMockDataStream } from '../../hooks/useMockDataStream';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  Layers,
  Activity,
  Cpu,
  Shield,
  Server,
  AlertTriangle
} from 'lucide-react';

interface MockTenant {
  id: string;
  name: string;
  email: string;
  agentsCount: number;
  requestsCount: number;
  tokensCount: number;
  status: 'active' | 'inactive';
}

const mockTenants: MockTenant[] = [
  { id: 't-1', name: 'Agent Developer', email: 'user@rcloud.com', agentsCount: 5, requestsCount: 11060, tokensCount: 581700, status: 'active' },
  { id: 't-2', name: 'Alpha Analytics', email: 'alpha@analytics.io', agentsCount: 3, requestsCount: 890, tokensCount: 120400, status: 'active' },
  { id: 't-3', name: 'Quantum Services', email: 'quantum@co.uk', agentsCount: 1, requestsCount: 140, tokensCount: 0, status: 'active' },
  { id: 't-4', name: 'Beta Systems', email: 'beta@systems.com', agentsCount: 0, requestsCount: 0, tokensCount: 0, status: 'inactive' }
];

export default function AdminOverview() {
  const { systemStats, agents, adminControls } = useMockDataStream();

  // Dynamically calculate statistics from active user actions
  const totalRequests = systemStats.totalRequests;
  const activeAgents = agents.filter(a => a.status === 'Running').length;
  const crashedAgents = agents.filter(a => a.status === 'Failed').length;

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Dynamic system history charts
  const historyData = React.useMemo(() => {
    const baseCpu = systemStats.cpuUsage;
    const baseMem = systemStats.memoryUsage;
    return Array.from({ length: 10 }).map((_, idx) => {
      const jitter = Math.sin(idx * 0.8) * 4;
      return {
        time: `${idx * 5}s`,
        CPU: Math.max(5, Math.min(99, Math.round(baseCpu + jitter))),
        Memory: Math.max(5, Math.min(99, Math.round(baseMem + jitter * 0.4)))
      };
    });
  }, [systemStats.cpuUsage, systemStats.memoryUsage]);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-6 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">System Admin Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Global clusters utilization, resource load analysis, and platform tenants orchestration logs.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {(crashedAgents > 0 || adminControls.isFailureActive) && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
          <AlertTriangle className="size-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-white">Platform System Outages Detected</p>
            <p className="text-slate-400 leading-relaxed">
              There are currently {crashedAgents} agent container nodes in a `Failed` state or reporting CrashLoopBackOff exceptions. Review tenant log streams immediately.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Global Requests', value: formatNumber(totalRequests), icon: Activity, color: 'text-primary' },
          { label: 'Active Tenant Orgs', value: mockTenants.filter(t => t.status === 'active').length, icon: Users, color: 'text-purple-400' },
          { label: 'Aggregate Run Containers', value: `${activeAgents}/${agents.length}`, icon: Layers, color: 'text-emerald-400' },
          { label: 'Node Cluster CPU Load', value: `${systemStats.cpuUsage}%`, icon: Cpu, color: systemStats.cpuUsage > 80 ? 'text-rose-400' : 'text-amber-400' }
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Load Graphs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white font-manrope">Hypervisor Resource Utilization</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live CPU cores and memory bandwidth allocations across nodes cluster</p>
            </div>

            <div className="h-64 bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="CPU" stroke="#ec4899" fill="rgba(236, 72, 153, 0.05)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Memory" stroke="#7b39fc" fill="rgba(123, 57, 252, 0.05)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tenant lists */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white font-manrope font-manrope">Active Platform Tenants</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Tenant Name</th>
                    <th className="py-2.5 px-3">Primary Email</th>
                    <th className="py-2.5 px-3 text-center">Active Containers</th>
                    <th className="py-2.5 px-3 text-center">Requests volume</th>
                    <th className="py-2.5 px-3 text-center">AI Tokens</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
                  {mockTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-[#131126]/30">
                      <td className="py-3 px-3 font-semibold text-white">{t.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{t.email}</td>
                      <td className="py-3 px-3 text-center font-bold text-primary">
                        {t.id === 't-1' ? agents.length : t.agentsCount}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {t.id === 't-1' ? formatNumber(totalRequests) : formatNumber(t.requestsCount)}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-400">
                        {t.id === 't-1' 
                          ? formatNumber(agents.reduce((sum, a) => sum + a.totalTokens, 0)) 
                          : formatNumber(t.tokensCount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Platforms Node lists & System checks */}
        <div className="space-y-6">
          {/* Node hardware health */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="size-4 text-primary" />
              Railway Host Clusters
            </h2>

            <div className="space-y-3.5 text-xs">
              {[
                { name: 'railway-node-us-east-1', cpu: '48%', mem: '68%', status: 'Online' },
                { name: 'railway-node-us-east-2', cpu: `${systemStats.cpuUsage}%`, mem: `${systemStats.memoryUsage}%`, status: 'Online' },
                { name: 'railway-node-eu-west-1', cpu: '18%', mem: '41%', status: 'Online' },
                { name: 'railway-node-ap-south-1', cpu: '0%', mem: '0%', status: 'Offline' }
              ].map((node, i) => (
                <div key={i} className="p-3 bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{node.name}</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      node.status === 'Online' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  {node.status === 'Online' && (
                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 mt-1">
                      <div>CPU allocation: <span className="text-white font-semibold">{node.cpu}</span></div>
                      <div>RAM allocation: <span className="text-white font-semibold">{node.mem}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Platform Diagnostics logs */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="size-4 text-rose-500" />
              Platform Diagnostics
            </h2>

            <div className="bg-[#05030a] border border-[#2b2344]/30 rounded-lg p-3 h-40 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin text-slate-400">
              <div>[INFO] Check-in cluster health: cluster-supervisor responder connected.</div>
              {crashedAgents > 0 && (
                <div className="text-rose-400 font-semibold">[CRITICAL] Supervisor: Container crashLoopBackOff alert on pod DevOps-Code-Reviewer.</div>
              )}
              {adminControls.isSpikeActive && (
                <div className="text-amber-400 font-semibold">[WARN] Load-Balancer: High traffic volume spike alert. Allocating dynamic hypervisor pools.</div>
              )}
              <div>[INFO] Database connector: pool latency 2ms. Connection count: 14.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
