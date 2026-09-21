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
        <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Deployment History & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review live container build audits, track deployment statuses, and inspect runtime configurations.
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Builds', value: totalBuilds, subtext: 'Triggered deployment runs' },
          { label: 'Successful Builds', value: successfulBuilds, subtext: `${totalBuilds > 0 ? ((successfulBuilds/totalBuilds)*100).toFixed(0) : 100}% Pass rate`, color: 'text-emerald-400' },
          { label: 'Failed Builds', value: failedBuilds, subtext: `${totalBuilds > 0 ? ((failedBuilds/totalBuilds)*100).toFixed(0) : 0}% Fail rate`, color: 'text-rose-400' },
          { label: 'Active Runtimes', value: successfulBuilds, subtext: 'Running container instances' }
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
          <h2 className="text-base font-bold text-white font-manrope">Build Run Activity</h2>
          <p className="text-xs text-slate-400 mt-0.5">Deployment statuses per run</p>
        </div>

        <div className="h-48 w-full bg-[#05030a]/40 border border-[#2b2344]/20 rounded-lg p-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
              <Loader2 className="size-4 animate-spin text-primary" /> Loading deployment analytics...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d1933" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0b17', borderColor: '#2b2344', color: '#f8fafc', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(123, 57, 252, 0.05)' }}
                />
                <Bar dataKey="name" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['COMPLETED', 'RUNNING'].includes(entry.status) ? '#7b39fc' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-1">
              <FolderGit2 className="size-6 text-slate-600 mb-1" />
              <span>No historical deployments found. Deploy your first agent project to see analytics!</span>
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
              placeholder="Search branch, hash, or version..."
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
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Commit Hash</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2344]/30 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Fetching real deployments from API Gateway...
                  </td>
                </tr>
              ) : filteredHistory.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="hover:bg-[#131126]/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-primary">{row.id.slice(0, 18)}...</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-[#131126] px-2 py-0.5 rounded text-[10px] text-slate-400 border border-[#2b2344]/30">
                      <GitBranch className="size-3" />
                      {row.branch || 'main'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{row.commitHash || 'head'}</td>
                  <td className="py-3 px-4 text-slate-300 capitalize">{row.mode || 'monolith'}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(row.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      ['COMPLETED', 'RUNNING'].includes(row.status)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : row.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
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
                  <td colSpan={6} className="py-8 text-center text-slate-500">
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
                    ['COMPLETED', 'RUNNING'].includes(selectedRow.status)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : selectedRow.status === 'FAILED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedRow.status}
                  </span>
                </div>
                <div className="bg-[#131126] border border-[#2b2344]/30 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Project ID</span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block truncate">
                    {selectedRow.projectId}
                  </span>
                </div>
              </div>

              {/* Build Meta list */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Git Branch</span>
                  <span className="text-white font-mono">{selectedRow.branch || 'main'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Commit Hash</span>
                  <span className="text-white font-mono">{selectedRow.commitHash || 'head'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Created at</span>
                  <span className="text-white">{formatDate(selectedRow.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/30 pb-2">
                  <span className="text-slate-400">Completed at</span>
                  <span className="text-white">{formatDate(selectedRow.completedAt)}</span>
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
