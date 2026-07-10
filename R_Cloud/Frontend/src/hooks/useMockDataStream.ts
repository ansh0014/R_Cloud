import { useSyncExternalStore } from 'react';

// --- Type Definitions ---
export type DeploymentState = 
  | 'Created'
  | 'Validating'
  | 'Deploying'
  | 'Running'
  | 'Restarting'
  | 'Stopped'
  | 'Deleted'
  | 'Failed';

export interface Agent {
  id: string;
  name: string;
  project: string;
  status: DeploymentState;
  uptime: number; // in seconds
  restarts: number;
  requestCount: number;
  successCount: number;
  failureCount: number;
  avgLatency: number; // ms
  p95Latency: number; // ms
  lastHealthCheck: string; // ISO string
  healthStatus: 'healthy' | 'unhealthy';
  reportsTokens: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  logs: string[];
}

export interface Trace {
  id: string;
  agentId: string;
  agentName: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  status: number;
  gatewayLatency: number;
  proxyLatency: number;
  containerLatency: number;
  timestamp: string;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  activeTenants: number;
  totalAgents: number;
  totalRequests: number;
}

export interface DashboardState {
  agents: Agent[];
  traces: Trace[];
  systemStats: SystemStats;
  wsConnected: boolean;
  adminControls: {
    isSpikeActive: boolean;
    isFailureActive: boolean;
    isRestartLoopActive: boolean;
  };
}

// --- Initial Mock Data ---
const initialAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Customer-Support-Bot',
    project: 'E-Commerce Platform',
    status: 'Running',
    uptime: 14200,
    restarts: 0,
    requestCount: 8240,
    successCount: 8192,
    failureCount: 48,
    avgLatency: 145,
    p95Latency: 280,
    lastHealthCheck: new Date().toISOString(),
    healthStatus: 'healthy',
    reportsTokens: true,
    promptTokens: 324100,
    completionTokens: 184500,
    totalTokens: 508600,
    logs: [
      '[INFO] 2026-07-08T10:00:00Z - Initialization successful. Agent context loaded.',
      '[INFO] 2026-07-08T10:01:15Z - Connected to LLM provider endpoint.',
      '[INFO] 2026-07-08T10:05:00Z - Health check endpoint /health responding (200 OK).'
    ]
  },
  {
    id: 'agent-2',
    name: 'DevOps-Code-Reviewer',
    project: 'CI/CD Toolchain',
    status: 'Running',
    uptime: 8900,
    restarts: 1,
    requestCount: 420,
    successCount: 418,
    failureCount: 2,
    avgLatency: 520,
    p95Latency: 910,
    lastHealthCheck: new Date().toISOString(),
    healthStatus: 'healthy',
    reportsTokens: false, // reports "Token data not reported by this agent"
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    logs: [
      '[INFO] 2026-07-08T10:10:00Z - Started agent container node.',
      '[WARN] 2026-07-08T10:10:05Z - Config warning: missing REDIS_URL, falling back to in-memory cache.',
      '[INFO] 2026-07-08T10:12:00Z - Webhook receiver active on port 8080.'
    ]
  },
  {
    id: 'agent-3',
    name: 'Market-Research-Agent',
    project: 'Marketing Insights',
    status: 'Deploying',
    uptime: 0,
    restarts: 0,
    requestCount: 0,
    successCount: 0,
    failureCount: 0,
    avgLatency: 0,
    p95Latency: 0,
    lastHealthCheck: new Date(Date.now() - 30000).toISOString(),
    healthStatus: 'unhealthy',
    reportsTokens: true,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    logs: [
      '[INFO] 2026-07-08T10:40:00Z - Build completed. Base image pull successful.',
      '[INFO] 2026-07-08T10:41:20Z - Provisioning container runtime on Railway...'
    ]
  },
  {
    id: 'agent-4',
    name: 'Security-Scanner',
    project: 'Infra Auditing',
    status: 'Failed',
    uptime: 0,
    restarts: 4,
    requestCount: 150,
    successCount: 90,
    failureCount: 60,
    avgLatency: 840,
    p95Latency: 1890,
    lastHealthCheck: new Date().toISOString(),
    healthStatus: 'unhealthy',
    reportsTokens: false,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    logs: [
      '[INFO] 2026-07-08T10:20:00Z - Container startup triggered.',
      '[ERROR] 2026-07-08T10:20:02Z - Fatal: Port 5000 is already in use.',
      '[WARN] 2026-07-08T10:20:05Z - Railway process exited with code 1. Auto-restarting...',
      '[ERROR] 2026-07-08T10:20:07Z - CrashLoopBackOff: Container restarted too many times.'
    ]
  },
  {
    id: 'agent-5',
    name: 'Sales-Outreach-Agent',
    project: 'E-Commerce Platform',
    status: 'Stopped',
    uptime: 0,
    restarts: 0,
    requestCount: 1250,
    successCount: 1245,
    failureCount: 5,
    avgLatency: 110,
    p95Latency: 195,
    lastHealthCheck: new Date(Date.now() - 3600000).toISOString(),
    healthStatus: 'unhealthy',
    reportsTokens: true,
    promptTokens: 42100,
    completionTokens: 31000,
    totalTokens: 73100,
    logs: [
      '[INFO] 2026-07-08T09:00:00Z - Manual stop command received.',
      '[INFO] 2026-07-08T09:00:05Z - Container gracefully shut down.'
    ]
  }
];

