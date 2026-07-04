
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    github_repo_url VARCHAR(500),
    github_repo_name VARCHAR(255),
    github_owner VARCHAR(255),
    default_branch VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    branch VARCHAR(100) NOT NULL,
    commit_hash VARCHAR(100),
    version VARCHAR(50),
    mode VARCHAR(50) NOT NULL, -- 'monolith' or 'microservices'
    status VARCHAR(50) NOT NULL, -- 'VALIDATING', 'DEPLOYING', 'RUNNING', 'FAILED', 'STOPPED', 'DELETED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS runtime_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    provider VARCHAR(100) DEFAULT 'railway',
    railway_project_id VARCHAR(100),
    status VARCHAR(50) NOT NULL, 
    health VARCHAR(50) NOT NULL, 
    restart_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runtime_id UUID NOT NULL REFERENCES runtime_registry(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    framework VARCHAR(100),
    version VARCHAR(50),
    capabilities VARCHAR(100)[],
    agent_url VARCHAR(500),
    railway_service_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

