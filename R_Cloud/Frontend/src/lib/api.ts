// ============================================================
// R Agent Cloud — Real API Gateway Client Integration
// Connects Frontend directly to API Gateway (:8080) & AI Agent (:8087)
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';
const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL || 'http://localhost:8087';

const SESSION_KEY = 'r_cloud_user';

/**
 * Returns base headers for API Gateway requests.
 * Uses the authenticated user's google_subject as X-User-ID.
 * If no session exists the header is omitted → API Gateway returns 401.
 */
function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const storedUser = localStorage.getItem(SESSION_KEY);
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      // Use google_subject (the stable Google identity string) as the user identifier.
      // The API Gateway dev-bypass reads X-User-ID and threads it through all services.
      const userId = parsed.google_subject || String(parsed.id || '');
      if (userId) {
        headers['X-User-ID'] = userId;
      }
    } catch (_) {}
  }

  return headers;
}


// --- Project API ---
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  githubRepoUrl: string;
  githubRepoName: string;
  githubOwner: string;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  repoUrl?: string;
  branch?: string;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to create project');
  }
  return json.data;
}

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'GET',
    headers: getHeaders()
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    return [];
  }
  return json.data || [];
}

// --- Deployment API ---
export interface Deployment {
  id: string;
  projectId: string;
  userId: string;
  branch: string;
  commitHash: string;
  version: string;
  mode: string;
  status: 'VALIDATING' | 'DEPLOYING' | 'RUNNING' | 'FAILED' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
}

export interface CreateDeploymentPayload {
  projectId: string;
  repoUrl: string;
  repoName: string;
  branch: string;
  envVars: Record<string, string>;
}

export async function createDeployment(payload: CreateDeploymentPayload): Promise<Deployment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/deployments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Deployment failed');
  }
  return json.data;
}

export async function listDeployments(projectId: string): Promise<Deployment[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/deployments`, {
    method: 'GET',
    headers: getHeaders()
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    return [];
  }
  return json.data || [];
}

// --- AI Validation Agent API ---
export interface AIAnalysisReport {
  framework: string;
  primary_purpose: string;
  deployment_readiness_score: number;
  security_score: number;
  documentation_score: number;
  security: {
    issues: string[];
    missing_env_vars: string[];
  };
  best_practices: {
    recommendations: string[];
  };
  summary: string;
}

export interface AnalyzeRepoPayload {
  repository_url: string;
  repository_structure: {
    files: string[];
    ragent_yaml?: string;
    requirements_txt?: string;
    package_json?: string;
  };
  validation_errors?: string[];
}

export async function analyzeRepository(payload: AnalyzeRepoPayload): Promise<AIAnalysisReport> {
  const response = await fetch(`${AI_AGENT_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.detail?.message || 'AI analysis request failed');
  }

  const json = await response.json();
  return json.ai_analysis;
}

