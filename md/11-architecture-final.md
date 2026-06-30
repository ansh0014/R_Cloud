# R Agent Cloud — Final Architecture & Team Guide

> Complete reference for team structure, folder layout, gRPC connection, and E2E deployment + execution flow.

---

# Team Overview

R Agent Cloud is built by two independent teams.

| Team | Language | Owns |
|---|---|---|
| Platform Team | Go | API Gateway, Deployment Service, Runtime Service, AgentOps, Auth, Webhook, DB, DevOps |
| AI Runtime Team | Python or TypeScript | Execution Engine, Workflow, A2A, Runtime Contract |

---

# Team Boundary — One Rule

```text
Platform Team never implements AI workflows.

AI Runtime Team never manages deployment infrastructure.
```

The only interface between both teams:

| Contract | Platform Team | AI Runtime Team |
|---|---|---|
| `ragent.yaml` | Validates during deploy | Reads at runtime |
| `GET /health` | Calls every 30s | Must implement |
| `GET /metadata` | Stores in Agent Registry | Must implement |
| `POST /execute` | Proxies user request | Must implement |
| `POST /stream` | Proxies user stream | Must implement |

---

# Language Decisions

| Service | Language | Reason |
|---|---|---|
| API Gateway | Go | Platform core |
| Deployment Service | Go | Platform core |
| Runtime Service | Go | Platform core |
| AgentOps Service | Go | Platform core |
| Auth Service | Go | Platform core |
| Webhook Service | Go | Platform core |
| AI Runtime Engine | Python or TypeScript | AI Team's choice |

---

# Shared Proto — Root Level Contract

The `runtime.proto` file is the gRPC contract between the Deployment Service (Go) and the Runtime Service (TypeScript).

It belongs to **neither team**. It lives at the project root so both teams generate code from the same source of truth.

```
R_Cloud/
│
├── proto/
│   └── runtime.proto              ← single source of truth for gRPC contract
│                                    agreed upon by both teams before implementation
│                                    changing this file requires coordinated update on both sides
│
├── Backend/                       ← Platform Team (Go)
│   └── generated/
│       └── runtime/
│           ├── runtime.pb.go      ← auto-generated: protobuf message structs
│           └── runtime_grpc.pb.go ← auto-generated: gRPC client + server interfaces
│
└── Ai-Agent/
    └── runtime-service/           ← Platform Team's gRPC server (TypeScript)
        └── src/
            └── generated/
                ├── runtime_pb.ts      ← auto-generated: protobuf message types
                └── runtime_grpc_pb.ts ← auto-generated: gRPC server stub
```

## How to Generate

Backend (Go):
```bash
protoc --go_out=./Backend/generated --go-grpc_out=./Backend/generated ./proto/runtime.proto
```

Ai-Agent runtime-service (TypeScript):
```bash
protoc --ts_out=./Ai-Agent/runtime-service/src/generated ./proto/runtime.proto
```

## Rule

Neither team edits files inside `generated/`.
They only edit `proto/runtime.proto` and regenerate.
Generated folders are added to `.gitignore` or committed — team decides.

---

# Platform Team — Complete Folder Structure (Go)

