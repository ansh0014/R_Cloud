# Frontend vs Backend Capability Gap Analysis

## 1) Executive Summary

The backend already contains a complete runtime-management layer for AI application lifecycles, but the frontend is still mostly focused on project creation, deployment history, and dashboard metrics. The runtime service exposes functionality for provisioning runtimes, checking health, restarting unhealthy services, deleting runtimes, fetching runtime status, and returning per-agent metadata. The frontend does not currently consume those runtime APIs or offer UI for them.

In short: the system is architecturally designed to support runtime operations, but the user-facing app is missing the runtime management surface.

---

## 2) What the Backend Already Implements

### 2.1 Runtime service lifecycle API
The backend runtime service implements the full runtime lifecycle in `R_Cloud/Backend/runtime-service/src/registry/runtime.service.ts` and in the gRPC contract in `R_Cloud/proto/runtime.proto`.

Supported operations:

- Create runtime
- Stop runtime
- Restart runtime
- Delete runtime
- Get runtime status

The proto defines:

- `CreateRuntime`
- `StopRuntime`
- `RestartRuntime`
- `DeleteRuntime`
- `GetRuntimeStatus`

### 2.2 Runtime health monitoring and auto-recovery
The runtime service includes automatic health checks and restart logic in:

- `R_Cloud/Backend/runtime-service/src/health/scheduler.ts`
- `R_Cloud/Backend/runtime-service/src/health/restart-manager.ts`

This includes:

- periodic checks of all active runtimes
- checking every registered agent URL
- marking runtimes unhealthy if an agent fails
- publishing `health.failed` events
- auto-triggering restart logic for unhealthy runtimes
- updating runtime health and status in the database

### 2.3 Runtime metadata and runtime registry lookups
The HTTP runtime endpoints in `R_Cloud/Backend/runtime-service/src/http/routes.ts` expose:

- `/health`
- `/api/v1/runtimes`
- `/api/v1/runtimes/:id`
- `/api/v1/runtimes/by-deployment/:deploymentId`
- `/metadata`
- `/execute`
- `/stream`

These endpoints let the backend:

- list active runtimes
- fetch runtime details by ID
- fetch runtime info by deployment ID
- return metadata such as framework, version, and capabilities
- provide placeholder execution and stream endpoints for agent interaction

### 2.4 Railway integration and runtime provisioning
`R_Cloud/Backend/runtime-service/src/providers/railway/railway.client.ts` and the provisioner layer integrate with Railway for:

- creating project/service deployments
- restarting services
- deleting projects
- fetching service metadata

This means the backend can actually manage deployed runtime infrastructure, not just state in a DB.

### 2.5 Agent-level runtime data collection
During runtime creation, the backend does this:

- creates runtime and agent registry records
- fetches each deployed agent URL
- calls `/metadata` on each service
- stores framework, version, and capabilities
- returns agent URLs in the create response

This is implemented in `R_Cloud/Backend/runtime-service/src/registry/runtime.service.ts`.

---

## 3) What the Frontend Actually Implements

The frontend is mostly a deployment and monitoring dashboard, not a runtime control panel.

### 3.1 Project and deployment workflows
The frontend API layer in `R_Cloud/Frontend/src/lib/api.ts` supports:

- create project
- list projects
- create deployment
- list deployments by project
- AI repository analysis

### 3.2 Dashboard pages that exist
Routes are declared in `R_Cloud/Frontend/src/App.tsx` and nav items are defined in `R_Cloud/Frontend/src/layouts/DashboardLayout.tsx`.

Current dashboard sections:

- Overview
- Deploy Agent
- Deployments
- Agent Metrics
- Traces
- Runtime Logs
- Token Usage

The frontend currently exposes a deployment-oriented experience, not a runtime-operation experience.

### 3.3 The frontend is not calling runtime endpoints
The frontend API client only targets:

- `/api/v1/projects`
- `/api/v1/deployments`
- `/api/v1/ai` (AI validation)

There is no runtime client implementation for:

- `/api/v1/runtimes`
- `/api/v1/runtimes/:id`
- `/api/v1/runtimes/by-deployment/:deploymentId`
- runtime restart/stop/delete calls

This is the biggest gap: the runtime service exists and the API gateway exposes a runtime route, but the frontend never consumes it.

---

## 4) Missing Frontend Functionality Compared to Backend

### 4.1 Runtime lifecycle controls are missing
Backend supports:

- create runtime
- stop runtime
- restart runtime
- delete runtime

Frontend missing:

- button to stop a running runtime
- button to restart a runtime
- button to delete a runtime
- runtime action drawer or action menu from deployment cards
- direct runtime lifecycle management screen

### 4.2 Runtime health dashboard is missing
Backend tracks:

- runtime status
- overall health
- per-agent health
- last checked timestamp
- unhealthy runtime recovery

Frontend missing:

