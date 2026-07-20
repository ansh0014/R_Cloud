CREATE TABLE IF NOT EXISTS projects (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    github_repo_url  VARCHAR(500),
    github_repo_name VARCHAR(255),
    github_owner     VARCHAR(255),
    default_branch   VARCHAR(100),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);


CREATE TABLE IF NOT EXISTS deployments (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id       UUID         NOT NULL,
    branch        VARCHAR(100) NOT NULL,
    commit_hash   VARCHAR(100),
    version       VARCHAR(50),
    mode          VARCHAR(50)  NOT NULL CHECK (mode IN ('monolith', 'microservices')),
    status        VARCHAR(50)  NOT NULL DEFAULT 'VALIDATING'
                               CHECK (status IN ('PENDING', 'VALIDATING', 'PLANNING', 'DEPLOYING', 'RUNNING', 'FAILED', 'STOPPED', 'DELETED')),
    error_message TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id    ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status     ON deployments(status);
