# Runtime Service gRPC & DeploymentPlan Integration Specification

This document defines the exact contract between the **Deployment Service (Go gRPC Client)** and the **Runtime Service (TypeScript gRPC Server)** for implementing Railway deployments.

---

## 1. gRPC Service Protocol Buffer Definition (`runtime.proto`)

Location: `proto/runtime.proto`

```protobuf
syntax = "proto3";

package rcloud.runtime;

option go_package = "github.com/r-cloud/shared/proto/runtime";

service RuntimeService {    
  rpc CreateRuntime    (CreateRuntimeRequest)    returns (CreateRuntimeResponse);
  rpc StopRuntime      (StopRuntimeRequest)      returns (StopRuntimeResponse);
  rpc RestartRuntime   (RestartRuntimeRequest)   returns (RestartRuntimeResponse);
  rpc DeleteRuntime    (DeleteRuntimeRequest)    returns (DeleteRuntimeResponse);
  rpc GetRuntimeStatus (GetRuntimeStatusRequest) returns (GetRuntimeStatusResponse);
}

enum RuntimeStatus {
  CREATING   = 0;
  RUNNING    = 1;
  STOPPED    = 2;
  RESTARTING = 3;
  DELETED    = 4;
  FAILED     = 5;
}

enum HealthStatus {
  STARTING  = 0;
  HEALTHY   = 1;
  UNHEALTHY = 2;
  UNKNOWN   = 3;
}

message ServicePlan {
  string name           = 1;
  string entrypoint     = 2;
  string execute_route  = 3;
  string health_route   = 4;
  string metadata_route = 5;
}

message CreateRuntimeRequest {
  string              deployment_id = 1;
  string              provider      = 2;
  string              mode          = 3;
  string              runtime       = 4;
  string              framework     = 5;
  string              build_command = 6;
  string              start_command = 7;
  map<string, string> environment   = 8;
  repeated ServicePlan services     = 9;
}

message DeployedAgent {
  string agent_id  = 1;
  string agent_url = 2;
}

message CreateRuntimeResponse {
  string        runtime_id  = 1;
  RuntimeStatus status      = 2;
  repeated DeployedAgent agents = 3;
}
```

---

## 2. Expected `CreateRuntimeRequest` Payload Examples

### A. Monolith Mode (`mode: monolith`)

```json
{
  "deployment_id": "dep_987654321",
  "provider": "railway",
  "mode": "monolith",
  "runtime": "python",
  "framework": "fastapi",
  "build_command": "pip install -r requirements.txt",
  "start_command": "uvicorn main:app --host 0.0.0.0 --port $PORT",
  "environment": {
    "OPENAI_API_KEY": "sk-proj-xxxxxxxxxxxx",
    "DATABASE_URL": "postgres://user:pass@host:5432/db",
    "PORT": "8080"
  },
  "services": [
    {
      "name": "main",
      "entrypoint": "main.py",
      "execute_route": "/execute",
      "health_route": "/health",
      "metadata_route": "/metadata"
    }
  ]
}
```

### B. Microservices Mode (`mode: microservices`)

```json
{
  "deployment_id": "dep_123456789",
  "provider": "railway",
  "mode": "microservices",
  "runtime": "python",
  "framework": "fastapi",
  "build_command": "pip install -r requirements.txt",
  "start_command": "uvicorn agents.planner:app --host 0.0.0.0 --port $PORT",
  "environment": {
    "OPENAI_API_KEY": "sk-proj-xxxxxxxxxxxx",
    "DATABASE_URL": "postgres://user:pass@host:5432/db"
  },
  "services": [
    {
      "name": "planner-agent",
      "entrypoint": "agents/planner.py",
      "execute_route": "/execute",
      "health_route": "/health",
      "metadata_route": "/metadata"
    },
    {
      "name": "researcher-agent",
      "entrypoint": "agents/researcher.py",
      "execute_route": "/execute",
      "health_route": "/health",
      "metadata_route": "/metadata"
    }
  ]
}
```

---

## 3. Runtime Service Implementation Responsibilities

When `CreateRuntime` is called, the Runtime Service must perform:

1. **Railway Project & Service Provisioning**:
   - Call Railway API/GraphQL to create a Railway Project for `deployment_id`.
   - Iterate through `request.services[]`:
     - Provision **1 Railway Service** per `ServicePlan`.
     - Configure Build Command: `request.build_command`.
     - Configure Start Command: Use `request.start_command` for monolith, or construct agent-specific entrypoint start command (`python <entrypoint>`) for microservices.
2. **Environment Variable Injection**:
   - Call Railway GraphQL `variableCollectionUpsert` to inject all key-values from `request.environment`.
3. **Trigger Deployment & Wait for Health**:
   - Wait for Railway container build & startup.
   - Run initial `GET` request against `https://<service-url><health_route>` (e.g. `/health`).
4. **Return Response**:
   - Populates `CreateRuntimeResponse` with `runtime_id`, `status: RUNNING`, and `agents[]` (mapping `agent_id` to public Railway URL).
