import { useState, useEffect } from 'react';
import { listDeployments, listProjects, type Deployment } from '../../lib/api';
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
  Search,
  Loader2,
  FolderGit2
} from 'lucide-react';

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<Deployment | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDeploymentsData() {
      setIsLoading(true);
      try {
        const projectsList = await listProjects();
        if (projectsList.length === 0) {
          if (isMounted) {
            setDeployments([]);
            setIsLoading(false);
          }
          return;
        }

        // Fetch deployments for all projects
        const allDeeps: Deployment[] = [];
        for (const proj of projectsList) {
          const proDeeps = await listDeployments(proj.id);
          allDeeps.push(...proDeeps);
        }

        if (isMounted) {
          setDeployments(allDeeps);
        }
      } catch (err) {
        console.error('Failed to load deployments:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDeploymentsData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter based on search term
  const filteredHistory = deployments.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      (d.branch || '').toLowerCase().includes(term) ||
      (d.commitHash || '').toLowerCase().includes(term) ||
      (d.version || '').toLowerCase().includes(term) ||
      (d.id || '').toLowerCase().includes(term)
    );
  });

  // Analytics helper metrics
  const totalBuilds = filteredHistory.length;
  const successfulBuilds = filteredHistory.filter(d => d.status === 'COMPLETED' || d.status === 'RUNNING').length;
  const failedBuilds = filteredHistory.filter(d => d.status === 'FAILED').length;

  // Format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
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
      name: d.id.slice(0, 8),
      version: d.version || 'v1.0.0',
      status: d.status
    }));

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F7F9F7] font-manrope">Deployment History & Analytics</h1>
        <p className="text-sm text-[#CFF1D2]/75 mt-1 font-sans">
          Review live container build audits, track deployment statuses, and inspect microVM runtime telemetry.
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Builds', value: totalBuilds, subtext: 'Triggered deployment runs', color: 'text-[#BFF2F0]' },
          { label: 'Successful Builds', value: successfulBuilds, subtext: `${totalBuilds > 0 ? ((successfulBuilds/totalBuilds)*100).toFixed(0) : 100}% Pass rate`, color: 'text-[#92FF5F]' },
          { label: 'Failed Builds', value: failedBuilds, subtext: `${totalBuilds > 0 ? ((failedBuilds/totalBuilds)*100).toFixed(0) : 0}% Fail rate`, color: 'text-[#FF7036]' },
          { label: 'Active Runtimes', value: successfulBuilds, subtext: 'Running container instances', color: 'text-[#CFF1D2]' }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-4 shadow-lg">
            <p className="text-xs text-[#CFF1D2]/70 font-mono font-semibold uppercase">{item.label}</p>
            <p className={`text-2xl font-bold mt-1.5 font-mono ${item.color || 'text-white'}`}>{item.value}</p>
            <p className="text-[10px] text-[#CFF1D2]/60 mt-1 font-mono">{item.subtext}</p>
          </div>
        ))}
      </div>

      {/* Duration Graph Panel */}
      <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Build Run Activity</h2>
          <p className="text-xs text-[#CFF1D2]/70 mt-0.5 font-mono">Deployment statuses per run</p>
        </div>

        <div className="h-48 w-full bg-[#071F14]/60 border border-[#CFF1D2]/15 rounded-lg p-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#CFF1D2]/70 gap-2 font-mono">
              <Loader2 className="size-4 animate-spin text-[#92FF5F]" /> Loading deployment analytics...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0F3B27" />
                <XAxis dataKey="name" stroke="#CFF1D2" fontSize={10} tickLine={false} />
                <YAxis stroke="#CFF1D2" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071F14', borderColor: '#CFF1D2', color: '#F7F9F7', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(146, 255, 95, 0.08)' }}
                />
                <Bar dataKey="name" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['COMPLETED', 'RUNNING'].includes(entry.status) ? '#92FF5F' : '#FF7036'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-[#CFF1D2]/60 gap-1 font-mono">
              <FolderGit2 className="size-6 text-[#92FF5F]/50 mb-1" />
              <span>No historical deployments found. Deploy your first agent project to see analytics!</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and List Panel */}
      <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Build Audits</h2>

          {/* Search Inputs */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#CFF1D2]/60" />
            <input
              type="text"
              placeholder="Search branch, hash, or version..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#071F14] border border-[#CFF1D2]/25 text-xs text-[#F7F9F7] rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#92FF5F] font-mono"
            />
          </div>
        </div>

        {/* Deployments Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#CFF1D2]/20 text-[#CFF1D2]/70 font-semibold bg-[#071F14]/50 font-mono">
                <th className="py-3 px-4">Deployment ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Commit Hash</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CFF1D2]/10 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#CFF1D2]/70 font-mono">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-[#92FF5F]" />
                    Fetching real deployments from API Gateway...
                  </td>
                </tr>
              ) : filteredHistory.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="hover:bg-[#071F14]/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-[11px] font-bold text-[#92FF5F]">{row.id.slice(0, 18)}...</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-[#071F14] px-2.5 py-0.5 rounded text-[10px] text-[#BFF2F0] border border-[#CFF1D2]/20 font-mono">
                      <GitBranch className="size-3" />
                      {row.branch || 'main'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#CFF1D2]/75 font-mono text-[11px]">{row.commitHash || 'head'}</td>
                  <td className="py-3 px-4 text-[#F7F9F7] capitalize">{row.mode || 'monolith'}</td>
                  <td className="py-3 px-4 text-[#CFF1D2]/75 font-mono">{formatDate(row.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ['COMPLETED', 'RUNNING'].includes(row.status)
                        ? 'bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30'
                        : row.status === 'FAILED'
                        ? 'bg-[#FF7036]/15 text-[#FF7036] border border-[#FF7036]/30'
                        : 'bg-[#BFF2F0]/15 text-[#BFF2F0] border border-[#BFF2F0]/30 animate-pulse'
                    }`}>
                      {['COMPLETED', 'RUNNING'].includes(row.status) ? (
                        <CheckCircle className="size-3" />
                      ) : row.status === 'FAILED' ? (
                        <XCircle className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#CFF1D2]/60 font-mono">
                    No deployments found. Trigger your first deployment from the "Deploy Agent" page.
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
          <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] z-50 bg-[#0F3B27] border-l border-[#CFF1D2]/25 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 text-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#CFF1D2]/20 pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#F7F9F7] font-manrope">Build Audit Details</h2>
                  <p className="text-xs text-[#92FF5F] font-mono mt-0.5">{selectedRow.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="p-1.5 hover:bg-[#071F14] rounded-lg transition-colors"
                >
                  <XCircle className="size-5 text-[#CFF1D2] hover:text-white" />
                </button>
              </div>

              {/* Stats info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#071F14] border border-[#CFF1D2]/20 rounded-xl p-3">
                  <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold mt-1 ${
                    ['COMPLETED', 'RUNNING'].includes(selectedRow.status)
                      ? 'bg-[#92FF5F]/15 text-[#92FF5F] border border-[#92FF5F]/30'
                      : selectedRow.status === 'FAILED'
                      ? 'bg-[#FF7036]/15 text-[#FF7036] border border-[#FF7036]/30'
                      : 'bg-[#BFF2F0]/15 text-[#BFF2F0] border border-[#BFF2F0]/30'
                  }`}>
                    {selectedRow.status}
                  </span>
                </div>
                <div className="bg-[#071F14] border border-[#CFF1D2]/20 rounded-xl p-3">
                  <span className="text-[10px] text-[#CFF1D2]/70 block uppercase font-mono font-bold tracking-wider">Project ID</span>
                  <span className="text-xs font-mono font-bold text-[#BFF2F0] mt-1 block truncate">
                    {selectedRow.projectId}
                  </span>
                </div>
              </div>

              {/* Build Meta list */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-[#CFF1D2]/15 pb-2">
                  <span className="text-[#CFF1D2]/70">Git Branch</span>
                  <span className="text-white font-mono">{selectedRow.branch || 'main'}</span>
                </div>
                <div className="flex justify-between border-b border-[#CFF1D2]/15 pb-2">
                  <span className="text-[#CFF1D2]/70">Commit Hash</span>
                  <span className="text-white font-mono">{selectedRow.commitHash || 'head'}</span>
                </div>
                <div className="flex justify-between border-b border-[#CFF1D2]/15 pb-2">
                  <span className="text-[#CFF1D2]/70">Created at</span>
                  <span className="text-white font-mono">{formatDate(selectedRow.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-[#CFF1D2]/15 pb-2">
                  <span className="text-[#CFF1D2]/70">Completed at</span>
                  <span className="text-white font-mono">{formatDate(selectedRow.completedAt)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRow(null)}
              className="w-full py-2.5 bg-[#92FF5F] hover:bg-[#82ef50] text-[#0F3B27] rounded-lg text-xs font-mono font-bold transition-all mt-4 shadow-[0_2px_12px_rgba(146,255,95,0.3)]"
            >
              Close Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}
