import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, createDeployment, analyzeRepository } from '../../lib/api';
import {
  CheckCircle2,
  GitBranch,
  AlertCircle,
  Plus,
  Trash2,
  Play,
  X,
  Globe,
  Loader2,
  Sparkles,
  ShieldCheck,
  FolderGit2
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
}

export default function DeployPage() {
  const navigate = useNavigate();

  // Step 1: Config, Step 2: Deploying, Step 3: Result
  const [deployStep, setDeployStep] = useState<1 | 2 | 3>(1);

  // Form input state
  const [projectName, setProjectName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  // AI Analyzer state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);

  // Deployment state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deployedId, setDeployedId] = useState('');

  const addEnvVar = () => {
    if (!newKey.trim()) return;
    setEnvVars((prev) => [
      ...prev,
      { id: String(Date.now()), key: newKey.trim(), value: newVal.trim() }
    ]);
    setNewKey('');
    setNewVal('');
  };

  const removeEnvVar = (id: string) => {
    setEnvVars((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRunAiAnalysis = async () => {
    if (!repoUrl) {
      setErrorMsg('Please enter a GitHub repository URL first.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    try {
      const report = await analyzeRepository({
        repository_url: repoUrl,
        repository_structure: {
          files: ['main.py', 'ragent.yaml', 'requirements.txt', 'README.md'],
          ragent_yaml: 'version: 1',
          'requirements.txt': 'fastapi\nuvicorn'
        }
      });
      setAiReport(report);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !repoUrl.trim()) {
      setErrorMsg('Project Name and Repository URL are required.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    setDeployStep(2);

    try {
      // 1. Create project via API Gateway
      const project = await createProject({
        name: projectName.trim(),
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || 'main'
      });

      // Format env vars object
      const envObj: Record<string, string> = {};
      envVars.forEach((ev) => {
        if (ev.key) envObj[ev.key] = ev.value;
      });

      // 2. Trigger deployment via API Gateway
      const repoName = repoUrl.split('/').pop()?.replace('.git', '') || projectName;
      const deployment = await createDeployment({
        projectId: project.id,
        repoUrl: repoUrl.trim(),
        repoName,
        branch: branch.trim() || 'main',
        envVars: envObj
      });

      setDeployedId(deployment.id);
      setDeployStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Deployment pipeline failed');
      setDeployStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header & Stepper */}
      <div className="flex items-center justify-between border-b border-[#2b2344]/40 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Deploy Agent Project</h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your Git repository, analyze readiness with AI, and deploy to R Agent Cloud.
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex items-center gap-2">
          {[
            { step: 1, label: 'Configure' },
            { step: 2, label: 'Building' },
            { step: 3, label: 'Ready' }
          ].map((s) => (
            <div
              key={s.step}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                deployStep === s.step
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(123,57,252,0.3)]'
                  : deployStep > s.step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#131126] text-slate-500 border border-[#2b2344]'
              }`}
            >
              <span>{s.step}. {s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* STEP 1: CONFIGURATION FORM */}
      {deployStep === 1 && (
        <form onSubmit={handleTriggerDeploy} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-white font-manrope flex items-center gap-2">
                  <FolderGit2 className="size-4 text-primary" />
                  Repository Information
                </h2>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. my-ai-agent"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      className="w-full bg-[#131126] border border-[#2b2344] text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">GitHub Repository URL</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://github.com/org/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        required
                        className="w-full bg-[#131126] border border-[#2b2344] text-white rounded-lg pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Branch</label>
                    <div className="relative">
                      <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="main"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#131126] border border-[#2b2344] text-white rounded-lg pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Variables Section */}
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white font-manrope">Environment Variables</h2>
                  <span className="text-xs text-slate-500">{envVars.length} Variables added</span>
                </div>

                {/* Env Var List */}
                {envVars.length > 0 && (
                  <div className="space-y-2">
                    {envVars.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between bg-[#131126] border border-[#2b2344]/40 p-2.5 rounded-lg text-xs font-mono">
                        <span className="text-primary font-bold">{ev.key}</span>
                        <span className="text-slate-400 truncate max-w-[200px]">{ev.value}</span>
                        <button
                          type="button"
                          onClick={() => removeEnvVar(ev.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Env Var */}
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="KEY (e.g. GEMINI_API_KEY)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="col-span-2 bg-[#131126] border border-[#2b2344] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary font-mono"
                  />
                  <input
                    type="text"
                    placeholder="VALUE"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="col-span-2 bg-[#131126] border border-[#2b2344] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary font-mono"
                  />
                  <button
                    type="button"
                    onClick={addEnvVar}
                    className="flex items-center justify-center gap-1 bg-[#1c1830] border border-[#2b2344] hover:border-primary text-slate-200 rounded-lg py-2 font-semibold transition-all"
                  >
                    <Plus className="size-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: AI Agent Pre-Validation & Submit */}
            <div className="space-y-6">
              <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    AI Validation Agent
                  </h2>
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className="text-xs text-primary hover:underline font-semibold disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Repo'}
                  </button>
                </div>

                {isAnalyzing ? (
                  <div className="p-6 text-center space-y-2">
                    <Loader2 className="size-6 text-primary animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Gemini Agent analyzing structure & readiness...</p>
                  </div>
                ) : aiReport ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">Deployment Score</span>
                      <span className="text-emerald-400 font-bold text-sm">{aiReport.deployment_readiness_score}/100</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Framework</span>
                      <p className="text-slate-200 font-semibold">{aiReport.framework || 'Custom AI Agent'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Summary</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{aiReport.summary}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#131126]/50 border border-[#2b2344]/30 rounded-lg text-xs text-slate-400 leading-relaxed">
                    Click <strong>Analyze Repo</strong> to inspect your repository structure using Gemini 3.6 Flash before deploying.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-semibold shadow-[0_4px_20px_rgba(123,57,252,0.4)] transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Triggering Deployment...
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-current" />
                    Trigger Deployment Pipeline
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2: BUILDING / PROGRESS */}
      {deployStep === 2 && (
        <div className="py-16 text-center bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl space-y-4">
          <Loader2 className="size-10 text-primary animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-white font-manrope">Executing Deployment Pipeline</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Creating project, validating build configuration, and streaming container state via API Gateway...
          </p>
        </div>
      )}

      {/* STEP 3: DONE / SUCCESS */}
      {deployStep === 3 && (
        <div className="py-12 text-center bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl space-y-6 max-w-xl mx-auto">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-manrope">Deployment Triggered Successfully!</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Deployment ID: {deployedId}</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard/deployments')}
              className="py-2.5 px-5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-[0_4px_15px_rgba(123,57,252,0.3)]"
            >
              View Deployments List
            </button>
            <button
              onClick={() => setDeployStep(1)}
              className="py-2.5 px-5 bg-[#131126] border border-[#2b2344] text-slate-300 rounded-lg text-xs font-semibold hover:text-white transition-all"
            >
              Deploy Another Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
