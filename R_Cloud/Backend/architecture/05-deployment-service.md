# 05 — Deployment Service

> Orchestrates the full deployment lifecycle of AI applications.

---

# Overview

The Deployment Service is responsible for transforming an AI project from a GitHub repository into a running cloud application.

It does not execute AI logic.

It does not communicate with Railway directly.

It delegates infrastructure operations to the Runtime Service via gRPC.

---

# Responsibilities

- Receive deploy requests from API Gateway
- Clone GitHub repository
- Pass repository to Validation Service
- Parse ragent.yaml to determine deployment mode
- Build deployment plan
- Call Runtime Service via gRPC to provision infrastructure
- Store deployment history in PostgreSQL
- Publish deployment events to NATS
- Version management

---

# Folder Structure

```
Backend/deployment/
├── handler/
│   └── deploy.go              ← handle deploy request, write to DB
├── validator/
│   └── ragent_validator.go    ← clone repo, read + validate ragent.yaml
├── github/
│   └── github.go              ← GitHub API (clone, branch, commit info)
└── version/
    └── version.go             ← version management per deployment
```

---

# Deployment Flow

```text
POST /api/v1/deployments
         │
         ▼
Deployment Service
  1. Write to DB: status = "VALIDATING"
  2. Clone GitHub repo
  3. Send to Validation Service
  4. Parse ragent.yaml: mode, agents, entrypoints
  5. Build deployment plan
  6. Write to DB: status = "DEPLOYING"
  7. gRPC → Runtime Service: CreateRuntime(...)
  8. Runtime Service responds: runtimeId, runtimeUrl, status
  9. Write to DB: status = "RUNNING"
  10. Publish NATS: deployment.completed
```

---

# ragent.yaml Parsing

The Deployment Service reads ragent.yaml to determine deployment mode.

Monolith example:

```yaml
application:
  name: support-system
  mode: monolith
  entrypoint: app.py

routes:
  execute: /execute
  health: /health
  metadata: /metadata
```

Microservices example:

```yaml
application:
  name: support-system
  mode: microservices

agents:
  - id: planner
    entrypoint: planner.py
  - id: researcher
    entrypoint: researcher.py

workflow:
  planner: [researcher]

routes:
  execute: /execute
  health: /health
  metadata: /metadata
```

If mode is `monolith`: send one deploy instruction to Runtime Service.

If mode is `microservices`: loop over each agent, send one deploy instruction per agent.

---

# gRPC Call to Runtime Service

```
INPUT (CreateRuntimeRequest):
{
  deploymentId:  "dep_123",
  repoUrl:       "https://github.com/user/customer-support",
  branch:        "main",
  mode:          "microservices",
  agents: [
    { id: "planner",    entrypoint: "planner.py" },
    { id: "researcher", entrypoint: "researcher.py" }
  ],
  envVars: {
    "OPENAI_API_KEY": "sk-...",
  }
}

OUTPUT (CreateRuntimeResponse):
{
  runtimeId:  "rtm_456",
  runtimeUrl: "https://customer-support.up.railway.app",
  status:     "RUNNING"
}
```

---

# Database

Tables in Platform PostgreSQL:

```
deployments
  id
  project_id
  user_id
  branch
  commit_hash
  version
  status                 ← VALIDATING | DEPLOYING | RUNNING | FAILED | STOPPED | DELETED
  mode                   ← monolith | microservices
  created_at
  completed_at

deployment_versions
  id
  deployment_id
  version
  commit_hash
  created_at
```

---

# Deployment States

```text
Created → Validating → Deploying → Running → Restarting → Stopped → Deleted → Failed
```

---

# NATS Events Published

| Event | When |
|---|---|
| `deployment.created` | When deploy request received |
| `deployment.completed` | When runtime is running and healthy |
| `deployment.failed` | When any step fails |

---

# Version Management

Every deployment creates a version record.

Current deployment = latest version.

Future: rollback to previous version.

---

# Failure Handling

Every failure is recorded in the deployments table with status = "FAILED".

Possible failures:

- Validation failed (ragent.yaml missing, invalid mode, missing entrypoints)
- GitHub clone failed
- gRPC to Runtime Service failed
- Railway deployment failed
- Health check failed after deploy