```
Backend/
│
├── configs/
│   └── config.go                      ← all env vars (DB_URL, NATS_URL, RAILWAY_TOKEN, JWT_SECRET...)
│
├── db/
│   ├── postgresql/
│   │   └── postgresql.go              ← DB connection + pool
│   ├── redis/
│   │   └── redis.go                   ← Redis client
│   └── schema/
│       ├── auth.sql                   ← users, tokens, api_keys tables
│       └── runtime.sql                ← runtimes, deployments, agents tables
│
├── generated/                         ← auto-generated from R_Cloud/proto/runtime.proto
│   └── runtime/
│       ├── runtime.pb.go              ← protobuf message structs (DO NOT EDIT)
│       └── runtime_grpc.pb.go         ← gRPC client + server interfaces (DO NOT EDIT)
│
├── grpc/
│   ├── server.go                      ← gRPC server bootstrap (Runtime Service)
│   ├── client.go                      ← gRPC client (Deployment Service calls Runtime)
│   └── interceptors/
│       ├── auth.go                    ← validate internal service calls
│       ├── logger.go                  ← log every gRPC call
│       └── error.go                   ← catch unhandled errors → proper gRPC status
│
├── api-gateway/
│   ├── router/
│   │   └── router.go                  ← register all REST routes
│   ├── middleware/
│   │   └── middleware.go              ← JWT auth, rate limiting, CORS
│   ├── handlers/
│   │   └── handler.go                 ← route requests to correct service
│   └── proxy/
│       └── proxy.go                   ← proxy /execute requests to Railway runtime URL
│
├── auth-service/
│   ├── config/
│   │   └── config.go
│   ├── handler/
│   │   └── handler.go                 ← login, register, refresh, logout
│   ├── middleware/
│   │   └── middleware.go              ← JWT validation
│   ├── models/
│   │   └── models.go                  ← User, Token structs
│   └── routes/
│       └── routes.go
│
├── webhook/
│   └── github_webhook.go              ← receive GitHub push events → trigger deployment
│
├── deployment/
│   ├── handler/
│   │   └── deploy.go                  ← handle deploy request, store to DB
│   ├── validator/
│   │   └── ragent_validator.go        ← clone repo, read + validate ragent.yaml
│   ├── github/
│   │   └── github.go                  ← GitHub API (clone, branch, commit info)
│   └── version/
│       └── version.go                 ← version management per deployment
│
├── runtime/
│   ├── handler/
│   │   ├── create_runtime.go          ← gRPC: deploy AI app to Railway
│   │   ├── restart_runtime.go         ← gRPC: restart a running runtime
│   │   ├── stop_runtime.go            ← gRPC: pause a runtime
│   │   ├── delete_runtime.go          ← gRPC: permanently destroy a runtime
│   │   └── get_status.go             ← gRPC: query current runtime state
│   ├── provisioner/
│   │   ├── monolith.go               ← deploy single Railway container
│   │   └── microservices.go          ← deploy one container per agent in ragent.yaml
│   ├── health/
│   │   ├── checker.go                ← ping GET /health on a single runtime URL
│   │   ├── scheduler.go              ← every 30s check all active runtimes
│   │   └── restart_manager.go        ← auto-restart unhealthy runtimes
│   ├── registry/
│   │   └── runtime_registry.go       ← PostgreSQL CRUD for runtime records
│   ├── reconciler/
│   │   └── reconciler.go             ← startup crash recovery (fix stuck DEPLOYING records)
│   └── providers/
│       └── railway/
│           └── railway.go            ← Railway API client (deploy, status, logs, delete)
│
├── project/
│   └── handler/
│       └── project.go                ← create, list, delete, get projects
│
├── observability/
│   └── tracer.go                     ← OpenTelemetry setup (traces, metrics, spans)
│
├── events/
│   └── nats.go                       ← NATS connect + publish + subscribe
│
├── http/
│   └── server.go                     ← HTTP server bootstrap
│
├── shared/
│   ├── errors.go                     ← common error types
│   └── response.go                   ← standard API response format { success, data, message }
│
└── utils/
    ├── retry.go                      ← retry with backoff
    ├── timeout.go                    ← enforce deadlines on HTTP calls
    └── sleep.go                      ← sleep utility
```

---

# AI Runtime Team — Complete Folder Structure (Python or TypeScript)

> This is the engine that gets deployed TO Railway as a container.
> It reads ragent.yaml and executes the AI workflow.
> Note: The runtime-service inside Ai-Agent is the Platform Team's gRPC server.
> The runtime-engine is the AI Team's actual execution engine deployed to Railway.

