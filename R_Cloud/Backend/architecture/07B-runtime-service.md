# 07 — Runtime Service

> Provisions, manages, and health-monitors AI application runtimes on Railway.

---

# Overview

The Runtime Service is the only service that communicates with Railway.

It is the gRPC server that receives commands from the Deployment Service.

It owns the Runtime Registry in PostgreSQL.

It runs periodic health checks on all active runtimes.

---

# Responsibilities

- Receive gRPC calls from Deployment Service
- Deploy AI application containers to Railway
- Restart, stop, delete runtimes
- Maintain Runtime Registry in PostgreSQL
- Periodic health checks (GET /health every 30s)
- Auto-restart unhealthy runtimes
- Fetch and store agent metadata (GET /metadata)
- Publish runtime lifecycle events to NATS
- Startup crash recovery (reconciler)

---

# Location

The Runtime Service is built in TypeScript and lives in:

```
Ai-Agent/runtime-service/
```

This is Platform Team code. It is not AI logic.

It was built separately from the Go Backend but connects to the same PostgreSQL and NATS.

---

# Folder Structure

```
Ai-Agent/runtime-service/src/
├── generated/             ← auto-generated from R_Cloud/proto/runtime.proto
│   ├── runtime_pb.ts
│   └── runtime_grpc_pb.ts
├── config/                ← env var validation
├── db/                    ← PostgreSQL connection client
│                            schema lives in Backend/db/schema/runtime.sql
├── errors/                ← custom error classes
├── events/                ← NATS client: publish runtime lifecycle events
├── grpc/
│   ├── server.ts          ← gRPC server bootstrap (port 50051)
│   ├── handlers/
│   │   ├── create-runtime.handler.ts
│   │   ├── restart-runtime.handler.ts
│   │   ├── stop-runtime.handler.ts
│   │   ├── delete-runtime.handler.ts
│   │   └── get-runtime-status.handler.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       ├── logger.interceptor.ts
│       └── error.interceptor.ts
├── health/
│   ├── health-checker.ts  ← ping GET /health on runtime URL
│   ├── health-scheduler.ts← every 30s check all active runtimes
│   ├── restart-manager.ts ← auto-restart unhealthy runtimes
│   └── worker-pool.ts
├── providers/railway/
│   └── railway.client.ts  ← Railway API client
├── provisioner/
│   ├── monolith.provisioner.ts
│   └── microservices.provisioner.ts
├── reconciler/
│   └── reconciler.ts      ← startup crash recovery
├── registry/
│   ├── runtime-registry.ts
│   └── runtime-registry.types.ts
├── telemetry/
│   ├── tracer.ts
│   └── metrics.ts
└── index.ts               ← bootstrap entry point
```

---

# gRPC API

Proto file: `R_Cloud/proto/runtime.proto`

```protobuf
service RuntimeService {
  rpc CreateRuntime    (CreateRuntimeRequest)    returns (CreateRuntimeResponse);
  rpc RestartRuntime   (RestartRuntimeRequest)   returns (RestartRuntimeResponse);
  rpc StopRuntime      (StopRuntimeRequest)      returns (StopRuntimeResponse);
  rpc DeleteRuntime    (DeleteRuntimeRequest)    returns (DeleteRuntimeResponse);
  rpc GetRuntimeStatus (GetRuntimeStatusRequest) returns (GetRuntimeStatusResponse);
}
```

Port: `50051`

---

# gRPC Interceptor Order

```
1. logger.interceptor   → log the incoming call
2. auth.interceptor     → validate caller is authorized
3. error.interceptor    → catch unhandled errors → return proper gRPC status
4. Handler              → actual business logic
```

---

# Deployment Modes

## Monolith

One Railway container for the entire application.

```
CreateRuntime called with mode = monolith
  → monolith.provisioner.ts
  → deploy one container
  → startCommand: "python app.py"
```

## Microservices

One Railway container per agent.

```
CreateRuntime called with mode = microservices, agents = [planner, researcher]
  → microservices.provisioner.ts
  → for each agent:
      deploy container
      startCommand: "python planner.py"   ← from entrypoint
```

---

# Health Monitoring

Every 30 seconds:

```
health-scheduler.ts
  → load all runtimes with status = RUNNING from PostgreSQL
  → for each runtime:
      GET https://runtime-url/health
      → 200 + { status: "healthy" } → update health = HEALTHY
      → timeout or error → update health = UNHEALTHY
                         → trigger restart if under max retry limit
```

---

# Runtime Registry

Table in Platform PostgreSQL (schema: Backend/db/schema/runtime.sql):

```
runtime_registry
  id
  deployment_id
  runtime_url
  provider          ← railway
  status            ← RUNNING | STOPPED | FAILED | DELETED
  health            ← STARTING | HEALTHY | UNHEALTHY | STOPPED
  restart_count
  created_at
  updated_at
```

---

# Agent Registry

After health check passes, Runtime Service calls GET /metadata on the runtime URL.

Response stored in:

```
agent_registry
  id
  runtime_id
  name
  framework
  version
  capabilities
  created_at
```

---

# NATS Events Published

| Event | When |
|---|---|
| `runtime.started` | After first successful health check |
| `runtime.restarted` | After auto-restart |
| `runtime.stopped` | When stopped |
| `runtime.failed` | When max restarts exceeded |
| `health.failed` | When health check fails |

---

# Reconciler

On service startup, the reconciler checks for any runtimes stuck in DEPLOYING status.

These are deployments that were interrupted by a crash.

It checks each one against the Railway API and resolves their state.

---

# Connections

| Resource | Connection |
|---|---|
| PostgreSQL | Same server as Backend, runtime_registry and agent_registry tables |
| NATS | Same server as Backend, publishes runtime events |
| Railway API | External HTTPS, exclusive to Runtime Service |
| AI Application | HTTP GET /health and GET /metadata on Railway URL |
