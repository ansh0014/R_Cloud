### User click Deploy Button
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


## Now Deployment Service validates ragent.yaml

API Gateway → Deployment Service (internal Go call)

Deployment Service:
  1. Calls GitHub API → clones repo
  2. Reads ragent.yaml from repo

ragent.yaml content it reads:
─────────────────────────────
application:
  name: customer-support
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
─────────────────────────────

Validates:
   ragent.yaml exists
   mode is valid (monolith/microservices)
   entrypoints exist in repo
   required routes defined

Writes to PostgreSQL:
  deployments table → status = "DEPLOYING"

## Now Deployment Service calls Runtime Service via gRPC


Deployment Service (gRPC CLIENT)
        ↓ gRPC call over TCP port 50051
Runtime Service (gRPC SERVER)

INPUT (CreateRuntimeRequest protobuf):
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

OUTPUT (CreateRuntimeResponse protobuf):
{
  runtimeId:  "rtm_456",
  runtimeUrl: "https://customer-support.up.railway.app",
  status:     "RUNNING"
}


### Runtime Service Deploys to Railway

Runtime Service reads mode = "microservices"
  → calls provisioner/microservices.go
  → for each agent, calls Railway API:

Railway API INPUT (per agent):
  repo: github.com/user/customer-support
  startCommand: "python planner.py"    ← from entrypoint
  envVars: { OPENAI_API_KEY: "sk-..." }

Railway API OUTPUT:
  serviceId: "railway_svc_789"
  publicUrl: "https://planner.up.railway.app"

(repeats for researcher agent)

Runtime Service writes to PostgreSQL:
  runtime_registry table:
  {
    runtimeId:   "rtm_456",
    deploymentId: "dep_123",
    runtimeUrl:  "https://customer-support.up.railway.app",
    status:      "RUNNING",
    health:      "STARTING",
    provider:    "railway",
    createdAt:   "2026-06-29T09:00:00Z"
  }


### Railway starts A-agent container

Ai-Agent runtime-engine boots up:

  1. main.py starts
  2. core/loader.py reads ragent.yaml
     → knows: mode=microservices, planner→researcher
  3. api/server.py starts HTTP on port 3000
     → /execute, /stream, /health, /metadata ready

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


## Runtime Service Health checks+ registers agent

Runtime Service health/checker.go:
  GET https://customer-support.up.railway.app/health

  If 200 + { status: "healthy" }:
    → update PostgreSQL: health = "HEALTHY"
    → publish NATS event: "runtime.started"

Runtime Service calls:
  GET https://customer-support.up.railway.app/metadata
    → stores result in agent_registry PostgreSQL table

NATS Event published:
  topic: "runtime.started"
  payload: {
    deploymentId: "dep_123",
    runtimeId:    "rtm_456",
    runtimeUrl:   "https://customer-support.up.railway.app"
  }


## AgentOps picks up NATS event

AgentOps Service subscribes to NATS:
  → receives "runtime.started"
  → updates deployment status = "RUNNING"
  → dashboard shows runtime as HEALTHY 

Frontend WebSocket receives:
  {
    "event": "deployment.completed",
    "deploymentId": "dep_123",
    "runtimeUrl": "https://customer-support.up.railway.app",
    "status": "RUNNING"
  }

  # User clicks execute in their own website app whatever



User → REST → API Gateway

INPUT:
POST /api/v1/deployments/dep_123/execute
Authorization: Bearer <JWT>
{
  "session_id": "sess_abc",
  "input": "Research latest AI trends"
}


## API Gateway validates and looks up runtime

API Gateway:
  1. Validates JWT token
  2. Checks rate limit for this user
  3. Looks up runtimeUrl from PostgreSQL runtime_registry
       deploymentId = "dep_123" → runtimeUrl = "https://customer-support.up.railway.app"
  4. Forwards request to Railway container via proxy/proxy.go

Proxy sends to Ai-Agent container:
POST https://customer-support.up.railway.app/execute
{
  "session_id": "sess_abc",
  "input":      "Research latest AI trends",
  "context":    {}
}

Note: This is the developer's code running on Railway. Not our platform.


## Ai-Agent runs the workflow (developer's code)

api/execute.py receives the request
  → workflow/engine.py starts
  → reads workflow from ragent.yaml: planner → researcher

Step 1: planner agent runs
  planner.py executes
  INPUT:  "Research latest AI trends"
  calls LLM (developer's OpenAI key)
  OUTPUT: "Search topics: transformers, LLM scaling, multimodal models"

Step 2: A2A message passing
  a2a/messenger.py sends planner output to researcher

Step 3: researcher agent runs
  researcher.py executes
  INPUT:  "Search topics: transformers, LLM scaling, multimodal models"
  calls LLM + any tools the developer built
  OUTPUT: "Found key trends: GPT-5, Gemini 2.0, multimodal RAG..."

Step 4: workflow complete, response assembled

api/execute.py returns:
{
  "success":  true,
  "response": "Here are the latest AI trends: GPT-5 released...",
  "usage": {
    "prompt_tokens":     120,
    "completion_tokens": 350
  },
  "latency": 842
}


## API Gateway returns response to the user

OUTPUT back to user's app:
{
  "success": true,
  "data": {
    "response": "Here are the latest AI trends: GPT-5 released...",
    "latency":  842
  },
  "message": "Success"
}

The user's own website or app receives this and shows it to their end users.
Our platform did not touch the AI logic.
We only routed the request and returned the response.


## What happens in the background during every execute call

API Gateway publishes OpenTelemetry span:
  trace_id:   "trace_xyz"
  service:    "api-gateway"
  operation:  "proxy /execute"
  latency:    842ms
  status:     200

AgentOps Service receives this via OpenTelemetry Collector:
  → increments request count for dep_123
  → records latency
  → updates success rate

AgentOps dashboard shows:
  {
    totalRequests: 12451,
    avgLatency:    "320ms",
    successRate:   "99.4%",
    lastCalledAt:  "2026-06-29T09:30:00Z"
  }


## Full execute flow in one view

User's app
  → POST /api/v1/deployments/dep_123/execute
API Gateway (Go)
  → validate JWT
  → lookup runtimeUrl from PostgreSQL
  → proxy to https://customer-support.up.railway.app/execute
Ai-Agent on Railway (developer's code)
  → planner.py runs
  → A2A → researcher.py runs
  → LLM calls (developer's API key, not ours)
  → response assembled
API Gateway
  → returns response to user's app
AgentOps
  → records metrics in background

