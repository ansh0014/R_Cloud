-- ==========================================================
-- R_Cloud Platform: Supabase PostgreSQL Migration Script
-- Services Managed: project-service, deployment-service, runtime-service
-- ==========================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
-- Stores user projects and GitHub repository associations
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    github_repo_url VARCHAR(500),
    github_repo_name VARCHAR(255),
    github_owner VARCHAR(255),
    default_branch VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 3. Deployments Table
-- Stores builds, releases, and deployment lifecycle states
-- NOTE: All LLM API keys & environment variables are completely OPTIONAL
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    commit_hash VARCHAR(100),
    version VARCHAR(50),
    mode VARCHAR(50) CHECK (mode IS NULL OR mode IN ('monolith', 'microservices')),
    status VARCHAR(50) NOT NULL DEFAULT 'VALIDATING' CHECK (status IN ('VALIDATING', 'DEPLOYING', 'RUNNING', 'FAILED', 'STOPPED', 'DELETED', 'PENDING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);

-- 4. Runtime Registry Table
-- Tracks runtime instances deployed to cloud providers (e.g. Railway)
CREATE TABLE IF NOT EXISTS public.runtime_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
    runtime_url VARCHAR(500),
    provider VARCHAR(100) NOT NULL DEFAULT 'railway',
    railway_project_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'CREATING' CHECK (status IN ('CREATING', 'RUNNING', 'STOPPED', 'RESTARTING', 'DELETED', 'FAILED')),
    health VARCHAR(50) NOT NULL DEFAULT 'STARTING' CHECK (health IN ('STARTING', 'HEALTHY', 'UNHEALTHY', 'UNKNOWN')),
    restart_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_runtime_deployment_id ON public.runtime_registry(deployment_id);

-- 5. Agent Registry Table
-- Tracks deployed individual AI agent endpoints, frameworks, and capabilities
CREATE TABLE IF NOT EXISTS public.agent_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runtime_id UUID NOT NULL REFERENCES public.runtime_registry(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    framework VARCHAR(100),
    version VARCHAR(50),
    capabilities TEXT[],
    agent_url VARCHAR(500),
    railway_service_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_runtime_id ON public.agent_registry(runtime_id);

-- 6. Helper Functions & Automatic Timestamp Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_runtime_registry_updated_at ON public.runtime_registry;
CREATE TRIGGER update_runtime_registry_updated_at 
    BEFORE UPDATE ON public.runtime_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
