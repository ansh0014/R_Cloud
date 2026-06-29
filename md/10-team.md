# 09 - Team Architecture

# Overview

R Agent Cloud is developed by two independent teams working on different layers of the platform.

The separation ensures clear ownership, modular development, and parallel implementation.

The two teams are:

- Platform Team
- AI Runtime Team

---

# High-Level Architecture

```text
                    R Agent Cloud

        ┌──────────────────────────────────┐
        │          Platform Team           │
        └──────────────────────────────────┘
                     │
                     ▼
        API Gateway
        Deployment Service
        Runtime Service
        AgentOps Service
        Database
        Frontend
        DevOps
                     │
                     ▼
        ┌──────────────────────────────────┐
        │         AI Runtime Team          │
        └──────────────────────────────────┘
                     │
                     ▼
        Runtime Engine
        Workflow Engine
        Agent Execution
        Tool Runtime
        Memory
        RAG
        LLM Integration
```

---

# Platform Team

The Platform Team develops the cloud platform that deploys, manages, and operates AI applications.

## Responsibilities

### Backend

- API Gateway
- REST APIs
- gRPC APIs
- WebSocket APIs
- Authentication
- Authorization

---

### Deployment

- GitHub Integration
- Repository Cloning
- ragent.yaml Validation
- AI Project Validation
- Deployment Orchestration
- Version Management
- Deployment History

---

### Runtime Service

Responsible for runtime lifecycle.

Functions

- Deploy Runtime
- Restart Runtime
- Stop Runtime
- Delete Runtime
- Runtime Registry
- Runtime Discovery
- Endpoint Generation
- Health Monitoring
- Railway Integration

---

### AgentOps

Responsible for

- Runtime Monitoring
- Deployment Monitoring
- Runtime Logs
- Runtime Metrics
- OpenTelemetry
- Dashboard APIs
- Health Checks
- Deployment Analytics

---

### Database

Manage

- PostgreSQL
- Redis
- Oracle Database 23ai
- Agent Registry
- Runtime Registry
- Deployment History

---

### Frontend

Develop

- Dashboard
- Projects
- Deployments
- Runtime Management
- Agent Registry
- AgentOps Dashboard
- Settings

---

### DevOps

Manage

- Cloudflare
- Railway
- CI/CD
- Monitoring
- Security
- Infrastructure

---

# AI Runtime Team

The AI Runtime Team develops the reusable AI execution engine used by R Agent Cloud.

This team is **not** building the cloud platform.

They are building the runtime that executes AI workflows.

---

## Runtime Engine

Develop

- AI Request Processing
- Runtime Execution
- Session Management
- Context Management

---

## Workflow Engine

Support

- LangGraph
- Sequential Execution
- Parallel Execution
- Conditional Routing
- Multi-Agent Workflows

---

## A2A Communication

Implement

- Agent-to-Agent Communication
- Message Passing
- Workflow Coordination
- State Sharing

---

## Agent Execution

Responsible for

- Planner Agent
- Research Agent
- Reviewer Agent
- Executor Agent

---

## Tool Runtime

Implement

- Tool Registry
- Tool Execution
- Search Tools
- Database Tools
- External APIs

---

## LLM Layer

Integrate

- OpenAI
- Anthropic
- Gemini
- Ollama

Manage

- Prompt Templates
- Model Configuration
- Context Injection

---

## Memory Layer

Implement

- Session Memory
- Conversation Memory
- Context Management

---

## RAG Layer

Implement

- Document Retrieval
- Embedding Search
- Knowledge Loading
- Context Retrieval

---

## Runtime Contract

Implement

```http
POST /execute

POST /stream

GET /health

GET /metadata
```

Every deployed runtime follows this standard.

---

## Runtime Metadata

Return

```json
{
  "name":"Customer Support Runtime",
  "framework":"LangGraph",
  "version":"1.0.0",
  "capabilities":[
      "a2a",
      "rag",
      "streaming"
  ]
}
```

---

# Team Communication

```text
Platform Team

↓

Deployment Service

↓

Runtime Service

↓

AI Runtime

↓

Response

↓

AgentOps
```

The Platform Team never implements AI workflows.

The AI Runtime Team never manages deployment infrastructure.

---

# Ownership Matrix

| Component | Platform Team | AI Runtime Team |
|------------|:------------:|:---------------:|
| API Gateway | ✅ | ❌ |
| Authentication | ✅ | ❌ |
| Deployment Service | ✅ | ❌ |
| Runtime Service | ✅ | ❌ |
| Railway Integration | ✅ | ❌ |
| AgentOps | ✅ | ❌ |
| Database | ✅ | ❌ |
| Frontend | ✅ | ❌ |
| DevOps | ✅ | ❌ |
| Runtime Engine | ❌ | ✅ |
| Workflow Engine | ❌ | ✅ |
| LangGraph | ❌ | ✅ |
| A2A Communication | ❌ | ✅ |
| Agent Execution | ❌ | ✅ |
| Tool Runtime | ❌ | ✅ |
| Memory | ❌ | ✅ |
| RAG | ❌ | ✅ |
| LLM Integration | ❌ | ✅ |
| Runtime Contract | ❌ | ✅ |

---

# Development Workflow

```text
AI Runtime Team
        │
        ├── Build Runtime Engine
        ├── Implement Workflows
        ├── Tool Runtime
        ├── RAG
        └── Runtime Contract
               │
               ▼
Platform Team
        │
        ├── Validate Project
        ├── Deploy Runtime
        ├── Register Runtime
        ├── Monitor Runtime
        └── AgentOps Dashboard
```

---

# Summary

The Platform Team is responsible for the cloud platform, deployment, runtime management, security, monitoring, and operations.

The AI Runtime Team is responsible for the reusable AI execution engine, workflow execution, agent orchestration, LLM integration, tool execution, memory, and RAG.

Together, both teams build the complete R Agent Cloud platform.