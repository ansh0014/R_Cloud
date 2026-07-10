import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Clock,
  CheckCircle,
  XCircle,
  GitBranch,
  Search
} from 'lucide-react';

interface OutletContextType {
  selectedProject: string;
}

interface HistoricalDeployment {
  id: string;
  agentName: string;
  project: string;
  branch: string;
  durationMs: number;
  status: 'Success' | 'Failed';
  timestamp: string;
  commitMsg: string;
}

const mockHistory: HistoricalDeployment[] = [
  {
    id: 'dep-109',
    agentName: 'Customer-Support-Bot',
    project: 'E-Commerce Platform',
    branch: 'main',
    durationMs: 5120,
    status: 'Success',
    timestamp: '2026-07-08T09:42:00Z',
    commitMsg: 'feat: add pricing query context parser'
  },
  {
    id: 'dep-108',
    agentName: 'DevOps-Code-Reviewer',
    project: 'CI/CD Toolchain',
    branch: 'main',
    durationMs: 8240,
    status: 'Success',
    timestamp: '2026-07-08T08:12:00Z',
    commitMsg: 'refactor: use localized external store check-in'
  },
  {
    id: 'dep-107',
    agentName: 'Security-Scanner',
    project: 'Infra Auditing',
    branch: 'main',
    durationMs: 9140,
    status: 'Failed',
    timestamp: '2026-07-08T07:22:00Z',
    commitMsg: 'fix: scanner port binding conflicts'
  },
  {
    id: 'dep-106',
    agentName: 'Customer-Support-Bot',
    project: 'E-Commerce Platform',
    branch: 'dev',
    durationMs: 4680,
    status: 'Success',
    timestamp: '2026-07-07T18:30:00Z',
    commitMsg: 'test: mock integrations parameters'
  },
  {
    id: 'dep-105',
    agentName: 'Sales-Outreach-Agent',
    project: 'E-Commerce Platform',
    branch: 'release-1.1',
    durationMs: 6100,
    status: 'Success',
    timestamp: '2026-07-07T14:15:00Z',
    commitMsg: 'chore: bump node base image tag version'
  },
  {
    id: 'dep-104',
    agentName: 'Security-Scanner',
    project: 'Infra Auditing',
    branch: 'patch-12',
    durationMs: 4120,
    status: 'Success',
    timestamp: '2026-07-06T11:00:00Z',
    commitMsg: 'security: update base packages check'
  },
  {
    id: 'dep-103',
    agentName: 'DevOps-Code-Reviewer',
    project: 'CI/CD Toolchain',
    branch: 'feature/diff-view',
    durationMs: 12450,
    status: 'Success',
    timestamp: '2026-07-05T15:45:00Z',
    commitMsg: 'feat: add git diff formatter support'
  },
  {
    id: 'dep-102',
    agentName: 'Customer-Support-Bot',
    project: 'E-Commerce Platform',
    branch: 'main',
    durationMs: 5800,
    status: 'Success',
    timestamp: '2026-07-05T09:20:00Z',
    commitMsg: 'feat: integrate direct vector search callbacks'
  },
  {
    id: 'dep-101',
    agentName: 'Sales-Outreach-Agent',
    project: 'E-Commerce Platform',
    branch: 'main',
    durationMs: 7850,
    status: 'Failed',
    timestamp: '2026-07-04T16:10:00Z',
    commitMsg: 'fix: fix dynamic scheduler interval locks'
  }
];

