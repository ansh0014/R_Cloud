# Backend Architecture

> **Control Plane Architecture for R Agent Cloud**

---

# Overview

R Agent Cloud is a **control plane** built on top of **Railway**.

The platform is responsible for understanding AI projects, validating them, planning deployments, orchestrating runtime creation, and monitoring deployed applications.

R Agent Cloud **does not replace Railway**.

Instead, Railway acts as the infrastructure provider responsible for building, hosting, networking, and running the AI applications.

The backend never executes AI logic.

All AI applications execute inside isolated Railway runtimes.

---

# Responsibilities

The backend is responsible for:

* Authentication
* Project Management
* GitHub Integration
* Repository Validation
* Deployment Planning
* Deployment Orchestration
* Runtime Orchestration
* Runtime Registry
* Agent Registry
* Notifications
* AgentOps
* Observability

---

# Non Responsibilities

The backend is **NOT** responsible for:

* Building containers
* Running containers
* Networking
* Public URLs
* Infrastructure provisioning
* Load balancing
* Container scheduling

These responsibilities belong to Railway.

---

# High Level Architecture

```text
                                  Client
                                     │
                                     ▼
                               API Gateway
                                     │
        ┌──────────────┬─────────────┴──────────────┐
        ▼              ▼                            ▼
 Authentication   Project Service          Deployment Service
                                                │
                                                │ Clone Repository
                                                ▼
                                        Validation Service
                                                │
                              ┌─────────────────┤
                              │ FAIL             │ PASS
                              ▼                 ▼
                         Return Errors    ┌─────┴───────────────────┐
                         to User          │                         │
                         (retry loop)     │ (parallel, async)       │ (main path)
                                          ▼                         ▼
                                 AI Validation Agent        Deployment Planner
                                 (advisory only)                    │
                                          │                  DeploymentPlan
                                 Report → User Dashboard            │
                                                               gRPC Request
                                                                    ▼
──────────────────────────────────────────────────────────────────────────────
                    Runtime Service (runtime-service)
──────────────────────────────────────────────────────────────────────────────
                                                │
                                                ▼
                                           Railway API
                                                │
                                                ▼
                                             Railway
                                                │
                                                ▼
                                     AI Application Runtime
                                                │
                                   /execute  /health  /metadata

──────────────────────────────────────────────────────────────────────────────

Notification Service   ←────── NATS ──────→   AgentOps Service

                 PostgreSQL (Platform)

                 PostgreSQL (Authentication)

                 Redis

                 OpenTelemetry
```                  AI Application Runtime
                                                │
                                   /execute  /health  /metadata

──────────────────────────────────────────────────────────────────────────────

Notification Service   ←────── NATS ──────→   AgentOps Service

                 PostgreSQL (Platform)

                 PostgreSQL (Authentication)

                 Redis

                 OpenTelemetry
```

---

# Backend Components

| Component              | Responsibility                                              |
| ---------------------- | ----------------------------------------------------------- |
| API Gateway            | Public entry point for every request                        |
| Authentication Service | Login, JWT, API Keys, Users                                 |
| Project Service        | GitHub repositories and project metadata                    |
| Deployment Service     | Deployment orchestration                                    |
| Validation Service     | Deterministic repository validation (blocks on failure)     |
| AI Validation Agent    | Advisory repository analysis (never blocks, async)          |
| Deployment Planner     | Generates Deployment Plans                                  |
| Runtime Service        | Runtime lifecycle management                                |
| Notification Service   | Email and WebSocket notifications                           |
| AgentOps Service       | Metrics, logs, traces and analytics                         |

---

# Control Plane Flow

```text
User

↓

API Gateway

↓

Deployment Service

↓

Clone GitHub Repository

↓

Validation Service

↓

ValidationResult

┌─────────────────────────────────┤
│ FAIL                            │ PASS
▼                                 │
Return errors to User             ├──────────────────────────────────────┐
(User fixes repo and retries)     │ (main path)              (async)     │
                                  ▼                                      ▼
                          Deployment Planner                  AI Validation Agent
                                  │                          (advisory, non-blocking)
                          DeploymentPlan                               │
                                  │                          Report → User Dashboard
                          gRPC

↓

Runtime Service

↓

Railway API

↓

Railway

↓

Public Runtime URL

↓

Health Monitoring

↓

Agent Registry

↓