const initialTraces: Trace[] = [
  {
    id: 'trace-1',
    agentId: 'agent-1',
    agentName: 'Customer-Support-Bot',
    method: 'POST',
    path: '/execute',
    status: 200,
    gatewayLatency: 12,
    proxyLatency: 5,
    containerLatency: 128,
    timestamp: new Date().toISOString()
  },
  {
    id: 'trace-2',
    agentId: 'agent-2',
    agentName: 'DevOps-Code-Reviewer',
    method: 'POST',
    path: '/review',
    status: 200,
    gatewayLatency: 15,
    proxyLatency: 8,
    containerLatency: 497,
    timestamp: new Date(Date.now() - 5000).toISOString()
  },
  {
    id: 'trace-3',
    agentId: 'agent-4',
    agentName: 'Security-Scanner',
    method: 'GET',
    path: '/scan/status',
    status: 500,
    gatewayLatency: 10,
    proxyLatency: 4,
    containerLatency: 826,
    timestamp: new Date(Date.now() - 10000).toISOString()
  }
];

// --- Persistence Helpers ---
const loadPersistedControls = () => {
  try {
    const controls = localStorage.getItem('r_cloud_admin_controls');
    if (controls) {
      return JSON.parse(controls);
    }
  } catch (e) {}
  return {
    isSpikeActive: false,
    isFailureActive: false,
    isRestartLoopActive: false
  };
};

const loadPersistedWS = () => {
  try {
    const ws = localStorage.getItem('r_cloud_ws_connected');
    if (ws !== null) {
      return ws === 'true';
    }
  } catch (e) {}
  return true;
};

// Sync initial agents statuses with stored controls on boot
const syncInitialState = () => {
  const controls = loadPersistedControls();
  if (controls.isFailureActive) {
    initialAgents[0].status = 'Failed';
    initialAgents[0].healthStatus = 'unhealthy';
    initialAgents[0].logs.push(`[SYSTEM] ${new Date().toISOString()} - Container startup failed due to simulated admin override.`);
  }
  if (controls.isRestartLoopActive) {
    initialAgents[1].status = 'Restarting';
    initialAgents[1].healthStatus = 'unhealthy';
  }
};
syncInitialState();

// --- Global Store State ---
let globalState: DashboardState = {
  agents: initialAgents,
  traces: initialTraces,
  systemStats: {
    cpuUsage: 34,
    memoryUsage: 58,
    activeTenants: 12,
    totalAgents: initialAgents.length,
    totalRequests: 10060
  },
  wsConnected: loadPersistedWS(),
  adminControls: loadPersistedControls()
};

type Listener = () => void;
let listeners: Listener[] = [];

function emit() {
  listeners.forEach((l) => l());
}

