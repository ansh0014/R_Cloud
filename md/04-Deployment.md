# Deployment Architecture

> End-to-end deployment lifecycle of AI applications in R Agent Cloud.

---

# Overview

The Deployment Service is responsible for transforming an AI project stored in GitHub into a production-ready cloud application.

The deployment process consists of:

- Repository Validation
- AI Project Validation
- Runtime Preparation
- Cloud Deployment
- Runtime Registration
- Health Verification
- Agent Registration

The Runtime Service abstracts the cloud provider, allowing deployments to Railway today and other providers in the future.

---

# High Level Deployment Flow

```text
              Developer
                  │
                  ▼
           Push Repository
                  │
                  ▼
               GitHub
                  │
                  ▼
        Deployment Service
                  │
        AI Project Validation
                  │
                  ▼
          Runtime Service
                  │
                  ▼
             Railway API
                  │
                  ▼
        Running AI Application
                  │
                  ▼
          Health Verification
                  │
                  ▼
          Runtime Registry
                  │
                  ▼
          AgentOps Dashboard
```

---

# Deployment Lifecycle

```text
Repository Created

↓

GitHub Push

↓

Validation

↓

Deployment

↓

Runtime Started

↓

Health Check

↓

Runtime Registered

↓

Running

↓

Monitoring
```

---

# Step 1 — GitHub Repository

Developer pushes an AI project.

Example

```text
customer-support-agent/

├── app.py
├── ragent.yaml
├── requirements.txt
├── agents/
├── prompts/
└── tools/
```

---

# Step 2 — GitHub Webhook

GitHub sends an event to the Deployment Service.

```text
GitHub

↓

Deployment Service
```

The Deployment Service clones the repository.

---

# Step 3 — AI Project Validation

The repository is validated before deployment.

Validation includes:

- Repository structure
- `ragent.yaml`
- Entrypoint
- Required runtime endpoints
- Python version
- Runtime configuration
- Environment variables
- Dependency files

Example

```text
Repository

↓

Validation

↓

Passed

↓

Deployment
```

If validation fails

```text
Repository

↓

Validation

↓

Deployment Rejected
```

Example response

```json
{
  "status":"FAILED",
  "errors":[
    "Missing ragent.yaml",
    "Missing /health endpoint"
  ]
}
```

---

# Step 4 — Runtime Preparation

Deployment Service creates a deployment request.

Example

```json
{
  "deploymentId":"dep_123",
  "repository":"customer-support-agent",
  "branch":"main",
  "version":"1.0.0"
}
```

This request is sent to the Runtime Service.

---

# Step 5 — Runtime Service

The Runtime Service is responsible for infrastructure.

Responsibilities

- Build runtime
- Configure environment
- Deploy application
- Monitor deployment
- Register runtime
- Restart runtime
- Delete runtime

The Runtime Service does not execute AI logic.

---

# Step 6 — Railway Deployment

Runtime Service deploys the repository.

```text
Repository

↓

Build

↓

Railway

↓

Running Application
```

Future providers

- Railway
- Render
- Kubernetes
- AWS ECS

The Deployment Service never changes.

Only the Runtime Service changes.

---

# Step 7 — Runtime Health Verification

The Runtime Service verifies the deployment.

```
GET /health
```

Possible states

```text
Healthy

Starting

Unhealthy

Stopped
```

If unhealthy

```
Restart Runtime
```

---

# Step 8 — Runtime Registration

Every deployment is registered.

Example

```text
Deployment ID

Runtime URL

Public URL

Cloud Provider

Status

Version

Health

Created At
```

---

# Step 9 — Agent Registration

The platform stores metadata returned from

```
GET /metadata
```

Example

```json
{
  "name":"Customer Support",
  "framework":"LangGraph",
  "version":"1.0.0",
  "capabilities":[
      "chat",
      "rag"
  ]
}
```

Stored information

- Agent Name
- Framework
- Version
- Runtime
- Deployment
- Capabilities

---

# Public Endpoint

Every deployment receives a unique endpoint.

Example

```
https://api.ragent.cloud/deployments/dep_123
```

Internally

```text
Gateway

↓

Lookup Runtime

↓

Runtime URL

↓

POST /execute
```

---

# Runtime Contract

Every deployed AI application exposes

```
POST /execute

POST /stream

GET /health

GET /metadata
```

This allows every deployment to be managed uniformly.

---

# Deployment States

```text
Created

↓

Validating

↓

Deploying

↓

Running

↓

Restarting

↓

Stopped

↓

Deleted

↓

Failed
```

---

# Runtime Operations

Supported operations

- Deploy
- Restart
- Stop
- Delete
- Redeploy
- Check Health

Future

- Rollback
- Auto Scaling

---

# Version Management

Every deployment creates a version.

Example

```text
v1.0

↓

v1.1

↓

v1.2
```

Future

```text
v1.2

↓

Rollback

↓

v1.1
```

---

# A2A (Agent-to-Agent) Deployment

A single deployment can contain multiple collaborating agents.

Example

```text
Repository

↓

Planner Agent

↓

Research Agent

↓

Reviewer Agent

↓

Final Response
```

The platform deploys the complete workflow as one application.

The client only interacts with

```
POST /execute
```

The internal agent communication is managed by the application itself.

---

# Failure Handling

Deployment failures include

- Validation Failed
- Missing Configuration
- Build Failed
- Railway Deployment Failed
- Runtime Failed
- Health Check Failed

Every failure is recorded in the Deployment History.

---

# Deployment History

Every deployment stores

```text
Deployment ID

Repository

Branch

Commit Hash

Version

Status

Created At

Completed At

Cloud Provider
```

---

# Integration with AgentOps

Deployment events are published during the lifecycle.

Example events

```text
deployment.created

deployment.started

deployment.completed

runtime.started

runtime.failed

runtime.restarted

health.failed
```

These events are consumed by the AgentOps service to build deployment history, runtime status, uptime statistics, and operational dashboards.

---

# Future Scope

- Blue-Green Deployment
- Canary Deployment
- Multi-Cloud Deployment
- Zero Downtime Updates
- Automatic Rollback
- Kubernetes Support
- Auto Scaling
- Scheduled Deployments