AgentOps
```

---

# Deployment Lifecycle

## Step 1

The client requests a deployment.

```text
POST /deployments
```

↓

API Gateway

↓

Deployment Service

---

## Step 2

Deployment Service

* Creates deployment record
* Publishes deployment.created
* Clones GitHub repository

---

## Step 3

Repository is sent to Validation Service.

Validation Service

* Parses ragent.yaml
* Validates repository
* Validates workflow
* Validates endpoints
* Validates entrypoints

If validation fails, errors are returned to the user.

User fixes the repository and retries from Step 1.

If validation passes, returns

```text
ValidationResult
```

---

## Step 4

Two things happen in parallel after validation passes.

**Main path (blocking):**

Deployment Planner receives ValidationResult.

Planner generates

```text
DeploymentPlan
```

The planner decides

* Deployment mode
* Build command
* Start command
* Environment variables
* Provider configuration

**Async path (non-blocking):**

AI Validation Agent receives the repository path.

The AI agent runs repository analysis and sends a report to the User Dashboard.

The AI agent never blocks or delays deployment.

If the AI agent is unavailable, deployment continues without it.

---

## Step 5

Deployment Service receives

```text
DeploymentPlan
```

Updates deployment state

```text
DEPLOYING
```

Calls Runtime Service using gRPC.

---

# gRPC Architecture

Only one synchronous communication exists inside the platform.

```text
Deployment Service
        │
        │
        │ DeploymentPlan
        │
        ▼
Runtime Service
```

The Runtime Service **never** receives:

* ragent.yaml
* Repository
* GitHub URL
* Source code

The Runtime Service only receives a DeploymentPlan.

---

# Runtime Flow

Runtime Service receives

```text
DeploymentPlan
```

↓

Converts the DeploymentPlan into Railway API requests.

↓

Creates Railway project.

↓

Creates Railway service.

↓

Configures build settings.

↓

Configures start command.

↓

Configures environment variables.

↓

Starts deployment.

↓

Waits for build completion.

↓

Receives Runtime URL.

↓

Registers runtime.

↓

Publishes runtime.started.

---

# Railway Responsibilities

Railway is responsible for

* Building application
* Running containers
* Public networking
* HTTPS
* Container lifecycle
* Infrastructure
* Resource allocation
* Deployment execution

R Agent Cloud never performs these tasks itself.

---

# Communication Overview

```text
REST

Client

↓

API Gateway

↓

Deployment Service

──────────────────────────────────────

REST (blocking)

Deployment Service

↓

Validation Service

  If FAIL → errors returned to user → retry loop
  If PASS → continue

──────────────────────────────────────

REST (async, fire-and-forget)

Deployment Service

↓

AI Validation Agent

↓

Report → User Dashboard

(never blocks deployment)

──────────────────────────────────────

REST (blocking)

Deployment Service

↓

Deployment Planner

──────────────────────────────────────

gRPC (blocking)

Deployment Service

↓

Runtime Service

──────────────────────────────────────

REST HTTPS

Runtime Service

↓

Railway API
```

---

# Design Principles

* Single responsibility per service
* Validation before planning
* Planning before deployment
* Deployment before runtime creation
* Validation failure returns errors to user and stops deployment
* AI Validation Agent is advisory only and never blocks deployment
* AI Validation Agent runs async after validation passes
* Runtime Service never parses repositories
* Validation Service never communicates with Railway
* Deployment Planner owns provider-specific deployment logic
* Deployment Service orchestrates the deployment lifecycle
* Runtime Service is the only backend service allowed to communicate with Railway
* Railway remains the infrastructure provider
* NATS is used for asynchronous communication
* gRPC is used only between Deployment Service and Runtime Service
* OpenTelemetry provides distributed tracing across all backend services



> **Control Plane Architecture for R Agent Cloud**






R Agent Cloud is a **control plane** built on top of **Railway**.



The platform is responsible for understanding AI projects, validating them, planning deployments, orchestrating runtime creation, and monitoring deployed applications. 

 

R Agent Cloud **does not replace Railway**. 

 

Instead, Railway acts as the infrastructure provider responsible for building, hosting, networking, and running the AI applications.



The backend never executes AI logic.



All AI applications execute inside isolated Railway runtimes.



---



# Responsibilities



The backend is responsible for:



* Authentication

* Project Management

* GitHub Integration

* Repository Validation

* Deployment Planning

* Deployment Orchestration

* Runtime Orchestration

* Runtime Registry

* Agent Registry

* Notifications

* AgentOps

* Observability



---



# Non Responsibilities



The backend is **NOT** responsible for:



* Building containers

* Running containers

* Networking

* Public URLs

* Infrastructure provisioning

* Load balancing

* Container scheduling



These responsibilities belong to Railway.



---



# High Level Architecture



```text

                                  Client

                                     │

                                     ▼

                              API Gateway

                                     │

        ┌──────────────┬─────────────┴──────────────┐

        ▼              ▼                            ▼

 Authentication   Project Service          Deployment Service

                                                │

                                                │ Clone Repository

                                                ▼

                                        Validation Service

                                                │

                                         ValidationResult

                                                │

                                                ▼

                                        Deployment Planner

                                                │

                                         DeploymentPlan

                                                │

                                           gRPC Request

                                                ▼

