]# AI Runtime & Agent Architecture

> AI Runtime Architecture for R Agent Cloud

---

# Overview

The AI Runtime is responsible for executing AI applications deployed through R Agent Cloud.

The platform itself does not implement the AI logic.

Developers are free to build using:

- LangGraph
- CrewAI
- AutoGen
- Semantic Kernel
- Pure FastAPI
- Any Python Framework

As long as the application follows the Runtime Contract.

---

# Responsibilities

The AI Application is responsible for:

- Agent Execution
- Multi-Agent Workflows
- LLM Calls
- Tool Calling
- Memory
- RAG
- Prompt Engineering
- Business Logic

The platform is responsible for:

- Deployment
- Runtime Management
- Health Monitoring
- Runtime Registration
- Endpoint Management
- Agent Registry
- AgentOps

---

# Runtime Contract

Every AI application exposes the following endpoints.

```
POST /execute

POST /stream

GET /health

GET /metadata
```

---

# Endpoint Description

## POST /execute

Execute the AI application.

Request

```json
{
    "input":"Research latest AI trends"
}
```

Response

```json
{
    "output":"..."
}
```

---

## POST /stream

Returns streaming responses.

---

## GET /health

Returns runtime health.

Example

```json
{
    "status":"healthy"
}
```

---

## GET /metadata

Returns application metadata.

Example

```json
{
    "name":"Research Agent",
    "framework":"LangGraph",
    "version":"1.0.0",
    "capabilities":[
        "chat",
        "rag"
    ]
}
```

---

# AI Application Structure

Example

```
customer-support/

├── app.py
├── requirements.txt
├── ragent.yaml
├── agents/
├── prompts/
├── tools/
├── memory/
└── workflows/
```

---

# Supported Frameworks

- LangGraph
- CrewAI
- AutoGen
- Semantic Kernel
- Pure Python

---

# Single Agent Deployment

```
User

↓

Execute

↓

AI Agent

↓

LLM

↓

Response
```

---

# A2A (Agent-to-Agent) Deployment

A repository can contain multiple collaborating agents.

Example

```
                Client
                   │
                   ▼
              POST /execute
                   │
                   ▼
            Planner Agent
              /         \
             ▼           ▼
   Research Agent   Database Agent
             \         /
              ▼       ▼
          Reviewer Agent
                   │
                   ▼
            Final Response
```

The client never communicates with individual agents.

Only the Runtime Contract is exposed.

---

# Example A2A Repository

```
customer-support/

├── planner.py
├── researcher.py
├── reviewer.py
├── app.py
└── ragent.yaml
```

---

# Example ragent.yaml

```yaml
application:
  name: customer-support
  mode: microservices

agents:

  - id: planner
    entrypoint: planner.py

  - id: researcher
    entrypoint: researcher.py

  - id: reviewer
    entrypoint: reviewer.py

workflow:

  planner:
    - researcher

  researcher:
    - reviewer

routes:

  execute: /execute

  stream: /stream

  health: /health

  metadata: /metadata
```

---

# Deployment Mode Detection via ragent.yaml

Your Deployment Service should parse `ragent.yaml` during AI Project Validation and use `application.mode` to determine deployment structure.

Supported values:

- `monolith` — deploy a single Railway service instance for the whole application.
- `microservices` — provision a separate Railway service instance for each agent under `agents` and use each agent's `entrypoint` as that container's startup command.

## Monolith Config Example

```yaml
application:
  name: support-system
  mode: monolith
  entrypoint: app.py

routes:
  execute: /execute
  stream: /stream
  health: /health
```

## Microservices Config Example

```yaml
application:
  name: support-system
  mode: microservices

agents:
  - id: planner
    entrypoint: planner.py
  - id: researcher
    entrypoint: researcher.py
  - id: reviewer
    entrypoint: reviewer.py

routes:
  execute: /execute
  stream: /stream
  health: /health
```

## How the Runtime Service Handles the Flow

When the user attaches their GitHub repo and clicks Deploy:

1. Clone the repo and parse `ragent.yaml`.
2. If `mode: monolith`, send a single build/deploy instruction to the Runtime Service.
3. If `mode: microservices`, loop over each entry in `agents` and provision a distinct Railway service instance with the agent's `entrypoint` as the container startup command.

---

# Frontend Preview UX

Use the frontend to preview the detected deployment mode instead of only showing a blind button.

1. User pastes the GitHub repo link.
2. Backend analyzes `ragent.yaml` in the background.
3. Frontend displays a confirmation card such as:

> 📦 **Deployment Mode Detected: Microservices**
> *Your configuration specifies deploying 3 separate agent services (Planner, Researcher, Reviewer) on Railway. Estimated resource usage: 3 containers.*

This makes deployment decisions visible and aligned with the actual repo structure.

---

# Execution Flow

```
Client

↓

POST /execute

↓

Planner

↓

Research

↓

Reviewer

↓

Response
```

---

# Tool Calling

Tools are implemented inside the application.

Example

```
User

↓

Planner

↓

Search Tool

↓

Calculator

↓

Database

↓

Response
```

---

# Memory

Applications may implement

- Conversation Memory
- Long-Term Memory
- Session Memory

---

# RAG

Applications may implement

```
Documents

↓

Embeddings

↓

Vector Database

↓

Retriever

↓

LLM
```

---

# Metadata

Every application provides metadata through

```
GET /metadata
```

Example

```
Application

Framework

Version

Capabilities

Owner

Runtime Version
```

The platform stores this in the Agent Registry.

---

# Health Checks

The Runtime Service periodically calls

```
GET /health
```

Possible states

- Healthy
- Starting
- Unhealthy
- Stopped

---

# AI Runtime Lifecycle

```
Repository

↓

Deployment

↓

Runtime Started

↓

Health Check

↓

Runtime Registered

↓

Ready

↓

Execute Requests

↓

Runtime Monitoring
```

---

# Future Scope

- Multi-LLM Support
- MCP Support
- Multi-Cloud Runtime
- Agent Versioning
- Runtime Rollback
- Auto Scaling