```
Ai-Agent/
│
├── runtime-service/               ← Platform Team's gRPC server (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── docker-compose.yml
│   ├── .env.example
│   └── src/
│       ├── generated/             ← auto-generated from R_Cloud/proto/runtime.proto (DO NOT EDIT)
│       │   ├── runtime_pb.ts      ← protobuf message types
│       │   └── runtime_grpc_pb.ts ← gRPC server stub
│       │
│       ├── config/                ← env var validation
│       ├── db/                    ← PostgreSQL connection client only
│       │                            schema SQL lives in Backend/db/schema/runtime.sql
│       │                            if new column needed → update Backend schema, not here
│       ├── errors/                ← custom error classes
│       ├── events/                ← NATS client: publishes runtime lifecycle events
│       │                            runtime.started, runtime.restarted, runtime.failed, runtime.stopped
│       │                            does NOT define event topics — those are in Backend/events/nats.go
│       ├── grpc/
│       │   ├── server.ts          ← gRPC server bootstrap
│       │   ├── handlers/
│       │   │   ├── create-runtime.handler.ts
│       │   │   ├── restart-runtime.handler.ts
│       │   │   ├── stop-runtime.handler.ts
│       │   │   ├── delete-runtime.handler.ts
│       │   │   └── get-runtime-status.handler.ts
│       │   └── interceptors/
│       │       ├── auth.interceptor.ts
│       │       ├── logger.interceptor.ts
│       │       └── error.interceptor.ts
│       ├── health/
│       │   ├── health-checker.ts  ← ping GET /health on runtime URL
│       │   ├── health-scheduler.ts← every 30s check all active runtimes
│       │   ├── restart-manager.ts ← auto-restart unhealthy runtimes
│       │   └── worker-pool.ts
│       ├── providers/
│       │   └── railway/
│       │       └── railway.client.ts ← Railway API client
│       ├── provisioner/
│       │   ├── monolith.provisioner.ts
│       │   └── microservices.provisioner.ts
│       ├── reconciler/
│       │   └── reconciler.ts      ← startup crash recovery
│       ├── registry/
│       │   ├── runtime-registry.ts
│       │   └── runtime-registry.types.ts
│       ├── telemetry/
│       │   ├── tracer.ts          ← OpenTelemetry setup
│       │   └── metrics.ts
│       ├── validation/            ← Zod input schemas
│       ├── utils/                 ← retry, timeout, sleep
│       └── index.ts               ← bootstrap entry point
│
└── runtime-engine/                ← AI Team's execution engine (Python or TypeScript)
    │                                 This is what gets deployed TO Railway by the Runtime Service
    ├── ragent.yaml                ← example config for local testing
    ├── requirements.txt           ← (Python) or package.json (TypeScript)
    ├── Dockerfile                 ← container definition for Railway
    ├── .env.example               ← OPENAI_API_KEY, ANTHROPIC_KEY, etc.
    │
    ├── main.py                    ← entry point: boot HTTP server on port 3000
    │
    ├── core/
    │   ├── loader.py              ← read + parse ragent.yaml at startup
    │   ├── router.py              ← route POST /execute to correct workflow
    │   └── session.py             ← session ID + context management per request
    │
    ├── workflow/
    │   ├── engine.py              ← main orchestrator: runs agents in order from yaml
    │   ├── sequential.py          ← run agents one after another
    │   ├── parallel.py            ← run agents simultaneously
    │   └── conditional.py         ← conditional routing between agents
    │
    ├── a2a/
    │   ├── messenger.py           ← agent-to-agent message passing
    │   ├── coordinator.py         ← manage A2A state + flow
    │   └── state.py               ← shared state between agents in a workflow
    │
    └── api/
        ├── server.py              ← FastAPI HTTP server on port 3000
        ├── execute.py             ← POST /execute → trigger workflow → return response
        ├── stream.py              ← POST /stream → SSE streaming response
        ├── health.py              ← GET /health → return { status: "healthy" }
        └── metadata.py            ← GET /metadata → return agent info
```

---

## Ownership Rules for runtime-service

| Concern | Where it lives | Who updates it |
|---|---|---|
| Database schema (tables, columns) | `Backend/db/schema/runtime.sql` | Platform Team |
| Database connection client | `runtime-service/src/db/` | Platform Team |
| NATS event topics definition | `Backend/events/nats.go` | Platform Team |
| NATS publish calls | `runtime-service/src/events/` | Platform Team |
| Proto contract | `R_Cloud/proto/runtime.proto` | Both teams agree |
| Generated gRPC code | `runtime-service/src/generated/` | Auto-generated, do not edit |

---

# What AI Team Does NOT Build

Memory, RAG, and Tools are the **user's responsibility** — not the platform's.

```
User's Repository (their own code)
├── planner.py          ← user writes this with their own LLM calls
├── researcher.py       ← user writes this with their own RAG setup
├── reviewer.py         ← user writes this with their own memory
├── requirements.txt    ← user installs langchain, openai, chromadb etc.
└── ragent.yaml         ← tells YOUR platform how to deploy it
```

The AI Team's engine only needs to:
1. Read ragent.yaml → understand the topology
2. Know how to start and route between agent entrypoints
3. Expose the 4 HTTP endpoints

---

# gRPC — How It Connects

gRPC is used **only** between Deployment Service and Runtime Service.

```text
Deployment Service (gRPC CLIENT)
        │
        │  TCP port 50051
        │  Protobuf binary protocol
        ↓
Runtime Service (gRPC SERVER)
```

## R_Cloud/proto/runtime.proto — Methods

```protobuf
service RuntimeService {
  rpc CreateRuntime    (CreateRuntimeRequest)    returns (CreateRuntimeResponse);
  rpc RestartRuntime   (RestartRuntimeRequest)   returns (RestartRuntimeResponse);
  rpc StopRuntime      (StopRuntimeRequest)      returns (StopRuntimeResponse);
  rpc DeleteRuntime    (DeleteRuntimeRequest)    returns (DeleteRuntimeResponse);
  rpc GetRuntimeStatus (GetRuntimeStatusRequest) returns (GetRuntimeStatusResponse);
}
```

