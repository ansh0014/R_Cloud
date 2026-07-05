

CREATE TABLE IF NOT EXISTS runtime_registry (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id       UUID         NOT NULL, -- Foreign reference to deployments(id)
    runtime_url         VARCHAR(500) NOT NULL,
    provider            VARCHAR(100) NOT NULL DEFAULT 'railway',
    railway_project_id  VARCHAR(100),
    status              VARCHAR(50)  NOT NULL DEFAULT 'STARTING'
                                     CHECK (status IN ('STARTING', 'RUNNING', 'STOPPED', 'FAILED', 'DELETED')),
    health              VARCHAR(50)  NOT NULL DEFAULT 'STARTING'
                                     CHECK (health IN ('STARTING', 'HEALTHY', 'UNHEALTHY', 'STOPPED')),
    restart_count       INT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_runtime_registry_deployment_id ON runtime_registry(deployment_id);
CREATE INDEX IF NOT EXISTS idx_runtime_registry_status        ON runtime_registry(status);


CREATE TABLE IF NOT EXISTS agent_registry (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    runtime_id         UUID         NOT NULL REFERENCES runtime_registry(id) ON DELETE CASCADE,
    name               VARCHAR(255) NOT NULL,
    framework          VARCHAR(100),
    version            VARCHAR(50),
    capabilities       VARCHAR(100)[],
    agent_url          VARCHAR(500),
    railway_service_id VARCHAR(100),
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_registry_runtime_id ON agent_registry(runtime_id);
