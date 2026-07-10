import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMockDataStream, mockDataStore } from '../../hooks/useMockDataStream';
import type { DeploymentState } from '../../hooks/useMockDataStream';
import { 
  Play, 
  Square, 
  Terminal, 
  Layers, 
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

export default function UserOverview() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const { agents } = useMockDataStream();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-1');

  // Filter agents based on project selector in layout
  const filteredAgents = agents.filter(
    (a) => selectedProject === 'All Projects' || a.project === selectedProject
  );

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || filteredAgents[0] || agents[0];

  // Helper stats
  const totalAgents = filteredAgents.length;
  const runningAgents = filteredAgents.filter((a) => a.status === 'Running').length;
  const totalRequests = filteredAgents.reduce((sum, a) => sum + a.requestCount, 0);
  const totalRestarts = filteredAgents.reduce((sum, a) => sum + a.restarts, 0);

  const successRate = totalRequests > 0
    ? ((filteredAgents.reduce((sum, a) => sum + a.successCount, 0) / totalRequests) * 100).toFixed(1)
    : '100.0';

  const formatUptime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Deployment Stepper States
  const stepperStates: DeploymentState[] = [
    'Created',
    'Validating',
    'Deploying',
    'Running'
  ];

  const getStepStatus = (step: DeploymentState, currentStatus: DeploymentState) => {
    const statusOrder: DeploymentState[] = ['Created', 'Validating', 'Deploying', 'Running'];
    
    if (currentStatus === 'Failed') {
      if (step === 'Deploying' || step === 'Running') return 'failed';
      return 'completed';
    }
    if (currentStatus === 'Stopped') {
      if (step === 'Running') return 'stopped';
      return 'completed';
    }
    if (currentStatus === 'Restarting') {
      if (step === 'Running') return 'pending';
      return 'completed';
    }

    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(step);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: DeploymentState) => {
    switch (status) {
      case 'Running':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Deploying':
      case 'Validating':
      case 'Created':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
      case 'Restarting':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Stopped':
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Runtime Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your active project nodes, redeploy containers, and track deployment lifecycles in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: totalAgents, icon: Layers, color: 'text-primary' },
          { label: 'Active Runtimes', value: `${runningAgents}/${totalAgents}`, icon: Cpu, color: 'text-emerald-400' },
          { label: 'System Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Uptime Restarts', value: totalRestarts, icon: RefreshCw, color: 'text-amber-400' }
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
        {/* Left Side: Agents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-manrope">Active Agent Runtimes</h2>
            <span className="text-xs text-slate-400">{filteredAgents.length} Agents visible</span>
          </div>

          <div className="space-y-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-4 bg-[#0d0b17] border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-[#110e1f] ${
                  selectedAgentId === agent.id 
                    ? 'border-primary shadow-[0_0_20px_rgba(123,57,252,0.15)] bg-[#100d20]' 
                    : 'border-[#2b2344]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-2.5 rounded-full ${
                    agent.status === 'Running' ? 'bg-emerald-500 animate-pulse' :
                    ['Deploying', 'Validating', 'Created'].includes(agent.status) ? 'bg-amber-500 animate-pulse' :
                    agent.status === 'Failed' ? 'bg-rose-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.project}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 md:gap-8 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Uptime</span>
                    <span className="text-slate-200 mt-1 block font-medium">
                      {agent.status === 'Running' ? formatUptime(agent.uptime) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Requests</span>
                    <span className="text-slate-200 mt-1 block font-medium">{agent.requestCount}</span>
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => mockDataStore.triggerRedeploy(agent.id)}
                    className="p-2 bg-[#131126] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg hover:border-primary transition-all"
                    title="Redeploy Container"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                  {agent.status === 'Running' ? (
                    <button
                      onClick={() => mockDataStore.triggerStop(agent.id)}
                      className="p-2 bg-[#131126] border border-[#2b2344] text-rose-400 hover:bg-rose-500/10 rounded-lg hover:border-rose-500/30 transition-all"
                      title="Stop Agent"
                    >
                      <Square className="size-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => mockDataStore.updateAgentStatus(agent.id, 'Running')}
                      className="p-2 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 rounded-lg transition-all"
                      title="Start Agent"
                    >
                      <Play className="size-4 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredAgents.length === 0 && (
              <div className="text-center py-12 bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl">
                <AlertCircle className="size-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No agents found</p>
                <p className="text-xs text-slate-500 mt-1">Select a different project from the dropdown context filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Stepper Timeline & Active Detail card */}
        <div className="space-y-6">
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white font-manrope">Deployment Lifecycle</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tracking node: {selectedAgent.name}</p>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 space-y-6 border-l border-[#2b2344]/60 ml-2 pt-1 pb-1">
              {stepperStates.map((step, idx) => {
                const stepStatus = getStepStatus(step, selectedAgent.status);
                
                let iconClass = 'bg-[#131126] border-[#2b2344] text-slate-500';
                let textClass = 'text-slate-400';
                let stepLabel = 'Pending';

                if (stepStatus === 'completed') {
                  iconClass = 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(123,57,252,0.4)]';
                  textClass = 'text-slate-200';
                  stepLabel = 'Completed';
                } else if (stepStatus === 'active') {
                  iconClass = 'bg-amber-500 border-amber-500 text-white animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]';
                  textClass = 'text-white font-semibold';
                  stepLabel = 'Active';
                } else if (stepStatus === 'failed') {
                  iconClass = 'bg-rose-500 border-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]';
                  textClass = 'text-rose-400 font-semibold';
                  stepLabel = 'Failed';
                } else if (stepStatus === 'stopped') {
                  iconClass = 'bg-slate-600 border-slate-600 text-white';
                  textClass = 'text-slate-400 font-semibold';
                  stepLabel = 'Stopped';
                }

                return (
                  <div key={idx} className="relative">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-[31px] top-0.5 size-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${iconClass}`}>
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${textClass}`}>{step}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-[#131126] border border-[#2b2344]/40 text-slate-400`}>
                          {stepLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        {step === 'Created' && 'Railway container space allocated and build config loaded.'}
                        {step === 'Validating' && 'Lint checks and deployment variables verification.'}
                        {step === 'Deploying' && 'Streaming image layers to Railway and launching endpoints.'}
                        {step === 'Running' && 'Endpoints active and health check probe reporting OK.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Redeploy Trigger */}
            <div className="pt-2">
              <button
                onClick={() => mockDataStore.triggerRedeploy(selectedAgent.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-semibold shadow-[0_4px_15px_rgba(123,57,252,0.3)] transition-all"
              >
                <RefreshCw className="size-3.5" />
                Trigger Live Redeployment
              </button>
            </div>
          </div>

          {/* Quick Terminal Logs Summary */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="size-4 text-primary" />
                  Recent Container logs
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedAgent.name}</p>
              </div>
            </div>

            <div className="bg-[#05030a] border border-[#2b2344]/30 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1 scrollbar-thin">
              {selectedAgent.logs.slice(-6).map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.includes('[ERROR]')) colorClass = 'text-rose-400';
                if (log.includes('[WARN]')) colorClass = 'text-amber-400';
                if (log.includes('[SYSTEM]')) colorClass = 'text-primary';
                return (
                  <div key={i} className={colorClass}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