## Interceptor Order (on every incoming gRPC call)

```
1. logger.interceptor   → log the incoming call
2. auth.interceptor     → validate caller is an authorized internal service
3. error.interceptor    → catch unhandled errors → return proper gRPC status
4. Handler              → actual business logic
```

## gRPC Ports

| Port | Protocol | Purpose |
|---|---|---|
| `50051` | gRPC / TCP | Runtime Service API (internal only) |
| `3000` | HTTP | Railway container health check |

---

# E2E Flow — Deploy Phase

## Step 1 — User triggers deploy

```
Frontend → REST → API Gateway

INPUT:
POST /api/v1/deployments
{
  "projectId": "proj_001",
  "branch": "main"
}

OUTPUT:
{
  "deploymentId": "dep_123",
  "status": "VALIDATING"
}
```

## Step 2 — Deployment Service validates ragent.yaml

```
API Gateway → Deployment Service

Actions:
  1. Call GitHub API → clone repository
  2. Read ragent.yaml from repo root
  3. Validate:
       ✅ ragent.yaml exists
       ✅ mode is valid (monolith or microservices)
       ✅ entrypoints exist in repo
       ✅ required routes defined (/execute, /health, /metadata)
  4. Write to PostgreSQL: deployments table → status = "DEPLOYING"
```

## Step 3 — Deployment Service calls Runtime Service via gRPC

```
Deployment Service (gRPC CLIENT) → Runtime Service (gRPC SERVER)

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
    "DB_URL": "postgres://..."
  }
}

OUTPUT (CreateRuntimeResponse):
{
  runtimeId:  "rtm_456",
  runtimeUrl: "https://customer-support.up.railway.app",
  status:     "RUNNING"
}
```

## Step 4 — Runtime Service deploys to Railway

```
Runtime Service reads mode = "microservices"
  → calls provisioner/microservices.go
  → for each agent, calls Railway API:

Railway API INPUT (per agent):
  repo:         github.com/user/customer-support
  startCommand: "python planner.py"     ← from entrypoint field in ragent.yaml
  envVars:      { OPENAI_API_KEY: "sk-..." }

Railway API OUTPUT:
  serviceId:  "railway_svc_789"
  publicUrl:  "https://planner.up.railway.app"

Runtime Service writes to PostgreSQL (runtime_registry):
{
  runtimeId:    "rtm_456",
  deploymentId: "dep_123",
  runtimeUrl:   "https://customer-support.up.railway.app",
  status:       "RUNNING",
  health:       "STARTING",
  provider:     "railway",
  createdAt:    "2026-06-29T09:00:00Z"
}
```

## Step 5 — Railway starts Ai-Agent container

```
Ai-Agent runtime-engine boots:
  1. main.py starts
  2. core/loader.py reads ragent.yaml
       → mode: microservices
       → agents: planner → researcher
  3. api/server.py starts HTTP on port 3000

GET /health response:
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "5s"
}

GET /metadata response:
{
  "name": "customer-support",
  "framework": "LangGraph",
  "version": "1.0.0",
  "capabilities": ["a2a", "streaming"]
}
```

## Step 6 — Runtime Service health checks + registers agent

```
Runtime Service health/checker.go:
  GET https://customer-support.up.railway.app/health
    → HTTP 200 + { status: "healthy" }
    → update PostgreSQL: health = "HEALTHY"
    → publish NATS event: "runtime.started"

Runtime Service calls:
  GET https://customer-support.up.railway.app/metadata
    → stores result in agent_registry table in PostgreSQL

NATS Event:
  topic:   "runtime.started"
  payload: {
    deploymentId: "dep_123",
    runtimeId:    "rtm_456",
    runtimeUrl:   "https://customer-support.up.railway.app"
  }
```

## Step 7 — AgentOps + Frontend updated

```
AgentOps Service subscribes to NATS:
  → receives "runtime.started"
  → updates deployment status = "RUNNING"
  → dashboard shows HEALTHY ✅

Frontend receives WebSocket event:
{
  "event":        "deployment.completed",
  "deploymentId": "dep_123",
  "runtimeUrl":   "https://customer-support.up.railway.app",
  "status":       "RUNNING"
}
```

---

# E2E Flow — Execute Phase

## Step 8 — User sends a request to the deployed agent