- per-runtime health status panel
- runtime uptime / downtime indicators
- health badge for each agent
- alerting when runtime becomes unhealthy
- history of health transitions

### 4.3 Agent-level runtime visibility is missing
Backend collects agent metadata such as:

- service name
- agent URL
- framework
- version
- capabilities

Frontend missing:

- list of deployed agents per runtime
- framework and version breakdown per agent
- capability listing for each agent
- click-through to each agent endpoint or metadata view

### 4.4 Deployment-to-runtime linking is missing
Backend can resolve runtime by deployment ID through:

- `/api/v1/runtimes/by-deployment/:deploymentId`

Frontend missing:

- runtime lookup tied to a selected deployment
- deployment card showing corresponding runtime ID and URL
- runtime detail page opened from a deployment

### 4.5 Active runtime list and runtime detail pages are missing
Backend exposes:

- list active runtimes
- runtime detail by ID
- runtime status response including agent list

Frontend missing:

- dedicated runtimes page
- runtime detail page
- runtime URL display
- runtime creation timestamp and status timeline
- filters for running, stopped, failed, restarting, deleted states

### 4.6 Runtime metadata and agent introspection are missing
Backend exposes metadata endpoints and stores framework/version/capabilities for each agent.

Frontend missing:

- runtime metadata inspection UI
- architecture overview of deployed services
- “framework / version / capability” cards
- agent capabilities display

### 4.7 Runtime events and realtime dashboard are incomplete
The runtime service publishes events like:

- runtime.started
- runtime.restarted
- runtime.failed
- health.failed
- runtime.stopped
- runtime.deleted

The frontend uses a websocket hook, but the actual UI is not deeply wired to runtime lifecycle events.

Missing surface:

- live runtime event stream in UI
- system alerts for runtime failure
- event feed for runtime actions
- timeline of lifecycle events per deployment/runtime

### 4.8 Runtime logs and execution endpoints are not exposed in the app
The backend includes:

- execution endpoint
- streaming endpoint
- runtime logs/health check behavior

The frontend does not currently provide:

- runtime execution UI
- stream viewer for runtime output
- per-runtime log viewer
- agent command execution screen

---

## 5) Evidence Matrix

| Capability | Backend implementation | Frontend status |
|---|---|---|
| Create runtime | Implemented in runtime service and proto | Missing UI action |
| Stop runtime | Implemented | Missing UI action |
| Restart runtime | Implemented | Missing UI action |
| Delete runtime | Implemented | Missing UI action |
| Get runtime status | Implemented | Missing UI page |
| Health monitoring | Implemented in scheduler / restart manager | Missing live health screen |
| Agent metadata fetch | Implemented | Missing agent details UI |
| Runtime list | Implemented via HTTP routes | Missing runtime listing page |
| Runtime lookup by deployment | Implemented | Missing project/deployment runtime linkage |
| Runtime event streaming | Implemented in backend and websocket infra | Not surfaced in main app UX |
| Runtime-level logs | Partially backend concept | Missing runtime log viewer |

---

## 6) Practical Frontend Gaps to Prioritize

### High priority
1. Runtime detail page
2. Runtime status/health dashboard
3. Stop / restart / delete actions
4. Active runtime list tied to deployments
5. Runtime-to-agent metadata display

### Medium priority
1. Runtime history and health timeline
2. Event stream / realtime lifecycle notifications
3. Runtime log viewer
4. Runtime execution UI

### Lower priority
1. Capability visualization
2. Advanced runtime diagnostics panel
3. Detailed service topology view

---

## 7) Bottom Line

The system architecture is much more advanced than the UI. The backend is already implementing runtime orchestration, health monitoring, and agent metadata management, but the frontend remains a deployment-management dashboard rather than a runtime-management console.

The main missing feature set is not “deployment creation”; it is the ability to manage and visualize deployed runtime instances as first-class entities in the frontend.

---

## 8) Key Files Reviewed

- `R_Cloud/Backend/runtime-service/src/registry/runtime.service.ts`
- `R_Cloud/Backend/runtime-service/src/http/routes.ts`
- `R_Cloud/Backend/runtime-service/src/health/scheduler.ts`
- `R_Cloud/Backend/runtime-service/src/health/restart-manager.ts`
- `R_Cloud/proto/runtime.proto`
- `R_Cloud/Backend/api-gateway/routes/routes.go`
- `R_Cloud/Frontend/src/lib/api.ts`
- `R_Cloud/Frontend/src/App.tsx`
- `R_Cloud/Frontend/src/layouts/DashboardLayout.tsx`
- `R_Cloud/Frontend/src/pages/dashboard/DeployPage.tsx`
- `R_Cloud/Frontend/src/pages/dashboard/DeploymentsPage.tsx`

This analysis shows that the backend runtime feature set is substantially ahead of the frontend experience.
