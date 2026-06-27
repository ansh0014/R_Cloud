# 10 - Frontend Architecture

> User Interface and Dashboard Architecture for R Agent Cloud

---

# Overview

The Frontend is the primary interface through which users interact with R Agent Cloud.

It provides a centralized dashboard for managing AI applications throughout their lifecycle.

Users can:

- Create Projects
- Connect GitHub Repositories
- Deploy AI Applications
- Monitor Runtime Health
- View Deployment History
- Manage Runtimes
- View Agent Registry
- Monitor AgentOps
- Configure Account Settings

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js | Frontend Framework |
| React | UI Library |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| TanStack Query | API State Management |
| Zustand | Client State |
| WebSocket | Real-time Updates |
| Recharts | Analytics Charts |

---

# Frontend Architecture

```text
                    User
                      │
                      ▼
                 Next.js App
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
    REST APIs     WebSockets     Authentication
        │             │              │
        └─────────────┼──────────────┘
                      ▼
                 API Gateway
```

---

# Pages

## Authentication

```
/login

/register

/forgot-password
```

---

## Dashboard

```
/
```

Displays

- Total Projects
- Running Deployments
- Active Runtimes
- Runtime Health
- Deployment Activity

---

## Projects

```
/projects
```

Features

- Create Project
- Delete Project
- Connect GitHub
- View Repository
- Deployment Status

---

## Project Details

```
/projects/:id
```

Displays

- Repository
- Branch
- Deployment History
- Runtime
- Agent Metadata
- Runtime URL

Actions

- Deploy
- Redeploy
- Delete

---

## Deployments

```
/deployments
```

Displays

- Deployment ID
- Status
- Version
- Runtime
- Timestamp

Actions

- Redeploy
- Restart Runtime
- Delete

---

## Runtime Management

```
/runtimes
```

Displays

- Runtime URL
- Runtime Status
- Health
- Provider
- Version
- Uptime

Actions

- Restart
- Stop
- Delete

---

## Agent Registry

```
/agents
```

Displays

- Agent Name
- Framework
- Version
- Capabilities
- Runtime
- Deployment

---

## Agent Details

```
/agents/:id
```

Displays

- Framework
- Version
- Runtime Contract
- Metadata
- Runtime Health
- Deployment History

---

## AgentOps Dashboard

```
/agentops
```

Displays

### Runtime Health

- Healthy
- Starting
- Failed
- Stopped

---

### Runtime Metrics

- Total Requests
- Success Rate
- Failure Rate
- Average Latency
- Runtime Uptime

---

### Deployments

- Successful
- Failed
- Running
- Pending

---

### Runtime Logs

Live logs streamed through WebSockets.

---

### Deployment History

Timeline of all deployments.

---

### Traces

OpenTelemetry traces

- Gateway
- Deployment
- Runtime
- AgentOps

---

## Settings

```
/settings
```

Manage

- Profile
- GitHub Connection
- API Keys
- Preferences

---

# UI Components

## Sidebar

Navigation

- Dashboard
- Projects
- Deployments
- Runtimes
- Agents
- AgentOps
- Settings

---

## Top Navigation

Contains

- Search
- Notifications
- User Profile
- Theme Toggle

---

## Deployment Card

Displays

- Project Name
- Version
- Runtime
- Status
- Deploy Time

---

## Runtime Card

Displays

- Runtime URL
- Health
- Uptime
- Restart Count

Buttons

- Restart
- Stop
- Delete

---

## Agent Card

Displays

- Agent Name
- Framework
- Version
- Capabilities

---

## Metrics Cards

Examples

```
Running Runtimes

24
```

```
Average Latency

210 ms
```

```
Success Rate

99.6%
```

```
Deployments

152
```

---

# Real-Time Updates

The dashboard connects to

```
/ws
```

Events

```
deployment.started

deployment.completed

runtime.started

runtime.restarted

runtime.failed

health.changed

logs.updated

metrics.updated
```

UI updates automatically without refresh.

---

# Deployment Workflow

```text
Create Project

↓

Connect GitHub

↓

Deploy

↓

Deployment Progress

↓

Runtime Ready

↓

Monitor Agent
```

---

# Runtime Workflow

```text
Deployment

↓

Runtime Created

↓

Health Check

↓

Running

↓

AgentOps Dashboard
```

---

# Responsive Design

Supports

- Desktop
- Tablet
- Mobile

---

# Theme

Supports

- Light Theme
- Dark Theme

---

# Error Handling

User-friendly pages for

- 404
- Unauthorized
- Deployment Failed
- Runtime Failed
- Network Errors

Toast notifications for

- Deployment Started
- Deployment Completed
- Runtime Restarted
- Runtime Failed

---

# API Integration

Uses REST APIs

```
GET /projects

GET /deployments

GET /runtimes

GET /agents

GET /agentops/dashboard
```

Real-time updates use

```
WebSocket

/ws
```

---

# Dashboard Overview

```text
---------------------------------------------------

Projects            Running Runtimes

Deployments         Runtime Health

-----------------------------------

Runtime Metrics

• Success Rate

• Average Latency

• Runtime Uptime

-----------------------------------

Deployment Timeline

-----------------------------------

Live Runtime Logs

-----------------------------------

OpenTelemetry Traces

---------------------------------------------------
```

---

# Future Enhancements

- Team Collaboration
- Deployment Rollback UI
- Multi-Cloud Runtime Selection
- Kubernetes Dashboard
- Cost Analytics
- AI Chat Assistant
- Notification Center
- Mobile Application

---

# Summary

The frontend provides a centralized **AgentOps dashboard** for managing AI applications throughout their lifecycle.

Users can:

- Manage Projects
- Connect GitHub
- Deploy AI Applications
- Monitor Runtime Health
- Manage Runtimes
- View Agent Registry
- Analyze Deployments
- Monitor AgentOps
- View Logs and Traces

The UI communicates with backend services through REST APIs and WebSockets, providing a responsive and real-time operational experience.