```
INPUT:
POST /api/v1/deployments/dep_123/execute
Authorization: Bearer <JWT>
{
  "session_id": "sess_abc",
  "input": "Research latest AI trends"
}
```

## Step 9 — API Gateway proxies to Runtime URL

```
API Gateway:
  1. Validates JWT ✅
  2. Checks rate limit ✅
  3. Looks up runtimeUrl from PostgreSQL registry
       → "https://customer-support.up.railway.app"
  4. Proxies request via proxy/proxy.go

Sends to Ai-Agent:
POST https://customer-support.up.railway.app/execute
{
  "session_id": "sess_abc",
  "input":      "Research latest AI trends",
  "context":    {}
}
```

## Step 10 — Ai-Agent runs the workflow

```
api/execute.py receives request
  → workflow/engine.py starts

Step A: Run planner agent
  planner.py runs
  INPUT:  "Research latest AI trends"
  OUTPUT: "Search for: transformers, LLM scaling, multimodal"

Step B: A2A → pass to researcher
  a2a/messenger.py sends to researcher.py
  INPUT:  "Search for: transformers, LLM scaling, multimodal"
  OUTPUT: "Found 5 papers: [paper1, paper2, paper3...]"

Step C: Final response assembled
  OUTPUT: "Here are the latest AI trends: ..."

api/execute.py returns:
{
  "success":  true,
  "response": "Here are the latest AI trends: ...",
  "usage": {
    "prompt_tokens":      120,
    "completion_tokens":  350
  },
  "latency": 842
}
```

## Step 11 — API Gateway returns to User

```
OUTPUT:
{
  "success": true,
  "data": {
    "response": "Here are the latest AI trends: ...",
    "latency":  842
  },
  "message": "Success"
}
```

---

# Full E2E Summary Diagram

```text
Frontend
  ↓ REST  POST /api/v1/deployments
API Gateway (Go)
  ↓ internal
Deployment Service (Go)
  → clone repo, validate ragent.yaml
  ↓ gRPC CreateRuntime (TCP:50051)
Runtime Service (Go)  ← gRPC SERVER
  → reads mode from request
  → calls Railway API → deploys container
  ↓ HTTP
Ai-Agent on Railway (Python/TS)
  → boots, reads ragent.yaml
  → /execute /stream /health /metadata ready
  ↑ GET /health (every 30s)
Runtime Service health/scheduler.go (Go)
  → updates PostgreSQL runtime_registry
  ↓ NATS "runtime.started"
AgentOps Service (Go)
  → updates dashboard
  ↓ WebSocket
Frontend → shows RUNNING ✅

─── User calls the deployed agent ───────────────────────────

User
  ↓ REST  POST /api/v1/deployments/dep_123/execute
API Gateway (Go)
  → lookup runtimeUrl from PostgreSQL
  ↓ HTTP proxy
Ai-Agent /execute (Python/TS) on Railway
  → workflow/engine.py runs
  → planner → researcher  (A2A)
  → LLM calls per agent
  → final response
  ↑
API Gateway
  ↑
User ← gets response ✅
```

---

# gRPC vs REST — When to Use What

| Communication | Protocol | Between |
|---|---|---|
| User → Platform | REST HTTPS | Frontend / External clients → API Gateway |
| Dashboard updates | WebSocket | Frontend ↔ API Gateway |
| Deployment → Runtime | **gRPC** | Deployment Service → Runtime Service |
| Runtime → Railway | REST HTTPS | Runtime Service → Railway API |
| Runtime → AI Agent | REST HTTP | Runtime Service health checker → `/health` |
| API Gateway → AI Agent | REST HTTP | Proxy `/execute` to Railway URL |
| Service → Service events | NATS | Deployment, Runtime, AgentOps |
| Tracing | OpenTelemetry | All services → OTel Collector |

---

# Deployment States

```text
Created → Validating → Deploying → Running → Restarting → Stopped → Deleted → Failed
```

# Runtime Health States

```text
Starting → Healthy → Unhealthy → Stopped
                        ↓
                   Restart triggered (up to max retries)
```

# NATS Events

| Event | Published By | Consumed By |
|---|---|---|
| `deployment.created` | Deployment Service | AgentOps |
| `deployment.completed` | Deployment Service | AgentOps |
| `runtime.started` | Runtime Service | AgentOps |
| `runtime.restarted` | Runtime Service | AgentOps |
| `runtime.stopped` | Runtime Service | AgentOps |
| `runtime.failed` | Runtime Service | AgentOps |
| `health.failed` | Runtime Service | AgentOps |
