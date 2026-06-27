# 06 - Database Design

# Overview

The Database Layer is responsible for storing and managing all persistent platform data within **R Agent Cloud**.

The platform follows a **polyglot persistence architecture**, where each database is optimized for a specific workload.

The database layer stores:

- Platform Metadata
- Agent Registry
- Runtime Registry
- Deployment History
- User Information
- Authentication
- Observability Metadata
- Runtime State
- Caching
- AI Knowledge (Optional)

---

# Database Architecture

R Agent Cloud uses three storage technologies.

| Database | Purpose |
|----------|---------|
| PostgreSQL | Primary transactional database |
| Oracle Database 23ai | AI Knowledge Base & Vector Search (Optional Platform Feature) |
| Redis | Cache, Sessions, Runtime State, Queues |

---

# Architecture

```text
                    API Gateway
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
 Deployment Service  Runtime Service  AgentOps Service
         │               │                │
         └───────────────┼────────────────┘
                         ▼
                   PostgreSQL
                         │
         ┌───────────────┼──────────────┐
         ▼                              ▼
      Redis                    Oracle 23ai
```

---

# PostgreSQL

PostgreSQL is the primary database of the platform.

It stores all business and platform metadata.

## User Management

- Users
- Organizations
- Teams
- API Keys
- Authentication Metadata

---

## Project Management

- Projects
- GitHub Repositories
- Repository Metadata
- Branch Information

---

## Agent Registry

Stores information about deployed AI applications.

Example

```
Agent ID

Agent Name

Framework

Repository

Version

Capabilities

Owner
```

---

## Runtime Registry

Stores runtime information.

Example

```
Runtime ID

Deployment ID

Runtime URL

Provider

Status

Health

Created At

Updated At
```

---

## Deployment Management

Stores

- Deployments
- Deployment Versions
- Commit Hash
- Branch
- Deployment Status
- Deployment History

---

## Runtime Metadata

Stores

- Runtime URL
- Public Endpoint
- Runtime Status
- Runtime Health
- Restart Count

---

## AgentOps Metadata

Stores

- Runtime Logs
- Request Metadata
- Deployment Events
- Runtime Events
- Health Events
- Trace Metadata

---

## Audit Logs

Stores

- User Actions
- Deployment Actions
- Runtime Actions
- Authentication Logs

---

# Oracle Database 23ai

Oracle Database 23ai is used as an **optional AI service**.

Unlike PostgreSQL, Oracle is **not required for every deployment**.

It is used only when platform-managed AI capabilities are enabled.

Examples

- Platform Knowledge Base
- Semantic Search
- Documentation Search
- Enterprise Search
- Vector Similarity Search

Future Features

- Platform-wide RAG
- AI Documentation Assistant
- Intelligent Agent Discovery
- Knowledge Retrieval

Example

```
Documents

↓

Embeddings

↓

Oracle 23ai

↓

Semantic Search

↓

Relevant Context
```

**Note**

User-deployed agents manage their own vector databases and memory. The platform does not automatically store user embeddings.

---

# Redis

Redis provides high-speed in-memory storage.

Responsibilities

- Session Storage
- Authentication Cache
- API Rate Limiting
- Runtime Cache
- Runtime State
- Deployment Queue
- WebSocket State
- Temporary Tokens
- Distributed Locks

---

# Database Responsibilities

| Service | Database |
|----------|----------|
| API Gateway | PostgreSQL, Redis |
| Deployment Service | PostgreSQL, Redis |
| Runtime Service | PostgreSQL, Redis |
| AgentOps Service | PostgreSQL, Redis |
| Dashboard | PostgreSQL |
| AI Knowledge Service | Oracle 23ai |

---

# High-Level Database Flow

```text
User

↓

API Gateway

↓

PostgreSQL

↓

Deployment Service

↓

Runtime Service

↓

Railway

↓

AgentOps

↓

Dashboard
```

Redis is used throughout the platform for caching and temporary runtime state.

Oracle 23ai is used only for platform AI capabilities.

---

# Why Polyglot Persistence?

Different workloads require different storage technologies.

| Workload | Database |
|----------|----------|
| Users | PostgreSQL |
| Projects | PostgreSQL |
| Agent Registry | PostgreSQL |
| Runtime Registry | PostgreSQL |
| Deployments | PostgreSQL |
| Deployment History | PostgreSQL |
| Runtime Metadata | PostgreSQL |
| AgentOps Metadata | PostgreSQL |
| Sessions | Redis |
| Runtime Cache | Redis |
| Rate Limiting | Redis |
| Deployment Queue | Redis |
| WebSocket State | Redis |
| Platform Knowledge Base | Oracle 23ai |
| Semantic Search | Oracle 23ai |
| Vector Search | Oracle 23ai |

---

# Scalability

The database architecture allows each storage engine to scale independently.

- PostgreSQL → Transactional metadata
- Redis → High-speed cache and runtime state
- Oracle Database 23ai → AI search and vector operations

This separation improves performance, maintainability, and future scalability while keeping the platform modular.

---

# Future Enhancements

- Multi-region PostgreSQL Replication
- Redis Cluster
- Read Replicas
- Database Backups
- Automatic Failover
- Time-Series Metrics Database
- Data Warehouse for Analytics
- AI Knowledge Graph