// --- Store Exports & Actions ---
export const mockDataStore = {
  getState() {
    return globalState;
  },

  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  updateAgentStatus(agentId: string, status: DeploymentState) {
    globalState = {
      ...globalState,
      agents: globalState.agents.map((a) => {
        if (a.id === agentId) {
          const isRunning = status === 'Running';
          const logs = [...a.logs, `[SYSTEM] ${new Date().toISOString()} - State changed to: ${status}`];
          return {
            ...a,
            status,
            uptime: isRunning ? 1 : 0,
            healthStatus: isRunning ? 'healthy' : 'unhealthy',
            logs
          };
        }
        return a;
      })
    };
    emit();
  },

  triggerRedeploy(agentId: string) {
    const agent = globalState.agents.find((a) => a.id === agentId);
    if (!agent) return;

    this.updateAgentStatus(agentId, 'Created');
    
    // Simulate progression steps
    setTimeout(() => this.updateAgentStatus(agentId, 'Validating'), 2000);
    setTimeout(() => this.updateAgentStatus(agentId, 'Deploying'), 5000);
    setTimeout(() => this.updateAgentStatus(agentId, 'Running'), 9000);
  },

  triggerStop(agentId: string) {
    this.updateAgentStatus(agentId, 'Stopped');
  },

  updateAdminControls(controls: Partial<DashboardState['adminControls']>) {
    const nextControls = {
      ...globalState.adminControls,
      ...controls
    };

    globalState = {
      ...globalState,
      adminControls: nextControls
    };
    
    try {
      localStorage.setItem('r_cloud_admin_controls', JSON.stringify(nextControls));
    } catch (e) {}

    // React immediately to controls changes
    if (controls.isFailureActive) {
      this.updateAgentStatus('agent-1', 'Failed');
    } else if (controls.isFailureActive === false) {
      this.updateAgentStatus('agent-1', 'Running');
    }

    if (controls.isRestartLoopActive) {
      this.updateAgentStatus('agent-2', 'Restarting');
    } else if (controls.isRestartLoopActive === false) {
      this.updateAgentStatus('agent-2', 'Running');
    }

    emit();
  },

  addLogLine(agentId: string, line: string) {
    globalState = {
      ...globalState,
      agents: globalState.agents.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            logs: [...a.logs.slice(-199), line] // keep last 200 logs max
          };
        }
        return a;
      })
    };
    emit();
  },

  toggleWS() {
    const nextWS = !globalState.wsConnected;
    globalState = {
      ...globalState,
      wsConnected: nextWS
    };
    try {
      localStorage.setItem('r_cloud_ws_connected', String(nextWS));
    } catch (e) {}
    emit();
  }
};