export default function DeploymentsPage() {
  const { selectedProject } = useOutletContext<OutletContextType>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<HistoricalDeployment | null>(null);

  // Filter based on layout project selector + search term
  const filteredHistory = mockHistory.filter((d) => {
    const matchesProject = selectedProject === 'All Projects' || d.project === selectedProject;
    const matchesSearch = d.agentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.commitMsg.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Analytics helper metrics
  const totalBuilds = filteredHistory.length;
  const successfulBuilds = filteredHistory.filter(d => d.status === 'Success').length;
  const failedBuilds = filteredHistory.filter(d => d.status === 'Failed').length;
  
  const avgDuration = totalBuilds > 0
    ? (filteredHistory.reduce((sum, d) => sum + d.durationMs, 0) / totalBuilds / 1000).toFixed(2)
    : '0.00';

  // Format historical date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Recharts Formatter
  const chartData = [...filteredHistory]
    .reverse()
    .map(d => ({
      name: d.id,
      agent: d.agentName,
      seconds: parseFloat((d.durationMs / 1000).toFixed(1)),
      status: d.status
    }));

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Deployment History & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review detailed logs of container builds, track average deployment speeds, and inspect previous configurations.
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Builds', value: totalBuilds, subtext: 'Triggered total build runs' },
          { label: 'Successful Builds', value: successfulBuilds, subtext: `${totalBuilds > 0 ? ((successfulBuilds/totalBuilds)*100).toFixed(0) : 100}% Pass rate`, color: 'text-emerald-400' },
          { label: 'Failed Builds', value: failedBuilds, subtext: `${totalBuilds > 0 ? ((failedBuilds/totalBuilds)*100).toFixed(0) : 0}% Fail rate`, color: 'text-rose-400' },
          { label: 'Avg Build Speed', value: `${avgDuration}s`, subtext: 'Build & lifecycle duration' }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium">{item.label}</p>
            <p className={`text-xl font-bold mt-1 font-manrope ${item.color || 'text-white'}`}>{item.value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{item.subtext}</p>
          </div>
        ))}
      </div>

      {/* Duration Graph Panel */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white font-manrope">Build Duration Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Deployment compilation speed (seconds) per run</p>
        </div>

        <div className="h-64 w-full bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(123, 57, 252, 0.05)' }}
                />
                <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.status === 'Success' ? '#7b39fc' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical data for graph rendering.
            </div>
          )}
        </div>
      </div>

      {/* Filter and List Panel */}
      <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white font-manrope">Build Audits</h2>

          {/* Search Inputs */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search agent or commit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Deployments Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2344]/60 text-slate-400 font-semibold">
                <th className="py-3 px-4">Deployment ID</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Commit Message</th>
                <th className="py-3 px-4">Triggered At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
              {filteredHistory.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="hover:bg-[#131126]/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-primary">{row.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{row.agentName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-[#131126] px-2 py-0.5 rounded text-[10px] text-slate-400 border border-[#2b2344]/30">
                      <GitBranch className="size-3" />
                      {row.branch}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium truncate max-w-[180px]">{row.commitMsg}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(row.timestamp)}</td>
                  <td className="py-3 px-4 font-medium">{(row.durationMs / 1000).toFixed(2)}s</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.status === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.status === 'Success' ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No historical builds found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row detail drawer/modal */}
      {selectedRow && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelectedRow(null)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] z-50 bg-[#0d0b17] border-l border-[#2b2344] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2b2344]/60 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-manrope">Build Audit Details</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRow.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="p-1.5 hover:bg-[#1c1830] rounded-lg transition-colors"
                >
                  <XCircle className="size-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              {/* Stats info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131126] border border-[#2b2344]/30 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                    selectedRow.status === 'Success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {selectedRow.status}
                  </span>
                </div>
                <div className="bg-[#131126] border border-[#2b2344]/30 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Elapsed Time</span>
                  <span className="text-sm font-bold text-white mt-1 block flex items-center gap-1">
                    <Clock className="size-3.5 text-primary" />
                    {(selectedRow.durationMs / 1000).toFixed(2)} seconds
                  </span>
                </div>
              </div>

              {/* Build Meta list */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Agent Container</span>
                  <span className="text-white font-medium">{selectedRow.agentName}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Git Branch</span>
                  <span className="text-white font-mono">{selectedRow.branch}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Triggered at</span>
                  <span className="text-white">{formatDate(selectedRow.timestamp)}</span>
                </div>
                <div className="flex flex-col gap-1 pb-2">
                  <span className="text-slate-400">Commit Message</span>
                  <span className="text-slate-200 bg-[#131126] border border-[#2b2344]/40 rounded-lg p-2.5 mt-1 font-mono text-[11px] leading-relaxed">
                    {selectedRow.commitMsg}
                  </span>
                </div>
              </div>

              {/* Process Stages details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Build Stages Lifecycle</h3>
                <div className="relative border-l border-[#2b2344] ml-2.5 pl-5 space-y-4 text-[11px] text-slate-400">
                  {[
                    { title: 'Base Image Pull', dur: '0.8s', desc: 'Pulling python-node base image layers from registry.' },
                    { title: 'Variable Inject & Validation', dur: '0.5s', desc: 'Loaded project environmental keys.' },
                    { title: 'Vite Compilation', dur: '2.4s', desc: 'Compiled bundle and assets.' },
                    { title: 'Railway Instance Provision', dur: '1.2s', desc: 'Spun runtime container and bound port.' },
                    { title: 'Health Check Probes', dur: '0.4s', desc: selectedRow.status === 'Success' ? 'Endpoint response check passed.' : 'Endpoint response check timed out.' }
                  ].map((stage, sIdx) => (
                    <div key={sIdx} className="relative">
                      <div className={`absolute -left-[27px] top-0.5 size-3.5 rounded-full border border-[#2b2344] flex items-center justify-center ${
                        selectedRow.status === 'Failed' && sIdx === 4
                          ? 'bg-rose-500 border-rose-500'
                          : 'bg-primary border-primary'
                      }`} />
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{stage.title}</span>
                        <span className="text-slate-500 font-mono font-medium">{stage.dur}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stage.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRow(null)}
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