──────────────────────────────────────────────────────────────────────────────

                    Runtime Service (Ai-Agent/runtime-service)

──────────────────────────────────────────────────────────────────────────────

                                                │

                                                ▼

                                           Railway API

                                                │

                                                ▼

                                             Railway

                                                │

                                                ▼

                                     AI Application Runtime

                                                │

                                   /execute  /health  /metadata



──────────────────────────────────────────────────────────────────────────────



Notification Service   ←────── NATS ──────→   AgentOps Service



                 PostgreSQL (Platform)



                 PostgreSQL (Authentication)



                 Redis



                 OpenTelemetry

```



---



# Backend Components



| Component              | Responsibility                           |

| ---------------------- | ---------------------------------------- |

| API Gateway            | Public entry point for every request     |

| Authentication Service | Login, JWT, API Keys, Users              |

| Project Service        | GitHub repositories and project metadata |

| Deployment Service     | Deployment orchestration                 |

| Validation Service     | Repository validation                    |

| Deployment Planner     | Generates Deployment Plans               |

| Runtime Service        | Runtime lifecycle management             |

| Notification Service   | Email and WebSocket notifications        |

| AgentOps Service       | Metrics, logs, traces and analytics      |



---



# Control Plane Flow



```text

User



↓



API Gateway



↓



Deployment Service



↓



Clone GitHub Repository



↓



Validation Service



↓



ValidationResult



↓



Deployment Planner



↓



DeploymentPlan



↓



gRPC



↓



Runtime Service



↓



Railway API



↓



Railway



↓



Public Runtime URL



↓



Health Monitoring



↓



Agent Registry



↓



AgentOps

```



---



# Deployment Lifecycle



## Step 1



The client requests a deployment.



```text

POST /deployments

```



↓



API Gateway



↓



Deployment Service



---



## Step 2



Deployment Service



* Creates deployment record

* Publishes deployment.created

* Clones GitHub repository



---



## Step 3



Repository is sent to Validation Service.



Validation Service



* Parses ragent.yaml

* Validates repository

* Validates workflow

* Validates endpoints

* Validates entrypoints



Returns



```text

ValidationResult

```



---



## Step 4



Deployment Planner receives



```text

ValidationResult

```



Planner generates



```text

DeploymentPlan

```



The planner decides



* Deployment mode

* Build command

* Start command

* Environment variables

* Provider configuration



---



## Step 5



Deployment Service receives



```text

DeploymentPlan

```



Updates deployment state



```text

DEPLOYING

```



Calls Runtime Service using gRPC.



---



# gRPC Architecture



Only one synchronous communication exists inside the platform.



```text

Deployment Service

        │

        │

        │ DeploymentPlan

        │

        ▼

Runtime Service

```



The Runtime Service **never** receives:



* ragent.yaml

* Repository

* GitHub URL

* Source code



The Runtime Service only receives a DeploymentPlan.



---



# Runtime Flow



Runtime Service receives



```text

DeploymentPlan

```



↓



Converts the DeploymentPlan into Railway API requests.



↓



Creates Railway project.



↓



Creates Railway service.



↓



Configures build settings.



↓



Configures start command.



↓



Configures environment variables.



↓



Starts deployment.



↓



Waits for build completion.



↓



Receives Runtime URL.



↓



Registers runtime.



↓



Publishes runtime.started.



---



# Railway Responsibilities



Railway is responsible for



* Building application

* Running containers

* Public networking

* HTTPS

* Container lifecycle

* Infrastructure

* Resource allocation

* Deployment execution



R Agent Cloud never performs these tasks itself.



---



# Communication Overview



```text

REST



Client



↓



API Gateway



↓



Deployment Service



──────────────────────────────────────



REST / gRPC



Deployment Service



↓



Validation Service



──────────────────────────────────────



Internal Planning



Deployment Service



↓



Deployment Planner



──────────────────────────────────────



gRPC



Deployment Service



↓



Runtime Service



──────────────────────────────────────



REST HTTPS



Runtime Service



↓



Railway API

```



---



# Design Principles



* Single responsibility per service

* Validation before planning

* Planning before deployment

* Deployment before runtime creation

* Runtime Service never parses repositories

* Validation Service never communicates with Railway

* Deployment Planner owns provider-specific deployment logic

* Deployment Service orchestrates the deployment lifecycle

* Runtime Service is the only backend service allowed to communicate with Railway

* Railway remains the infrastructure provider

* NATS is used for asynchronous communication

* gRPC is used only between Deployment Service and Runtime Service

* OpenTelemetry provides distributed tracing across all backend services