// --- Background Data Simulation Engine ---
setInterval(() => {
  if (!globalState.wsConnected) return;

  const timestamp = new Date().toISOString();
  const nextAgents = globalState.agents.map((agent) => {
    if (agent.status !== 'Running') {
      // Handle active deployment lifecycle transitions or error states
      if (agent.id === 'agent-3' && Math.random() < 0.1) {
        // Deploying -> Running
        return {
          ...agent,
          status: 'Running' as DeploymentState,
          uptime: 1,
          healthStatus: 'healthy' as const,
          lastHealthCheck: timestamp,
          logs: [...agent.logs, `[INFO] ${timestamp} - Port binding established. Container successfully running.`]
        };
      }
      return agent;
    }

    // Dynamic metrics fluctuation for RUNNING agents
    let trafficMultiplier = 1;
    let latencyMultiplier = 1;
    let failureRate = 0.01;

    if (globalState.adminControls.isSpikeActive) {
      trafficMultiplier = 5;
      latencyMultiplier = 2.5;
      failureRate = 0.08;
    }

    // Tick uptime
    const nextUptime = agent.uptime + 2;

    // Simulate incoming request events
    const hasRequest = Math.random() < (0.4 * trafficMultiplier);
    let newReqs = 0;
    let newSuccess = 0;
    let newFailure = 0;
    let nextAvgLat = agent.avgLatency;
    let nextP95Lat = agent.p95Latency;
    let promptToks = agent.promptTokens;
    let compToks = agent.completionTokens;
    let totToks = agent.totalTokens;
    const addedLogs: string[] = [];

    if (hasRequest) {
      newReqs = Math.floor(Math.random() * 3 * trafficMultiplier) + 1;
      for (let i = 0; i < newReqs; i++) {
        const isFailed = Math.random() < failureRate;
        if (isFailed) {
          newFailure++;
          addedLogs.push(`[ERROR] ${new Date().toISOString()} - Internal server error on POST /execute - Timeout calling model service`);
        } else {
          newSuccess++;
          addedLogs.push(`[INFO] ${new Date().toISOString()} - POST /execute 200 OK - Handled request successfully.`);
          
          // Generate simulated token costs
          if (agent.reportsTokens) {
            const promptInc = Math.floor(Math.random() * 150) + 50;
            const compInc = Math.floor(Math.random() * 100) + 20;
            promptToks += promptInc;
            compToks += compInc;
            totToks += (promptInc + compInc);
          }
        }
      }

      // Latency jitter
      const baseLat = agent.id === 'agent-2' ? 500 : 130;
      const jitter = Math.floor(Math.random() * 60) - 30;
      nextAvgLat = Math.max(50, Math.floor((agent.avgLatency * 0.9) + ((baseLat + jitter) * latencyMultiplier * 0.1)));
      nextP95Lat = Math.max(nextAvgLat, Math.floor((agent.p95Latency * 0.95) + ((baseLat * 1.8 + jitter) * latencyMultiplier * 0.05)));
    }

    // Occasionally write routine logs even without requests
    if (!hasRequest && Math.random() < 0.2) {
      addedLogs.push(`[INFO] ${timestamp} - Health check check-in: System OK. Node status: active.`);
    }

    // Health check tick
    const needsHealthCheck = Math.random() < 0.1;
    const lastCheck = needsHealthCheck ? timestamp : agent.lastHealthCheck;

    return {
      ...agent,
      uptime: nextUptime,
      requestCount: agent.requestCount + newReqs,
      successCount: agent.successCount + newSuccess,
      failureCount: agent.failureCount + newFailure,
      avgLatency: nextAvgLat,
      p95Latency: nextP95Lat,
      promptTokens: promptToks,
      completionTokens: compToks,
      totalTokens: totToks,
      lastHealthCheck: lastCheck,
      logs: [...agent.logs, ...addedLogs].slice(-200)
    };
  });

  // Generate trace stream
  let nextTraces = [...globalState.traces];
  const runningAgents = nextAgents.filter(a => a.status === 'Running');
  if (runningAgents.length > 0 && Math.random() < 0.3) {
    const target = runningAgents[Math.floor(Math.random() * runningAgents.length)];
    const isError = Math.random() < (target.id === 'agent-4' ? 0.4 : 0.02);
    const traceId = `trace-${Math.floor(Math.random() * 90000) + 10000}`;
    const newTrace: Trace = {
      id: traceId,
      agentId: target.id,
      agentName: target.name,
      method: 'POST',
      path: target.id === 'agent-2' ? '/review' : '/execute',
      status: isError ? 500 : 200,
      gatewayLatency: Math.floor(Math.random() * 8) + 4,
      proxyLatency: Math.floor(Math.random() * 5) + 2,
      containerLatency: Math.floor(target.avgLatency * (isError ? 1.5 : 1) * (Math.random() * 0.4 + 0.8)),
      timestamp
    };
    nextTraces = [newTrace, ...nextTraces].slice(0, 50); // limit to 50 items
  }

  // System stats oscillation
  let cpu = globalState.systemStats.cpuUsage;
  let mem = globalState.systemStats.memoryUsage;

  if (globalState.adminControls.isSpikeActive) {
    cpu = Math.min(99, Math.floor(82 + Math.random() * 10));
    mem = Math.min(99, Math.floor(75 + Math.random() * 5));
  } else {
    cpu = Math.max(10, Math.floor(30 + Math.random() * 12 - 6));
    mem = Math.max(10, Math.floor(55 + Math.random() * 4 - 2));
  }

  // Update overall counts
  const totalRequests = nextAgents.reduce((sum, a) => sum + a.requestCount, 0);

  globalState = {
    ...globalState,
    agents: nextAgents,
    traces: nextTraces,
    systemStats: {
      ...globalState.systemStats,
      cpuUsage: cpu,
      memoryUsage: mem,
      totalRequests
    }
  };

  emit();
}, 2000);

// --- Custom React Hook ---
export function useMockDataStream() {
  return useSyncExternalStore(mockDataStore.subscribe, mockDataStore.getState);
}
