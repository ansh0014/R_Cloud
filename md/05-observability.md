# Observability & AgentOps

> Monitoring, tracing and operational management of AI applications deployed on R Agent Cloud.

---

# Overview

The Observability Service is responsible for monitoring the health and operational state of deployed AI applications.

Unlike the Runtime Service, it does **not execute AI applications**.

Its responsibilities are:

- Runtime Monitoring
- Deployment Monitoring
- Health Monitoring
- Distributed Tracing
- Log Aggregation
- Metrics Collection
- Runtime Analytics
- Deployment History
- AgentOps Dashboard

---

# Architecture

```text
                    Frontend Dashboard
                           │
                           ▼
                  AgentOps API Service
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    OpenTelemetry     PostgreSQL       Runtime Registry
          ▲                ▲                ▲
          │                │                │
          └────────────────┼────────────────┘
                           ▲
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     API Gateway    Deployment Service   Runtime Service
                           │
                           ▼
                      Railway Runtime
```

---

# Responsibilities

The Observability Service is responsible for

- Runtime Health
- Runtime Status
- Deployment Analytics
- Deployment History
- Runtime Logs
- Request Metrics
- Error Tracking
- Distributed Tracing
- Runtime Registry Visualization
- Agent Registry Visualization

It **does not inspect the internal AI logic**.

---

# Data Sources

The Observability Service collects data from

### API Gateway

- Request Count
- HTTP Latency
- Status Codes
- Error Rate

---

### Deployment Service

- Deployment Started
- Deployment Completed
- Deployment Failed
- Deployment History
- Version Information

---

### Runtime Service

- Runtime Created
- Runtime Started
- Runtime Restarted
- Runtime Deleted
- Runtime Status
- Health Checks

---

### Railway API

- Deployment Status
- Runtime Status
- Runtime Logs
- CPU Usage (if available)
- Memory Usage (if available)

---

### OpenTelemetry Collector

- HTTP Traces
- gRPC Traces
- Database Queries
- Internal Service Latency
- Error Traces

---

# OpenTelemetry

Every backend service is instrumented using OpenTelemetry.

Services

- API Gateway
- Deployment Service
- Runtime Service
- AgentOps Service

Example trace

```text
Client

↓

API Gateway

↓

Deployment Service

↓

Runtime Service

↓

Railway

↓

Response
```

Collected information

- Trace ID
- Span ID
- Request Duration
- Service Latency
- Error Details

---

# Runtime Health Monitoring

The Runtime Service periodically checks

```
GET /health
```

Possible states

```text
Healthy

Starting

Unhealthy

Stopped

Failed
```

If unhealthy

```
Restart Runtime
```

---

# Runtime Registry

Every runtime maintains

```text
Deployment ID

Runtime URL

Cloud Provider

Health

Status

Created At

Updated At
```

Displayed in AgentOps.

---

# Agent Registry

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

# Deployment Monitoring

Every deployment is tracked.

Lifecycle

```text
Created

↓

Validating

↓

Deploying

↓

Running

↓

Restarted

↓

Stopped

↓

Deleted
```

Deployment history stores

- Deployment ID
- Repository
- Branch
- Commit
- Version
- Status
- Timestamp

---

# Runtime Metrics

Collected metrics

- Runtime Status
- Request Count
- Success Rate
- Failure Rate
- Average Latency
- P95 Latency
- Uptime
- Restart Count

---

# Request Analytics

For every request

```text
Request ID

Deployment

Runtime

Status Code

Latency

Timestamp
```

Example Dashboard

```text
Requests

12,450

Average Latency

320 ms

Success Rate

99.4%

Failed Requests

18
```

---

# Logs

The platform aggregates runtime logs.

Sources

- Runtime Service
- Railway Logs
- Backend Services

Example

```text
10:20 Runtime Started

10:22 Health Check Passed

10:24 Request Received

10:24 Response Sent

10:30 Runtime Restarted
```

---

# Distributed Tracing

Example

```text
Client

↓

API Gateway

↓

Deployment Service

↓

Runtime Service

↓

Railway

↓

Response
```

Every span contains

- Trace ID
- Parent Span
- Service Name
- Duration
- Status

---

# Error Tracking

Captured errors

- Validation Failed
- Runtime Failed
- Deployment Failed
- Health Check Failed
- Gateway Errors
- Internal Server Errors

Example

```text
Runtime

↓

Health Failed

↓

Restart Triggered

↓

Recovered
```

---

# AgentOps Dashboard

The dashboard displays

### Deployments

- Running
- Failed
- Stopped
- Total Deployments

---

### Runtime

- Runtime Status
- Runtime URL
- Health
- Provider
- Version

---

### Agents

- Agent Name
- Framework
- Capabilities
- Deployment
- Runtime

---

### Monitoring

- Request Count
- Success Rate
- Failure Rate
- Average Latency
- Runtime Uptime
- Restart Count

---

### Logs

- Runtime Logs
- Deployment Logs
- Error Logs

---

### Traces

- HTTP Requests
- gRPC Calls
- Deployment Pipeline
- Runtime Lifecycle

---

# Cost Analytics

Since AI applications are user-provided repositories, the platform **cannot automatically determine LLM token usage or model cost** without application-level instrumentation.

For the MVP, the dashboard displays operational costs and infrastructure metrics only.

Displayed information

- Number of Requests
- Runtime Uptime
- Deployment Count
- Runtime Restarts
- Average Response Time
- Infrastructure Resource Usage (when available)

Future versions may support token and model cost reporting if applications expose usage data through their runtime APIs.

---

# Event Flow

```text
Deployment Service
        │
        ├── deployment.created
        ├── deployment.completed
        ▼

Runtime Service
        │
        ├── runtime.started
        ├── runtime.restarted
        ├── health.failed
        ▼

OpenTelemetry Collector
        │
        ▼

AgentOps Service
        │
        ▼

Dashboard
```

---

# Future Scope

- Multi-cloud monitoring
- Kubernetes metrics
- Alerting
- Slack/Discord notifications
- Prometheus integration
- Grafana dashboards
- Optional AI execution telemetry
- Cost analytics with provider usage data