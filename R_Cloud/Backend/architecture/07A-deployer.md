# 08 — Deployment Planner

> Converts a validated AI project into an infrastructure-specific deployment plan.

---

# Overview

The Deployment Planner is responsible for translating a validated AI project into a provider-specific deployment plan.

It does **not** clone repositories.

It does **not** communicate with Railway.

It does **not** provision infrastructure.

Its only responsibility is to understand the validated project and determine **how it should be deployed**.

The Deployment Planner is currently responsible for generating deployment plans for **Railway**.

In the future, additional providers such as Render, Kubernetes, or AWS ECS can be supported by implementing new provider adapters.

---

# Responsibilities

* Receive a validated project configuration
* Determine deployment mode
* Generate deployment strategy
* Generate build command
* Generate start command
* Resolve environment variables
* Generate provider-specific configuration
* Build DeploymentPlan
* Return DeploymentPlan to the Deployment Service

---

# Non Responsibilities

The Deployment Planner does **NOT**:

* Clone repositories
* Validate repositories
* Parse GitHub repositories
* Deploy applications
* Call Railway APIs
* Call Runtime Service
* Publish NATS events
* Store deployment history
* Monitor runtimes

---

# Inputs

The Deployment Planner receives a validated project.

Example

```go
type ValidationResult struct {
    Valid  bool
    Config RagentConfig
    Errors []ValidationError
}
```

The planner assumes the project has already passed all validation checks.

---

# Output

The planner returns a DeploymentPlan.

```go
type DeploymentPlan struct {
    Provider      string
    Mode          string
    Runtime       string
    Framework     string

    BuildCommand  string
    StartCommand  string

    Environment   map[string]string

    Services       []ServicePlan
}
```

---

# ServicePlan

For microservice deployments each agent becomes an independent service.

```go
type ServicePlan struct {
    Name           string
    Entrypoint     string
    ExecuteRoute   string
    HealthRoute    string
    MetadataRoute  string
}
```

---

# Planning Flow

```text
ValidationResult

↓

Read Application Configuration

↓

Determine Provider

↓

Determine Deployment Mode

↓

Generate Build Command

↓

Generate Start Command

↓

Resolve Environment Variables

↓

Create DeploymentPlan

↓

Return DeploymentPlan
```

---

# Deployment Modes

## Monolith

Entire application is deployed as a single Railway service.

Example

```yaml
application:
  mode: monolith
```

Deployment Plan

```text
Railway Service

↓

Customer Support Application

↓

Single Public URL
```

---

## Microservices

Each AI Agent becomes an independent Railway service.

Example

```yaml
application:
  mode: microservices
```

Deployment Plan

```text
Planner Agent

↓

Research Agent

↓

Reviewer Agent

↓

Independent Railway Services
```

---

# Provider Adapter

The planner should never hardcode infrastructure logic.

Instead it delegates provider-specific planning to a provider adapter.

```text
Deployment Planner

↓

Railway Provider Adapter

↓

DeploymentPlan
```

Future

```text
Deployment Planner

├── Railway Adapter

├── Render Adapter

├── Kubernetes Adapter

└── AWS ECS Adapter
```

---

# Railway Planning

For Railway the planner determines

* Build Command
* Start Command
* Runtime Language
* Deployment Mode
* Environment Variables
* Service Names

Example

Input

```yaml
application:
  runtime: python
  framework: fastapi
```

Output

```text
Provider

Railway

Build Command

pip install -r requirements.txt

Start Command

uvicorn app:app
```

---

# Build Command Generation

Examples

## Python

```
pip install -r requirements.txt
```

---

## Node.js

```
npm install
```

---

## Go

```
go build -o app .
```

---

# Start Command Generation

Examples

## Python

```
uvicorn app:app
```

---

## Node.js

```
npm start
```

---

## Go

```
./app
```

---

# Environment Resolution

The planner resolves all environment variables required by the deployment.

Example

```yaml
environment:
  OPENAI_API_KEY:
  REDIS_URL:
```

The generated DeploymentPlan contains the environment configuration expected by the Runtime Service.

---

# Communication

```text
Deployment Service

↓

Validation Service

↓

ValidationResult

↓

Deployment Planner

↓

DeploymentPlan

↓

Deployment Service
```

The Runtime Service never communicates with the planner directly.

---

# Runtime Interaction

The Deployment Service sends the DeploymentPlan to the Runtime Service through gRPC.

```text
Deployment Service

↓

CreateRuntime(DeploymentPlan)

↓

Runtime Service
```

The Runtime Service does not read repositories or parse configuration files.

It only executes the DeploymentPlan.

---

# Extensibility

The planner is designed to support multiple infrastructure providers.

Only the provider adapter changes.

The Deployment Service, Validation Service, and Runtime Service remain unchanged.

```text
ValidationResult

↓

Deployment Planner

├── Railway

├── Render

├── Kubernetes

└── AWS ECS
```

---

# Design Principles

* Single responsibility
* Infrastructure-independent architecture
* Provider abstraction
* Stateless planning
* Deterministic deployment generation
* Runtime-agnostic execution
* Extensible provider adapters
* Validation before planning
* Planning before deployment
* One DeploymentPlan represents one deployable application
