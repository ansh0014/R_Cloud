# Backend & Cloud Architecture

> Backend architecture for R Agent Cloud

---

# Overview

The backend is the control plane of R Agent Cloud.

It is responsible for:

- Project Management
- GitHub Integration
- Deployment Orchestration
- Runtime Management
- Agent Registry
- Runtime Registry
- AgentOps
- API Gateway
- Authentication
- Event Streaming
- Observability

The backend **does not execute AI logic**.

AI agents execute inside deployed runtimes.

---

# High Level Architecture

```text
                     Frontend
                         │
                         ▼
                  Cloudflare DNS
                         │
                         ▼
                   API Gateway
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
 Deployment Service   Runtime Service   AgentOps Service
       │                 │                 │
       └──────────┬──────┴──────────┬──────┘
                  ▼                 ▼
             Event Bus (NATS)   PostgreSQL
                  │
                  ▼
        Railway / Render Runtime
                  │
                  ▼
           Running AI Application
```

---

# Backend Services

## API Gateway

Acts as the single entry point.

Responsibilities

- Authentication
- Authorization
- Rate Limiting
- Request Routing
- Runtime Proxy
- OpenTelemetry Tracing

---

## Deployment Service

Responsible for deployment orchestration.

Responsibilities

- GitHub Integration
- Clone Repository
- Read ragent.yaml
- Validate AI Project
- Trigger Runtime Deployment
- Store Deployment History
- Version Management

Example Flow

```text
GitHub

↓

Clone Repository

↓

Validate Project

↓

Create Deployment Request

↓

Runtime Service
```

---

## Runtime Service

Responsible for runtime lifecycle.

Responsibilities

- Build Deployment Package
- Deploy to Railway
- Restart Runtime
- Stop Runtime
- Delete Runtime
- Health Monitoring
- Runtime Registry

The Runtime Service abstracts the infrastructure provider.

Today

```
Railway
```

Future

```
Railway

Render

Kubernetes

AWS ECS
```

The rest of the platform never changes.

---

## AgentOps Service

Provides operational management for deployed AI applications.

Responsibilities

- Runtime Health
- Deployment Status
- Request Metrics
- Runtime Logs
- Runtime Registry
- Deployment Analytics
- Version History

This service collects information from

- Runtime Service
- Deployment Service
- API Gateway
- OpenTelemetry
- Railway APIs

---

## Event Service

Responsible for communication between services.

Technology

```
NATS
```

Responsibilities

- Deployment Events
- Runtime Events
- Health Events
- Status Changes

Example Events

```
deployment.created

deployment.completed

runtime.started

runtime.stopped

runtime.failed

health.failed
```

---

# Communication

## Deployment

```text
Frontend

↓

Deployment Service

↓

Runtime Service

↓

Railway API

↓

Running Runtime
```

---

## Runtime Monitoring

```text
Runtime

↓

Health Check

↓

Runtime Service

↓

AgentOps

↓

Dashboard
```

---

## Observability

```text
Gateway

↓

OpenTelemetry

↓

Collector

↓

AgentOps

↓

Dashboard
```

---

# AI Project Validation

Before deployment every repository is validated.

Checks

- ragent.yaml exists
- Entrypoint exists
- Required endpoints defined
- Python version supported
- Runtime configuration valid
- Repository structure valid

Example

```text
Repository

↓

Validation

↓

Success

↓

Deployment
```

If validation fails

```text
Repository

↓

Validation

↓

Missing /health endpoint

↓

Deployment Rejected
```

---

# Runtime Contract

Every deployed AI application exposes the same API.

```
POST /execute

POST /stream

GET /health

GET /metadata
```

This allows every deployment to be managed uniformly.

---

# Runtime Registry

Every deployment is registered.

Example

```
Deployment ID

Repository

Runtime URL

Public URL

Provider

Status

Health

Created At

Version
```

---

# Agent Registry

Stores metadata about deployed AI applications.

Example

```
Agent Name

Framework

Repository

Deployment

Version

Runtime

Owner
```

---

# Deployment Lifecycle

```text
GitHub Repository

↓

Clone

↓

Validate

↓

Create Deployment

↓

Runtime Service

↓

Railway

↓

Health Check

↓

Runtime Registration

↓

Ready
```

---

# Health Monitoring

Runtime Service periodically checks

```
GET /health
```

Possible states

```
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

# Request Flow

```text
Client

↓

Cloudflare

↓

API Gateway

↓

Lookup Runtime

↓

Runtime URL

↓

POST /execute

↓

AI Application

↓

Response
```

---

# OpenTelemetry

Every backend service is instrumented.

Collected Data

- HTTP Traces
- gRPC Traces
- Database Queries
- Runtime Metrics
- Deployment Metrics
- Error Traces

This provides end-to-end tracing across the platform.

---

# Database Ownership

Deployment Service

- Deployments
- Versions

Runtime Service

- Runtime Registry
- Health Status

AgentOps

- Metrics
- Logs
- Traces
- Analytics

---

# Why not deploy directly to Railway?

Railway is responsible for running applications.

R Agent Cloud is responsible for managing AI applications.

The platform provides:

- AI Project Validation
- Runtime Contract
- Runtime Registry
- Agent Registry
- Deployment Lifecycle
- Version Management
- Health Monitoring
- AgentOps Dashboard
- Unified API
- Infrastructure Abstraction

Railway acts as the execution layer, while R Agent Cloud acts as the control plane.

---

# Future Roadmap

- Render Support
- Kubernetes Support
- AWS ECS Support
- Deployment Rollbacks
- Auto Scaling
- Multi Region Deployment
- Secrets Management
- Runtime Scheduling
- Blue/Green Deployments