import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockDataStream, mockDataStore } from '../../hooks/useMockDataStream';
import type { Agent, DeploymentHistoryItem } from '../../hooks/useMockDataStream';
import {
  CheckCircle2,
  GitBranch,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Settings2,
  Check,
  Play,
  ExternalLink,
  SlidersHorizontal,
  X,
  Globe,
  History,
  AlertTriangle
} from 'lucide-react';

const Github = ({ className = 'size-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85 0 1.66.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);

interface EnvVar {
  id: string;
  key: string;
  value: string;
  environment: 'All' | 'Production' | 'Development';
  isSecret: boolean;
}

interface MockRepo {
  name: string;
  isPrivate: boolean;
  defaultBranch: string;
  lastUpdated: string;
  runtime: 'Python' | 'NodeJS' | 'Go';
  framework: string;
  entryFile: string;
  startCommand: string;
  port: number;
}

const mockRepos: MockRepo[] = [
  {
    name: 'my-ai-agent',
    isPrivate: false,
    defaultBranch: 'main',
    lastUpdated: '2 hours ago',
    runtime: 'Python',
    framework: 'FastAPI',
    entryFile: 'main.py',
    startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000',
    port: 8000
  },
  {
    name: 'customer-support-agent',
    isPrivate: true,
    defaultBranch: 'main',
    lastUpdated: '1 day ago',
    runtime: 'NodeJS',
    framework: 'Express',
    entryFile: 'index.js',
    startCommand: 'node index.js',
    port: 3000
  },
  {
    name: 'devops-reviewer',
    isPrivate: false,
    defaultBranch: 'main',
    lastUpdated: '3 days ago',
    runtime: 'Go',
    framework: 'Gin',
    entryFile: 'main.go',
    startCommand: './reviewer',
    port: 8080
  },
  {
    name: 'finance-market-agent',
    isPrivate: true,
    defaultBranch: 'develop',
    lastUpdated: '5 mins ago',
    runtime: 'Python',
    framework: 'LangChain',
    entryFile: 'agent.py',
    startCommand: 'python agent.py',
    port: 5000
  }
];

export default function DeployPage() {
  const navigate = useNavigate();
  const { deploymentHistory } = useMockDataStream();

  // --- Step Tracking state ---
  // 1: Configure (Connection, repo select, env, config fields)
  // 2: Deploying (Stepper loading & terminal output)
  // 3: Done (Success/Failure landing)
  const [deployStep, setDeployStep] = useState<1 | 2 | 3>(1);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<'connect' | 'analyze' | 'configure' | 'deploy' | 'live'>('connect');

  // --- Form & Connection States ---
  const [githubConnected, setGithubConnected] = useState<boolean>(() => {
    return localStorage.getItem('r_cloud_gh_connected') === 'true';
  });
  const [ghLoading, setGhLoading] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<MockRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<{ label: string; done: boolean; loading: boolean }[]>([]);

  // --- Config Form ---
  const [runtime, setRuntime] = useState('Python');
  const [runtimeVersion, setRuntimeVersion] = useState('3.12');
  const [startCommand, setStartCommand] = useState('');
  const [port, setPort] = useState(8000);
  const [rootDir, setRootDir] = useState('./');
  const [installCommand, setInstallCommand] = useState('pip install -r requirements.txt');
  const [buildCommand, setBuildCommand] = useState('python -m pip install --upgrade pip');
  const [outputDir, setOutputDir] = useState('dist');
  const [customBuildArgs, setCustomBuildArgs] = useState('--no-cache-dir');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- Environment Variables ---
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: '1', key: 'OPENAI_API_KEY', value: 'sk-proj-••••••••••••••••••••••••', environment: 'All', isSecret: true },
    { id: '2', key: 'DATABASE_URL', value: 'postgresql://db-user:••••••••••••@host:5432/main', environment: 'Production', isSecret: true }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newEnv, setNewEnv] = useState<'All' | 'Production' | 'Development'>('All');
  const [showSecretVal, setShowSecretVal] = useState<Record<string, boolean>>({});

  // --- Terminal Simulation & Progression ---
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [logs, setLogs] = useState<{ time: string; level: 'INFO' | 'SUCCESS' | 'ERROR'; msg: string }[]>([]);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'failed' | 'cancelled'>('idle');
  const [activeDeployId, setActiveDeployId] = useState('');
  const [activeAgentName, setActiveAgentName] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [selectedHistoryDeploy, setSelectedHistoryDeploy] = useState<DeploymentHistoryItem | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Save connection state locally
  const toggleGithubConnection = () => {
    if (githubConnected) {
      setGithubConnected(false);
      localStorage.setItem('r_cloud_gh_connected', 'false');
      setSelectedRepo(null);
    } else {
      setGhLoading(true);
      setTimeout(() => {
        setGithubConnected(true);
        localStorage.setItem('r_cloud_gh_connected', 'true');
        setGhLoading(false);
        setActiveWorkflowStep('analyze');
      }, 1500);
    }
  };

  // Trigger Repo Analyzer simulation when repo changes
  useEffect(() => {
    if (!selectedRepo) return;
    
    setIsScanning(true);
    setActiveWorkflowStep('analyze');
    
    // Setup analysis sequence stages
    const steps = [
      { label: 'Scanning project files...', done: false, loading: true },
      { label: 'Detecting package.json / requirements.txt...', done: false, loading: false },
      { label: 'Analyzing runtime requirements...', done: false, loading: false },
      { label: 'Resolving entry point files...', done: false, loading: false }
    ];
    setScanSteps(steps);

    // Timeline progressions
    setTimeout(() => {
      setScanSteps(prev => [
        { ...prev[0], done: true, loading: false },
        { ...prev[1], loading: true },
        prev[2],
        prev[3]
      ]);
    }, 800);

    setTimeout(() => {
      setScanSteps(prev => [
        prev[0],
        { ...prev[1], done: true, loading: false },
        { ...prev[2], loading: true },
        prev[3]
      ]);
    }, 1600);

    setTimeout(() => {
      setScanSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], done: true, loading: false },
        { ...prev[3], loading: true }
      ]);
    }, 2400);

    setTimeout(() => {
      setScanSteps(prev => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], done: true, loading: false }
      ]);
      
      // Auto populate config parameters matching runtime
      setRuntime(selectedRepo.runtime);
      setRuntimeVersion(selectedRepo.runtime === 'Python' ? '3.12' : selectedRepo.runtime === 'NodeJS' ? '20.x' : '1.22');
      setStartCommand(selectedRepo.startCommand);
      setPort(selectedRepo.port);
      setInstallCommand(selectedRepo.runtime === 'Python' ? 'pip install -r requirements.txt' : selectedRepo.runtime === 'NodeJS' ? 'npm install' : 'go build');
      setBuildCommand(selectedRepo.runtime === 'Python' ? 'python -m pip install --upgrade pip' : selectedRepo.runtime === 'NodeJS' ? 'npm run build' : 'go vet');
      
      setIsScanning(false);
      setActiveWorkflowStep('configure');
    }, 3200);

  }, [selectedRepo]);

  // Scroll terminal logs to bottom on update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Add environment variable
  const addEnvVar = () => {
    if (!newKey.trim() || !newVal.trim()) return;
    const isSecret = newKey.toUpperCase().includes('KEY') || newKey.toUpperCase().includes('SECRET') || newKey.toUpperCase().includes('PASSWORD') || newKey.toUpperCase().includes('TOKEN');
    
    setEnvVars(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        key: newKey.trim().toUpperCase(),
        value: newVal.trim(),
        environment: newEnv,
        isSecret
      }
    ]);
    setNewKey('');
    setNewVal('');
  };

  // Delete environment variable
  const deleteEnvVar = (id: string) => {
    setEnvVars(prev => prev.filter(v => v.id !== id));
  };

  // Toggle secret mask
  const toggleSecretMask = (id: string) => {
    setShowSecretVal(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Trigger Build & Deploy Simulation ---
  const handleStartDeployment = () => {
    if (!selectedRepo) return;
    
    setDeployStep(2);
    setActiveWorkflowStep('deploy');
    setDeployStatus('idle');
    setLogs([]);
    
    const timestamp = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0];
    };

    const addLog = (level: 'INFO' | 'SUCCESS' | 'ERROR', msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLogs(prev => [...prev, { time: timestamp(), level, msg }]);
          resolve();
        }, delay);
      });
    };

    const executeBuild = async () => {
      await addLog('INFO', `Initializing deployment context for ${selectedRepo.name}...`, 0);
      await addLog('INFO', `Target branch: refs/heads/${selectedBranch}`, 800);
      await addLog('INFO', `Establishing GitHub checkout connector...`, 1200);
      await addLog('SUCCESS', `Successfully cloned repository ${selectedRepo.name} (branch: ${selectedBranch})`, 1000);
      
      await addLog('INFO', `Checking engine configurations: Runtime=${runtime} Version=${runtimeVersion}`, 800);
      await addLog('INFO', `Root directory: '${rootDir}'`, 500);
      await addLog('INFO', `Injecting ${envVars.length} runtime environment secret variables...`, 900);
      
      await addLog('INFO', `Running install command: '${installCommand}'`, 1100);
      
      // Simulate build fail toggle
      if (simulateFailure) {
        await addLog('INFO', `Installing packages via compiler...`, 1500);
        await addLog('ERROR', `[BUILD ERROR] Error: Command failed with exit code 1: ${installCommand}`, 1000);
        await addLog('ERROR', `ModuleNotFoundError: No module named 'openai'`, 400);
        await addLog('ERROR', `Check requirements.txt and verify import names.`, 400);
        
        // Finalize state
        setDeployStatus('failed');
        setDeployStep(3);
        
        // Save deployment history record
        const deployId = `dep-${Math.floor(Math.random() * 9000) + 1000}`;
        const historyItem: DeploymentHistoryItem = {
          id: deployId,
          agentId: 'failed-run',
          agentName: selectedRepo.name,
          project: 'Imported',
          branch: selectedBranch,
          durationMs: 7300,
          status: 'Failed',
          timestamp: new Date().toISOString(),
          commitMsg: 'Simulated git commit deploy checkout'
        };
        mockDataStore.addDeploymentHistory(historyItem);
        return;
      }

      await addLog('SUCCESS', `All dependencies resolved and cached successfully.`, 2000);
      await addLog('INFO', `Running build command: '${buildCommand}'`, 800);
      await addLog('SUCCESS', `Agent bundle output built successfully into directory '${outputDir}'`, 1200);
      
      await addLog('INFO', `Starting container process: '${startCommand}' on Port ${port}`, 1000);
      await addLog('INFO', `Container spun up. Checking microservice status...`, 1000);
      await addLog('SUCCESS', `Port ${port} listener active. Health check PASSED.`, 1200);
      await addLog('SUCCESS', `Deployment successfully initialized! Live URL generated.`, 600);

      // Successfully create agent metadata
      const cleanId = `custom-agent-${Date.now().toString().slice(-4)}`;
      const cleanUrl = `https://${selectedRepo.name}.rcloud.ai`;
      
      // Persist values to load on success landing
      setActiveDeployId(`dep-${Math.floor(Math.random() * 90000) + 10000}`);
      setActiveAgentName(selectedRepo.name);
      setActiveUrl(cleanUrl);
      setDeployStatus('success');
      setActiveWorkflowStep('live');
      setDeployStep(3);

      // Create new agent document in store
      const newAgent: Agent = {
        id: cleanId,
        name: selectedRepo.name,
        project: 'Imported Runtimes',
        status: 'Running',
        uptime: 2,
        restarts: 0,
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        avgLatency: 120,
        p95Latency: 180,
        lastHealthCheck: new Date().toISOString(),
        healthStatus: 'healthy',
        reportsTokens: true,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        logs: [
          `[INFO] ${new Date().toISOString()} - Container spun up successfully.`,
          `[INFO] ${new Date().toISOString()} - Port ${port} exposed for inbound request streams.`
        ]
      };
      
      // Save globally
      mockDataStore.addNewAgent(newAgent);

      // Write deployment history
      const historyItem: DeploymentHistoryItem = {
        id: `dep-${Math.floor(Math.random() * 90000) + 10000}`,
        agentId: cleanId,
        agentName: selectedRepo.name,
        project: 'Imported Runtimes',
        branch: selectedBranch,
        durationMs: 11000,
        status: 'Success',
        timestamp: new Date().toISOString(),
        commitMsg: 'production deployment build'
      };
      mockDataStore.addDeploymentHistory(historyItem);
    };

    executeBuild();
  };

  // Filter repos based on search bar
  const filteredRepos = mockRepos.filter(
    r => r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* --- Stepper Component --- */}
      <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Deploy Your Agent</h1>
          <p className="text-sm text-slate-400 mt-1">
            Build and launch an existing AI agent repository directly to our cloud cluster.
          </p>
        </div>

        {/* Visual Stepper */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 text-xs font-semibold text-slate-400 bg-[#0d0b17] border border-[#2b2344]/40 px-4 py-2.5 rounded-full">
          <div className="flex items-center gap-1.5">
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
              githubConnected ? 'bg-emerald-500 text-black' : 'bg-[#7b39fc] text-white animate-pulse'
            }`}>
              {githubConnected ? <Check className="size-3" /> : '1'}
            </span>
            <span className={githubConnected ? 'text-white' : ''}>Connect</span>
          </div>
          <span className="text-slate-600">➔</span>

          <div className="flex items-center gap-1.5">
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
              selectedRepo ? 'bg-emerald-500 text-black' : activeWorkflowStep === 'analyze' ? 'bg-[#7b39fc] text-white animate-pulse' : 'bg-slate-800'
            }`}>
              {selectedRepo ? <Check className="size-3" /> : '2'}
            </span>
            <span className={selectedRepo ? 'text-white' : ''}>Analyze</span>
          </div>
          <span className="text-slate-600">➔</span>

          <div className="flex items-center gap-1.5">
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
              deployStep > 1 ? 'bg-emerald-500 text-black' : activeWorkflowStep === 'configure' ? 'bg-[#7b39fc] text-white animate-pulse' : 'bg-slate-800'
            }`}>
              {deployStep > 1 ? <Check className="size-3" /> : '3'}
            </span>
            <span className={deployStep > 1 ? 'text-white' : ''}>Configure</span>
          </div>
          <span className="text-slate-600">➔</span>

          <div className="flex items-center gap-1.5">
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
              deployStatus === 'success' ? 'bg-emerald-500 text-black' : activeWorkflowStep === 'deploy' ? 'bg-[#7b39fc] text-white animate-pulse' : 'bg-slate-800'
            }`}>
              {deployStatus === 'success' ? <Check className="size-3" /> : '4'}
            </span>
            <span className={activeWorkflowStep === 'deploy' ? 'text-white' : ''}>Deploy</span>
          </div>
          <span className="text-slate-600">➔</span>

          <div className="flex items-center gap-1.5">
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
              deployStatus === 'success' ? 'bg-emerald-500 text-black' : 'bg-slate-800'
            }`}>
              {deployStatus === 'success' ? <Check className="size-3" /> : '5'}
            </span>
            <span className={deployStatus === 'success' ? 'text-emerald-400' : ''}>Live</span>
          </div>
        </div>
      </div>

      {/* --- Step 1: Configuration Form Layout --- */}
      {deployStep === 1 && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* Main settings options (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Github Connect Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 border border-[#2b2344]/40 rounded-lg text-white">
                    <Github className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">GitHub Integration</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {githubConnected ? 'Verify repository sync settings.' : 'Connect your account to import agent codes.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    githubConnected 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {githubConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {!githubConnected ? (
                <div className="pt-2">
                  <button
                    onClick={toggleGithubConnection}
                    disabled={ghLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-[#7b39fc] hover:bg-[#682ad4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {ghLoading ? <RefreshCw className="size-4 animate-spin" /> : <Github className="size-4" />}
                    Connect GitHub Account
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#131126] border border-[#2b2344]/40 rounded-lg p-3.5 gap-3">
                  <div className="text-xs space-y-1">
                    <p className="text-slate-400">Account: <span className="font-semibold text-white">@legendxdevil</span></p>
                    <p className="text-slate-400">Sync: <span className="text-slate-300 font-mono">24 repositories available</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-[#1a1733] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-all">
                      Manage Connection
                    </button>
                    <button
                      onClick={toggleGithubConnection}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-medium transition-all"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Repository Select & Analyze Card */}
            {githubConnected && (
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">1. Select Repository</h3>
                  {selectedRepo && (
                    <button
                      onClick={() => setSelectedRepo(null)}
                      className="text-xs text-[#7b39fc] hover:text-[#915bfc] font-medium"
                    >
                      Change Repository
                    </button>
                  )}
                </div>

                {!selectedRepo ? (
                  <div className="space-y-3">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search repositories..."
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Repository list selection */}
                    <div className="border border-[#2b2344]/40 rounded-lg divide-y divide-[#2b2344]/30 max-h-56 overflow-y-auto">
                      {filteredRepos.length > 0 ? (
                        filteredRepos.map((repo) => (
                          <div
                            key={repo.name}
                            onClick={() => setSelectedRepo(repo)}
                            className="p-3 hover:bg-[#131126] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Github className="size-4 text-slate-400" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-200">{repo.name}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    repo.isPrivate 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                      : 'bg-primary/10 text-primary border border-primary/20'
                                  }`}>
                                    {repo.isPrivate ? 'Private' : 'Public'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">Last updated {repo.lastUpdated}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <GitBranch className="size-3 text-slate-500" />
                              <span className="font-mono">{repo.defaultBranch}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No repositories found matching your query.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Repository Card Display */}
                    <div className="flex items-center justify-between bg-[#131126] border border-[#2b2344] rounded-lg p-3.5">
                      <div className="flex items-center gap-3">
                        <Github className="size-4 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{selectedRepo.name}</span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 rounded-full ${
                              selectedRepo.isPrivate ? 'bg-amber-500/10 text-amber-400' : 'bg-primary/10 text-primary'
                            }`}>
                              {selectedRepo.isPrivate ? 'Private' : 'Public'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Default branch: <span className="font-mono">{selectedRepo.defaultBranch}</span></p>
                        </div>
                      </div>

                      {/* Branch selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Branch:</span>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="bg-[#0d0b17] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary"
                        >
                          <option value="main">main</option>
                          <option value="develop">develop</option>
                          <option value="feature/agent-v2">feature/agent-v2</option>
                        </select>
                      </div>
                    </div>

                    {/* Repository Scanning Loader */}
                    {isScanning ? (
                      <div className="bg-[#131126]/60 border border-[#2b2344]/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white">
                          <RefreshCw className="size-3.5 text-primary animate-spin" />
                          <span>Scanning repository files...</span>
                        </div>
                        <div className="space-y-1.5 pl-5 text-[11px]">
                          {scanSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {step.done ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : step.loading ? (
                                <RefreshCw className="size-3 text-amber-400 animate-spin" />
                              ) : (
                                <div className="size-3 rounded-full border border-slate-700" />
                              )}
                              <span className={step.done ? 'text-slate-300' : step.loading ? 'text-white font-medium animate-pulse' : 'text-slate-500'}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Scanning complete - Analysis Result Card */
                      <div className="bg-[#100d20] border border-emerald-500/20 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="size-4" />
                          <span>Intelligent Repository Analysis Complete</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          We successfully analyzed the project files. The following default configurations are recommended based on file structure indicators:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                          <div className="bg-[#131126] border border-[#2b2344]/60 p-2 rounded">
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Runtime</span>
                            <span className="font-mono text-slate-200">{selectedRepo.runtime}</span>
                          </div>
                          <div className="bg-[#131126] border border-[#2b2344]/60 p-2 rounded">
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Framework</span>
                            <span className="font-mono text-slate-200">{selectedRepo.framework}</span>
                          </div>
                          <div className="bg-[#131126] border border-[#2b2344]/60 p-2 rounded">
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Entry File</span>
                            <span className="font-mono text-slate-200">{selectedRepo.entryFile}</span>
                          </div>
                          <div className="bg-[#131126] border border-[#2b2344]/60 p-2 rounded">
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Exposed Port</span>
                            <span className="font-mono text-slate-200">{selectedRepo.port}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Deployment Configuration Card */}
            {githubConnected && selectedRepo && !isScanning && (
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-white border-b border-[#2b2344]/40 pb-3">
                  <Settings2 className="size-4.5 text-primary" />
                  <h3 className="text-sm font-semibold">2. Build & Runtime Configuration</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Runtime selection */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Runtime Platform</label>
                    <select
                      value={runtime}
                      onChange={(e) => setRuntime(e.target.value)}
                      className="w-full bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
                    >
                      <option value="Python">Python</option>
                      <option value="NodeJS">Node.js</option>
                      <option value="Go">Go (Golang)</option>
                    </select>
                  </div>

                  {/* Runtime version */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Version</label>
                    <input
                      type="text"
                      value={runtimeVersion}
                      onChange={(e) => setRuntimeVersion(e.target.value)}
                      className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  {/* Start Command */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Start Command</label>
                    <input
                      type="text"
                      value={startCommand}
                      onChange={(e) => setStartCommand(e.target.value)}
                      className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  {/* Port */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Target Port</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {/* Collapsible Advanced settings panel */}
                <div className="pt-2 border-t border-[#2b2344]/30">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <SlidersHorizontal className={`size-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                    <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
                  </button>

                  {showAdvanced && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 bg-[#131126]/40 border border-[#2b2344]/40 rounded-xl animate-in fade-in duration-200">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1.5">Root Directory</label>
                        <input
                          type="text"
                          value={rootDir}
                          onChange={(e) => setRootDir(e.target.value)}
                          className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1.5">Install Command</label>
                        <input
                          type="text"
                          value={installCommand}
                          onChange={(e) => setInstallCommand(e.target.value)}
                          className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1.5">Build Command</label>
                        <input
                          type="text"
                          value={buildCommand}
                          onChange={(e) => setBuildCommand(e.target.value)}
                          className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1.5">Output Directory</label>
                        <input
                          type="text"
                          value={outputDir}
                          onChange={(e) => setOutputDir(e.target.value)}
                          className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-slate-400 font-medium block mb-1.5">Custom Build Arguments</label>
                        <input
                          type="text"
                          value={customBuildArgs}
                          onChange={(e) => setCustomBuildArgs(e.target.value)}
                          className="w-full bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Environment Variables Editor Card */}
            {githubConnected && selectedRepo && !isScanning && (
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
                <div className="border-b border-[#2b2344]/40 pb-3">
                  <h3 className="text-sm font-semibold text-white">3. Environment Variables</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Environment variables are injected into your agent container at runtime. Note: secrets are stored in local frontend state.
                  </p>
                </div>

                {/* Grid Inputs to Add Variables */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    placeholder="KEY (e.g. API_KEY)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="flex-1 bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary font-mono uppercase"
                  />
                  <input
                    type="text"
                    placeholder="VALUE"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="flex-1 bg-[#131126] border border-[#2b2344] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary font-mono"
                  />
                  <select
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value as any)}
                    className="bg-[#131126] border border-[#2b2344] text-xs text-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="All">All Env</option>
                    <option value="Production">Production</option>
                    <option value="Development">Development</option>
                  </select>
                  <button
                    onClick={addEnvVar}
                    className="px-3.5 py-2 bg-primary hover:bg-[#682ad4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="size-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Variable Display Table */}
                <div className="border border-[#2b2344]/40 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#131126]/60 border-b border-[#2b2344]/40 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-3">Key</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Env</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2b2344]/30 text-slate-200">
                      {envVars.length > 0 ? (
                        envVars.map((v) => (
                          <tr key={v.id} className="hover:bg-[#131126]/30">
                            <td className="p-3 font-mono text-[11px] font-semibold text-slate-300">{v.key}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">
                              {v.isSecret && !showSecretVal[v.id] ? (
                                <span>••••••••••••••••••••</span>
                              ) : (
                                <span>{v.value}</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                v.environment === 'All' ? 'bg-slate-800 text-slate-300' :
                                v.environment === 'Production' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {v.environment}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {v.isSecret && (
                                  <button
                                    onClick={() => toggleSecretMask(v.id)}
                                    className="p-1 bg-[#131126] border border-[#2b2344] rounded text-slate-400 hover:text-white"
                                  >
                                    {showSecretVal[v.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteEnvVar(v.id)}
                                  className="p-1 bg-[#131126] border border-[#2b2344] rounded text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-xs text-slate-500">
                            No custom variables defined.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Summary & Simulation Toggles) */}
          <div className="space-y-6">
            
            {/* Deploy Summary Card */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Deployment Summary</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-[#2b2344]/20 pb-2">
                  <span className="text-slate-400">Repository</span>
                  <span className="text-white font-semibold font-mono">{selectedRepo ? selectedRepo.name : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/20 pb-2">
                  <span className="text-slate-400">Branch</span>
                  <span className="text-white font-semibold font-mono">{selectedRepo ? selectedBranch : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/20 pb-2">
                  <span className="text-slate-400">Runtime</span>
                  <span className="text-white font-mono">{selectedRepo ? `${runtime} (${runtimeVersion})` : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/20 pb-2">
                  <span className="text-slate-400">Target Port</span>
                  <span className="text-white font-mono">{selectedRepo ? port : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2b2344]/20 pb-2">
                  <span className="text-slate-400">Env Variables</span>
                  <span className="text-white font-mono">{selectedRepo ? envVars.length : '—'}</span>
                </div>
              </div>

              {/* Simulation Failure Override Checkbox */}
              {selectedRepo && (
                <div className="bg-[#131126] border border-[#2b2344]/40 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-400" />
                    <div>
                      <span className="text-xs text-slate-300 font-bold block">Simulate Build Fail</span>
                      <span className="text-[10px] text-slate-500 block">Tests failure screen output handling</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="accent-primary size-4 cursor-pointer"
                  />
                </div>
              )}

              {/* Deploy CTA Trigger */}
              <button
                onClick={handleStartDeployment}
                disabled={!selectedRepo || isScanning}
                className="w-full py-2.5 bg-primary hover:bg-[#682ad4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="size-3.5 fill-current" />
                Deploy Agent
              </button>
            </div>

            {/* Quick deployment list */}
            <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <History className="size-4 text-slate-400" />
                  <h3 className="text-sm font-semibold">Recent Deployments</h3>
                </div>
              </div>

              <div className="space-y-3">
                {deploymentHistory && deploymentHistory.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedHistoryDeploy(d);
                      setHistoryModalOpen(true);
                    }}
                    className="p-3 bg-[#131126] border border-[#2b2344]/40 rounded-lg flex items-center justify-between hover:bg-[#1a1733] cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white font-mono">{d.agentName}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{d.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <GitBranch className="size-2.5 text-slate-500" />
                        <span>{d.branch}</span>
                        <span>•</span>
                        <span>{d.commitMsg.slice(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        d.status === 'Success' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {d.status}
                      </span>
                      <span className="text-[9px] text-slate-500">{(d.durationMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- Step 2: Deployment Live Logs Terminal --- */}
      {deployStep === 2 && (
        <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
          {/* Header Panel */}
          <div className="bg-[#131126] border-b border-[#2b2344]/40 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200 font-mono">Building: {selectedRepo?.name}</span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
              <span>Branch: {selectedBranch}</span>
              <span>•</span>
              <span>Exposing port {port}</span>
            </div>
          </div>

          {/* Console Terminal Screen */}
          <div className="flex-1 bg-black p-4 overflow-y-auto font-mono text-xs space-y-1.5 select-text selection:bg-[#7b39fc] selection:text-white">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-4 leading-relaxed animate-in fade-in duration-100">
                <span className="text-slate-600 select-none">{log.time}</span>
                <span className={`font-semibold select-none ${
                  log.level === 'SUCCESS' ? 'text-emerald-400' :
                  log.level === 'ERROR' ? 'text-rose-400' : 'text-[#7b39fc]'
                }`}>
                  {log.level}
                </span>
                <span className={
                  log.level === 'ERROR' ? 'text-rose-200' :
                  log.level === 'SUCCESS' ? 'text-emerald-200' : 'text-slate-300'
                }>
                  {log.msg}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* --- Step 3: Success or Failure Landing Pages --- */}
      {deployStep === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {deployStatus === 'success' ? (
            /* Success Landing screen */
            <div className="bg-[#0d0b17] border border-emerald-500/20 rounded-xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="mx-auto size-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-manrope">Deployment Successful!</h2>
                <p className="text-xs text-slate-400">
                  Your AI Agent container is compiled and running on our secure cluster.
                </p>
              </div>

              {/* Endpoint Link Box */}
              <div className="bg-[#131126] border border-[#2b2344] p-4 rounded-xl max-w-lg mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white font-mono">{activeUrl}</span>
                </div>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#1a1733] hover:bg-[#252044] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>Open URL</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Details table grid */}
              <div className="bg-[#131126]/50 border border-[#2b2344]/40 rounded-xl p-4 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Deployment ID</span>
                  <span className="text-slate-300 mt-1 block">{activeDeployId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Agent Name</span>
                  <span className="text-slate-300 mt-1 block">{activeAgentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Branch</span>
                  <span className="text-slate-300 mt-1 block">{selectedBranch}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Runtime</span>
                  <span className="text-slate-300 mt-1 block">{runtime} ({runtimeVersion})</span>
                </div>
              </div>

              {/* Action Actions row */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-primary hover:bg-[#682ad4] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Go to Overview
                </button>
                <button
                  onClick={() => {
                    setDeployStep(2);
                    handleStartDeployment();
                  }}
                  className="px-4 py-2 bg-[#131126] hover:bg-[#201d3a] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Redeploy Container
                </button>
                <button
                  onClick={() => {
                    setDeployStep(1);
                    setSelectedRepo(null);
                  }}
                  className="px-4 py-2 bg-[#131126] hover:bg-[#201d3a] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Deploy Another Agent
                </button>
              </div>
            </div>
          ) : (
            /* Failure Diagnostic Screen */
            <div className="bg-[#0d0b17] border border-rose-500/20 rounded-xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="mx-auto size-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <AlertCircle className="size-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-manrope">Deployment Failed</h2>
                <p className="text-xs text-rose-400">
                  Build process terminated during package dependency installation.
                </p>
              </div>

              {/* Error Box */}
              <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl max-w-lg mx-auto text-left text-xs font-mono text-rose-200">
                <span className="font-bold block uppercase text-[10px] text-rose-400 tracking-wider mb-1">Diagnostic Output:</span>
                <p>ModuleNotFoundError: No module named 'openai'</p>
                <p className="text-slate-500 mt-2">Suggested fix: add 'openai' dependency to requirements.txt (or package.json) and verify import targets.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setDeployStep(2);
                    handleStartDeployment();
                  }}
                  className="px-4 py-2 bg-primary hover:bg-[#682ad4] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Retry Deployment
                </button>
                <button
                  onClick={() => setDeployStep(1)}
                  className="px-4 py-2 bg-[#131126] hover:bg-[#201d3a] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Modify Settings
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- Deployment History Details Modal --- */}
      {historyModalOpen && selectedHistoryDeploy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
          <div className="bg-[#0d0b17] border border-[#2b2344] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <History className="size-5 text-primary" />
              <h3 className="text-sm font-bold text-white">Deployment Details</h3>
            </div>

            <div className="space-y-3.5 border-t border-[#2b2344]/60 pt-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">ID</span>
                <span className="text-slate-300">{selectedHistoryDeploy.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-300">{selectedHistoryDeploy.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch</span>
                <span className="text-slate-300">{selectedHistoryDeploy.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trigger Date</span>
                <span className="text-slate-300">{new Date(selectedHistoryDeploy.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedHistoryDeploy.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>{selectedHistoryDeploy.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-300">{(selectedHistoryDeploy.durationMs / 1000).toFixed(1)}s</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="w-full py-2 bg-[#131126] hover:bg-[#1f1a3a] border border-[#2b2344] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
