# Team Project Split

> Development ownership for the R Agent Cloud backend.

---

# Team Structure

## Developer 1 (You) — Go Backend Platform

Responsible for the platform core.

### Services

- API Gateway
- Project Service
- Deployment Service
- Validation Service

### Responsibilities

- REST API Design
- JWT Middleware Integration
- GitHub Repository Integration
- AI Project Validation
- ragent.yaml Parser
- Deployment Planning
- Deployment History
- gRPC Client
- Database Models (Platform)

---

## Developer 2 — TypeScript Runtime Team

Responsible for runtime lifecycle.

### Services

- Runtime Service
- Railway Provider
- Runtime Registry
- Health Monitoring

### Responsibilities

- gRPC Server
- Railway API Integration
- Runtime Creation
- Runtime Restart
- Runtime Stop
- Runtime Delete
- Runtime Health Checks
- Runtime Registry
- OpenTelemetry Instrumentation

---

## Developer 3 — TypeScript Platform Services

Responsible for platform support services.

### Services

- Authentication Service
- Notification Service

### Responsibilities

Authentication

- Register
- Login
- JWT
- Refresh Token
- API Keys
- Session Management

Notification

- Email Notifications
- WebSocket Notifications
- NATS Subscribers
- Deployment Notifications
- Runtime Notifications

---

# Shared Components

## PostgreSQL

Developer 1

- Platform Database
- Projects
- Deployments
- Runtime Registry
- Agent Registry

Developer 3

- Authentication Database

---

## Redis

Shared

- Session Cache
- Rate Limiting
- Runtime Cache

---

## NATS

All services publish and subscribe to events.

Example

Deployment Service

↓

deployment.created

↓

Runtime Service

↓

runtime.started

↓

Notification Service

↓

AgentOps

---

## OpenTelemetry

Instrumented Services

- API Gateway
- Deployment Service
- Runtime Service
- AgentOps

---

## gRPC

Only one gRPC connection exists.

```text
Deployment Service (Go)

        │

        │ gRPC

        ▼

Runtime Service (TypeScript)
```

Deployment Service acts as the gRPC Client.

Runtime Service acts as the gRPC Server.

---

# Communication

Frontend

↓

REST

↓

API Gateway

↓

Deployment Service

↓

gRPC

↓

Runtime Service

↓

Railway

-------------------------------------

Deployment Service

↓

NATS

↓

Notification Service

↓

Email / WebSocket

-------------------------------------

Runtime Service

↓

NATS

↓

AgentOps

↓

Dashboard

---

# Ownership Rules

Developer 1

Owns

- Deployment Logic
- Validation Logic
- API Gateway
- Project Management

Developer 2

Owns

- Runtime Lifecycle
- Railway Integration
- Runtime Health
- Runtime Registry

Developer 3

Owns

- Authentication
- Notifications
- User Management

---

# Development Rules

- Every service owns its own business logic.
- Runtime Service is the only service allowed to communicate with Railway.
- Deployment Service is the only service allowed to trigger deployments.
- Authentication Service owns all user authentication.
- Services communicate asynchronously through NATS.
- Deployment Service communicates synchronously with Runtime Service through gRPC.
- Frontend never communicates directly with internal services.