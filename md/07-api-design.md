# 07 - API Design

# Overview

The API Layer is the communication backbone of **R Agent Cloud**.

It provides secure communication between users, frontend applications, backend microservices, and deployed AI runtimes.

The API layer is responsible for:

- Authentication
- Project Management
- GitHub Integration
- Deployment Management
- Runtime Management
- Agent Registry
- Runtime Registry
- AgentOps
- Observability
- Real-time Updates

---

# API Architecture

```text
                    Client
                       │
                       ▼
                 REST API (HTTPS)
                       │
                       ▼
                  API Gateway
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
 Deployment      Runtime Service   AgentOps Service
      │                │                │
      └────────────gRPC─────────────────┘
                       │
                 PostgreSQL
                       │
                    Railway
```

---

# Communication Strategy

| Communication | Protocol |
|--------------|----------|
| Client → Platform | REST |
| Dashboard → Platform | WebSocket |
| Service → Service | gRPC |
| GitHub → Platform | Webhook |
| Internal Telemetry | OpenTelemetry |

---

# API Gateway

The API Gateway acts as the single entry point.

Responsibilities

- Authentication
- Authorization
- JWT Validation
- API Keys
- Rate Limiting
- Request Routing
- Logging
- OpenTelemetry
- API Versioning

---

# Base URL

```
/api/v1
```

---

# Authentication APIs

## Login

```http
POST /api/v1/auth/login
```

---

## Refresh Token

```http
POST /api/v1/auth/refresh
```

---

## Logout

```http
POST /api/v1/auth/logout
```

---

# Project APIs

## Create Project

```http
POST /api/v1/projects
```

---

## List Projects

```http
GET /api/v1/projects
```

---

## Get Project

```http
GET /api/v1/projects/{projectId}
```

---

## Delete Project

```http
DELETE /api/v1/projects/{projectId}
```

---

# GitHub APIs

## Connect Repository

```http
POST /api/v1/projects/{projectId}/github
```

---

## Sync Repository

```http
POST /api/v1/projects/{projectId}/sync
```

---

## GitHub Webhook

```http
POST /api/v1/webhooks/github
```

---

# Deployment APIs

## Deploy Project

```http
POST /api/v1/deployments
```

Example

```json
{
  "projectId":"proj_001",
  "branch":"main"
}
```

---

## Deployment Status

```http
GET /api/v1/deployments/{deploymentId}
```

---

## Deployment History

```http
GET /api/v1/deployments
```

---

## Redeploy

```http
POST /api/v1/deployments/{deploymentId}/redeploy
```

---

## Delete Deployment

```http
DELETE /api/v1/deployments/{deploymentId}
```

---

# Runtime APIs

## List Runtimes

```http
GET /api/v1/runtimes
```

---

## Runtime Details

```http
GET /api/v1/runtimes/{runtimeId}
```

---

## Restart Runtime

```http
POST /api/v1/runtimes/{runtimeId}/restart
```

---

## Stop Runtime

```http
POST /api/v1/runtimes/{runtimeId}/stop
```

---

## Delete Runtime

```http
DELETE /api/v1/runtimes/{runtimeId}
```

---

# Agent Registry APIs

## List Agents

```http
GET /api/v1/agents
```

---

## Agent Details

```http
GET /api/v1/agents/{agentId}
```

Returns

- Framework
- Runtime
- Version
- Capabilities
- Deployment

---

# AgentOps APIs

## Dashboard

```http
GET /api/v1/agentops/dashboard
```

---

## Runtime Metrics

```http
GET /api/v1/agentops/metrics/{deploymentId}
```

---

## Runtime Logs

```http
GET /api/v1/agentops/logs/{deploymentId}
```

---

## Runtime Health

```http
GET /api/v1/agentops/health/{deploymentId}
```

---

## Deployment Analytics

```http
GET /api/v1/agentops/deployments
```

---

# WebSocket API

Endpoint

```
/ws
```

Events

```
deployment.started

deployment.completed

runtime.started

runtime.restarted

runtime.stopped

runtime.failed

health.changed

metrics.updated

logs.updated
```

---

# Internal gRPC APIs

## Deployment Service

```protobuf
Deploy()

Redeploy()

DeleteDeployment()

GetDeployment()
```

---

## Runtime Service

```protobuf
CreateRuntime()

RestartRuntime()

StopRuntime()

DeleteRuntime()

GetRuntimeStatus()
```

---

## AgentOps Service

```protobuf
GetMetrics()

GetLogs()

GetRuntimeHealth()

GetDashboard()
```

---

# Runtime Contract

Every deployed AI application must expose

```
POST /execute

POST /stream

GET /health

GET /metadata
```

These endpoints are **implemented by the deployed AI application**, not by the platform.

The Runtime Service communicates with deployed applications using this standard contract.

---

# Standard Response

Success

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error

```json
{
  "success": false,
  "error": {
    "code":"DEPLOYMENT_FAILED",
    "message":"Deployment failed."
  }
}
```

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Rate Limited |
| 500 | Internal Error |

---

# Security

Every request passes through

- JWT Authentication
- API Key Validation
- RBAC
- Rate Limiting
- Request Validation
- Audit Logging

---

# Future Enhancements

- GraphQL Gateway
- Server-Sent Events (SSE)
- Multi-region API Gateway
- Batch Deployment APIs
- Kubernetes Runtime APIs
- Multi-cloud Runtime APIs
- AI Marketplace APIs

---

# Summary

The API Layer provides a unified interface for the R Agent Cloud platform. REST APIs are used for external clients, gRPC enables communication between backend microservices, WebSockets power the real-time AgentOps dashboard, and deployed AI applications follow a standardized Runtime Contract (`/execute`, `/stream`, `/health`, `/metadata`). This design keeps the platform modular, scalable, and cloud-provider agnostic.
