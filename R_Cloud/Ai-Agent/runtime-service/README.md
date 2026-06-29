# Runtime Service

> R Agent Cloud — Runtime Service
>
> Provisions, manages, and health-monitors AI application runtimes on Railway.

---

## Responsibilities

- Deploy AI applications to Railway (monolith and microservices modes)
- Manage runtime lifecycle: restart, stop, delete
- Maintain the Runtime Registry in PostgreSQL
- Periodically health-check all active runtimes
- Auto-restart unhealthy runtimes up to a configured limit
- Publish lifecycle events to NATS for the AgentOps service
- Expose gRPC API for the Deployment Service and AgentOps Service

---

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript + Node.js | Language & Runtime |
| gRPC (`@grpc/grpc-js`) | Inter-service communication |
| Protobuf | API contract definition |
| PostgreSQL + Drizzle ORM | Runtime Registry |
| Redis | Caching |
| NATS | Event bus |
| Zod | Input validation |
| Pino | Structured logging |
| OpenTelemetry | Distributed tracing & metrics |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (postgres, redis, nats)
docker compose up -d

# 3. Copy and fill env vars
cp .env.example .env

# 4. Run database migrations
npm run db:migrate

# 5. Start in dev mode (hot reload)
npm run dev
```

---

## Folder Structure

```
src/
├── config/          → Environment variable validation
├── grpc/            → gRPC server, handlers, interceptors
├── proto/           → Protobuf contract definition
├── providers/       → Railway API adapter (isolated)
├── provisioner/     → Deployment logic (monolith + microservices)
├── health/          → Health scheduler, checker, restart manager
├── registry/        → PostgreSQL Runtime Registry operations
├── reconciler/      → Startup crash recovery
├── events/          → NATS publish/subscribe
├── db/              → Database client and schema
├── validation/      → Zod input validation schemas
├── errors/          → Custom error classes
├── logger/          → Structured Pino logging
├── telemetry/       → OpenTelemetry tracing and metrics
└── utils/           → retry, timeout, sleep utilities
```

---

## gRPC Methods

| Method | Called By | Purpose |
|---|---|---|
| `CreateRuntime` | Deployment Service | Deploy an AI app to Railway |
| `RestartRuntime` | AgentOps / Health Scheduler | Restart a runtime |
| `StopRuntime` | AgentOps | Pause a running runtime |
| `DeleteRuntime` | Deployment Service | Permanently destroy a runtime |
| `GetRuntimeStatus` | Any service | Query current runtime state |

---

## Ports

| Port | Protocol | Purpose |
|---|---|---|
| `50051` | gRPC | Service API (internal only) |
| `3000` | HTTP | Container health check (for Railway) |
