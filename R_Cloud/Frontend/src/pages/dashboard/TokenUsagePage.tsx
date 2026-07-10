import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMockDataStream } from '../../hooks/useMockDataStream';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Coins,
  DollarSign,
  Percent,
  BrainCircuit
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

export default function TokenUsagePage() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const { agents } = useMockDataStream();

  // Filter agents based on active project context
  const filteredAgents = agents.filter(
    (a) => selectedProject === 'All Projects' || a.project === selectedProject
  );

  const [activeAgentId, setActiveAgentId] = useState<string>('');

  const selectedAgent = agents.find((a) => a.id === activeAgentId) || filteredAgents[0] || agents[0];

  // Set default active agent once agents load
  React.useEffect(() => {
    if (filteredAgents.length > 0 && !activeAgentId) {
      setActiveAgentId(filteredAgents[0].id);
    }
  }, [filteredAgents, activeAgentId]);

  // Pricing configuration multipliers (per 1K tokens)
  const PROMPT_PRICE_PER_1K = 0.0015; // $0.0015 / 1K tokens
  const COMP_PRICE_PER_1K = 0.0020;   // $0.0020 / 1K tokens

  const promptCost = (selectedAgent.promptTokens / 1000) * PROMPT_PRICE_PER_1K;
  const completionCost = (selectedAgent.completionTokens / 1000) * COMP_PRICE_PER_1K;
  const totalCost = promptCost + completionCost;

  const promptRatio = selectedAgent.totalTokens > 0
    ? ((selectedAgent.promptTokens / selectedAgent.totalTokens) * 100).toFixed(0)
    : '0';

  const completionRatio = selectedAgent.totalTokens > 0
    ? ((selectedAgent.completionTokens / selectedAgent.totalTokens) * 100).toFixed(0)
    : '0';

  // Format token counts to readable string
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Generate mock chart data over past 7 days based on current values
  const chartData = React.useMemo(() => {
    const basePrompt = selectedAgent.promptTokens / 7;
    const baseComp = selectedAgent.completionTokens / 7;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      // Create gradual increase wave
      const scale = 0.7 + (idx * 0.1) + (Math.sin(idx) * 0.08);
      const prompt = Math.round(basePrompt * scale);
      const completion = Math.round(baseComp * scale);

      return {
        name: day,
        Prompt: prompt,
        Completion: completion,
        Total: prompt + completion
      };
    });
  }, [selectedAgent.id, selectedAgent.promptTokens, selectedAgent.completionTokens]);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header & Agent Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">AI Token Usage</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track computational LLM input/output tokens and cost calculations parsed directly from /execute responses.
          </p>
        </div>

        {/* Agent Selector Dropdown */}
        {filteredAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Inspect Agent:</span>
            <select
              value={activeAgentId}
              onChange={(e) => setActiveAgentId(e.target.value)}
              className="bg-[#0d0b17] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {filteredAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredAgents.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0b17] border border-[#2b2344]/40 rounded-2xl">
          <Coins className="size-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No agent deployments</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no agents in this project context to monitor. Start or deploy an agent container first.
          </p>
        </div>
      ) : !selectedAgent.reportsTokens ? (
        /* Feature 6 Empty State - Token data not reported by this agent */
        <div className="p-12 text-center bg-[#0d0b17] border border-dashed border-[#2b2344] rounded-2xl space-y-4 max-w-2xl mx-auto">
          <BrainCircuit className="size-12 text-slate-500 mx-auto opacity-80" />
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white font-manrope">Token data not reported by this agent</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              This agent container does not report prompt or completion metrics in its endpoints response objects.
            </p>
          </div>
          <div className="text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 bg-[#131126] border border-[#2b2344]/60 rounded-md">
              JSON key expected: <code className="text-primary font-mono text-[10px]">usage: &#123; prompt_tokens, completion_tokens &#125;</code>
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Token Usage Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Cost card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Estimated Costs</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">${totalCost.toFixed(4)}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-0.5">
                <DollarSign className="size-3 text-emerald-400" />
                USD Platform calculation
              </div>
            </div>

            {/* Total Tokens card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Tokens</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{formatNumber(selectedAgent.totalTokens)}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3">
                Prompt + Completion tokens
              </div>
            </div>

            {/* Prompt tokens card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Prompt Tokens</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{formatNumber(selectedAgent.promptTokens)}</span>
              </div>
              <div className="text-[10px] text-purple-400 font-semibold mt-3 flex items-center gap-1">
                <Percent className="size-3" />
                {promptRatio}% of total tokens
              </div>
            </div>

            {/* Completion tokens card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Completion Tokens</span>
                <span className="text-2xl font-bold text-white mt-1.5 block font-manrope">{formatNumber(selectedAgent.completionTokens)}</span>
              </div>
              <div className="text-[10px] text-[#a484d7] font-semibold mt-3 flex items-center gap-1">
                <Percent className="size-3" />
                {completionRatio}% of total tokens
              </div>
            </div>
          </div>

          {/* Tokens Stacked Bar Chart */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white font-manrope">Historical Token Consumption</h2>
              <p className="text-xs text-slate-400 mt-0.5">Prompt inputs and output completions ratio over past 7 days</p>
            </div>

            <div className="h-64 bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="Prompt" stackId="a" fill="#7b39fc" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Completion" stackId="a" fill="#a484d7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pricing multiplier card */}
          <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configured Token Pricing Multipliers</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#131126] border border-[#2b2344]/40 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-400">Prompt Price</span>
                <span className="font-mono text-slate-200 font-semibold">${PROMPT_PRICE_PER_1K.toFixed(4)} / 1K tokens</span>
              </div>
              <div className="bg-[#131126] border border-[#2b2344]/40 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-400">Completion Price</span>
                <span className="font-mono text-slate-200 font-semibold">${COMP_PRICE_PER_1K.toFixed(4)} / 1K tokens</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
