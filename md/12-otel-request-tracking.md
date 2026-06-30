# Tracking User Agent Requests Using OpenTelemetry

> How R Cloud observes every request going through a user's deployed Python agent — without touching the user's code.

---

## The Problem

When a user deploys their AI agent on R Cloud, their code runs inside a Railway container. That code makes calls to:
- LLMs (OpenAI, Anthropic, Gemini, etc.)
- External tools (web search, GitHub API, databases, etc.)
- Other services

We need to show the user **where their agent is going**, **what is failing**, and **what is slow** — without modifying their code.

---

## Core Principle

> We never touch the user's code. We control the **environment** their code runs in.

Two things we control at deploy time:
1. **The start command** — we wrap it with OTel before running user's code
2. **Environment variables** — we inject OTel config silently via Railway API

---

## How It Works

### Step 1 — Normal Deployment (Without Tracking)

```
User's planner.py starts
  → calls OpenAI
  → calls web search tool
  → calls GitHub API
  → returns response

You see: nothing
```

### Step 2 — With OTel Auto-Instrumentation (What We Do)

```
opentelemetry-instrument python planner.py
         ↑
         Loads before ANY user code
         Auto-patches: requests, httpx, urllib, fastapi...
         Every outbound HTTP call → creates a span

User's planner.py starts
  → calls OpenAI       → SPAN: POST api.openai.com  380ms  200 ✅
  → calls web search   → SPAN: GET serper.dev        190ms  200 ✅
  → calls GitHub API   → SPAN: GET api.github.com    900ms  404 ❌ ← FAILED HERE
  → returns response

You see: the full timeline, every step, every failure
```

---

## Why Every LLM Is Detected Automatically

Every LLM SDK makes HTTP calls under the hood. OTel instruments the HTTP layer — not the SDK itself.

| User calls | Internally uses | OTel intercepts |
|---|---|---|
| `openai.chat.completions.create()` | `httpx` → `POST api.openai.com` | ✅ |
| `anthropic.messages.create()` | `httpx` → `POST api.anthropic.com` | ✅ |
| `google.generativeai` (Gemini) | `requests` → `POST generativelanguage.googleapis.com` | ✅ |
| `groq.chat.completions.create()` | `httpx` → `POST api.groq.com` | ✅ |
| Any tool using `requests.get()` | `requests` | ✅ |
| Any tool using `httpx.post()` | `httpx` | ✅ |

---

## Implementation — Deployment Service (TypeScript/JS)

### 1. Build the OTel-Wrapped Start Command

```typescript
// src/deployment/otel-bootstrap.ts

export function buildStartCommand(entrypoint: string): string {
  return [
    // Install OTel core + exporter
    'pip install opentelemetry-distro opentelemetry-exporter-otlp -q',

    // Scan installed packages → auto-install matching OTel instrumentation
    // Detects: requests, httpx, fastapi, flask, psycopg2, redis, sqlalchemy...
    'opentelemetry-bootstrap --action=install -q',

    // Run user's code with full auto-instrumentation active
    `opentelemetry-instrument python ${entrypoint}`

  ].join(' && ')
}

// Result (example):
// "pip install opentelemetry-distro opentelemetry-exporter-otlp -q &&
//  opentelemetry-bootstrap --action=install -q &&
//  opentelemetry-instrument python planner.py"
```

---

### 2. Inject OTel Environment Variables at Railway Deploy

```typescript
// src/providers/railway/railway.ts
// When calling Railway API to deploy user's container:

const otelEnvVars = {
  OTEL_EXPORTER_OTLP_ENDPOINT: 'https://collector.yourplatform.com',
  OTEL_SERVICE_NAME:           deploymentId,
  OTEL_RESOURCE_ATTRIBUTES:    `deployment.id=${deploymentId},user.id=${userId}`,
  OTEL_TRACES_EXPORTER:        'otlp',
  OTEL_LOGS_EXPORTER:          'otlp',
}

// Merged with user's own env vars (OPENAI_API_KEY etc.)
const allEnvVars = { ...userEnvVars, ...otelEnvVars }

// Injected into Railway service via API — user never sees this
```

---

### 3. Full Railway Deploy Call

```typescript
// src/providers/railway/railway.ts

export async function deployToRailway(params: {
  deploymentId: string
  userId:       string
  repoUrl:      string
  branch:       string
  entrypoint:   string
  userEnvVars:  Record<string, string>
}) {

  // A: Create Railway project
  const { projectCreate } = await railwayGQL(`
    mutation {
      projectCreate(input: { name: "${params.deploymentId}-${params.userId}" }) {
        id
      }
    }
  `)

  // B: Create service from user's GitHub repo
  const { serviceCreate } = await railwayGQL(`
    mutation {
      serviceCreate(input: {
        projectId: "${projectCreate.id}"
        name: "agent"
        source: { repo: "${params.repoUrl}", branch: "${params.branch}" }
      }) {
        id
      }
    }
  `)

  // C: Inject ALL env vars (user's + your OTel vars)
  const allEnvVars = {
    ...params.userEnvVars,
    OTEL_EXPORTER_OTLP_ENDPOINT: 'https://collector.yourplatform.com',
    OTEL_SERVICE_NAME:            params.deploymentId,
    OTEL_RESOURCE_ATTRIBUTES:     `deployment.id=${params.deploymentId},user.id=${params.userId}`,
    OTEL_TRACES_EXPORTER:         'otlp',
    OTEL_LOGS_EXPORTER:           'otlp',
    PORT:                         '3000',
  }

  for (const [name, value] of Object.entries(allEnvVars)) {
    await railwayGQL(`
      mutation {
        variableUpsert(input: {
          projectId: "${projectCreate.id}"
          serviceId: "${serviceCreate.id}"
          name: "${name}"
          value: "${value}"
        })
      }
    `)
  }

  // D: Override start command with OTel-wrapped version
  await railwayGQL(`
    mutation {
      serviceUpdate(
        id: "${serviceCreate.id}"
        input: { startCommand: "${buildStartCommand(params.entrypoint)}" }
      ) { id }
    }
  `)

  // E: Trigger deploy
  const { deploymentTrigger } = await railwayGQL(`
    mutation {
      deploymentTrigger(id: "${serviceCreate.id}") {
        id
        status
        url
      }
    }
  `)

  return {
    railwayProjectId: projectCreate.id,
    railwayServiceId: serviceCreate.id,
    runtimeUrl:       deploymentTrigger.url,
    status:           'DEPLOYING'
  }
}
```

---

## How `opentelemetry-bootstrap` Auto-Detects Libraries

`opentelemetry-bootstrap` is a CLI tool that ships with `opentelemetry-distro`. It:

1. Scans every package already installed in the environment (`pip list`)
2. Checks against its internal mapping table
3. Runs `pip install` for every match

```
User's requirements.txt installs:
  openai, requests, fastapi, psycopg2, redis

Railway build phase: pip install -r requirements.txt
  → all user packages are now installed

Container start phase: opentelemetry-bootstrap --action=install
  → scans installed packages
  → finds: requests ✅ fastapi ✅ psycopg2 ✅ redis ✅
  → installs:
       opentelemetry-instrumentation-requests
       opentelemetry-instrumentation-fastapi
       opentelemetry-instrumentation-psycopg2
       opentelemetry-instrumentation-redis
```

### Official Packages the Bootstrap Auto-Detects

```
requests      → opentelemetry-instrumentation-requests
httpx         → opentelemetry-instrumentation-httpx
fastapi       → opentelemetry-instrumentation-fastapi
flask         → opentelemetry-instrumentation-flask
django        → opentelemetry-instrumentation-django
psycopg2      → opentelemetry-instrumentation-psycopg2
redis         → opentelemetry-instrumentation-redis
pymongo       → opentelemetry-instrumentation-pymongo
sqlalchemy    → opentelemetry-instrumentation-sqlalchemy
boto3/botocore → opentelemetry-instrumentation-botocore
celery        → opentelemetry-instrumentation-celery
grpcio        → opentelemetry-instrumentation-grpc
elasticsearch → opentelemetry-instrumentation-elasticsearch
aiohttp       → opentelemetry-instrumentation-aiohttp-client
```

> **Note:** `openai`, `anthropic`, `langchain` are NOT in the official bootstrap registry.
> However, their HTTP calls ARE captured via `requests`/`httpx` instrumentation.
> You get: URL, latency, status code. You do NOT get: token counts, model name.

---

## What You See in a Trace (MVP Scope)

```
TRACE: sess_abc — POST /execute            Total: 2.4s

  ├─ [0ms]    POST /execute received                              ✅
  │
  ├─ [5ms]    POST api.openai.com/v1/chat/completions   380ms    ✅  ← LLM hit
  │
  ├─ [390ms]  GET  api.serper.dev/search                190ms    ✅  ← tool hit
  │
  ├─ [585ms]  POST api.openai.com/v1/chat/completions   800ms    ✅  ← LLM hit again
  │
  └─ [1.4s]   GET  api.github.com/repos/user/repo       900ms    ❌  404 ← FAILED
```

User immediately knows:
- ✅ LLM was hit — which provider (from URL), how many times, how long
- ✅ Which tools were called — exact URLs
- ✅ Which step failed — status code 404
- ✅ What is slow — GitHub call taking 900ms

---

## Identifying the LLM Provider From the URL

```
URL in trace                                    Provider
─────────────────────────────────────────────────────────
api.openai.com                               → OpenAI (GPT-4o, GPT-3.5...)
api.anthropic.com                            → Anthropic (Claude)
generativelanguage.googleapis.com            → Google Gemini
api.groq.com                                 → Groq
api.mistral.ai                               → Mistral
api.cohere.ai                                → Cohere
localhost:11434                              → Ollama (local model)
```

---

## OTel Collector — Where Spans Are Sent

All spans from all user containers flow to one central collector on your platform.

```
User container A (deployment dep_123)
  → OTLP spans → collector.yourplatform.com

User container B (deployment dep_456)
  → OTLP spans → collector.yourplatform.com

                    ↓
          Your OTel Collector
          (one Railway service)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
     Grafana Tempo          Your DB
     (trace viewer)    (AgentOps service reads)
                             ↓
                      User's Dashboard
                   shows full trace timeline
```

### MVP Collector Setup — Grafana Cloud Free Tier

For MVP, use Grafana Cloud (free tier — no infra to manage):

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your-grafana-token>
```

Replace with self-hosted Grafana later.

---

## What Changes Per User Deployment

| Thing | User Changes | Platform Changes |
|---|---|---|
| Python code (`planner.py`) | ✅ Their code | ❌ Never touched |
| `requirements.txt` | ✅ Their libs | ❌ Never touched |
| `ragent.yaml` | ✅ Their config | ❌ Only read |
| Railway start command | ❌ Never set by user | ✅ You inject OTel wrapper |
| `OTEL_*` env vars | ❌ Never set by user | ✅ You inject at deploy |
| `OPENAI_API_KEY` | ✅ User provides | Platform passes to Railway |

---

## MVP vs Future Scope

| Feature | MVP (HTTP tracing) | Future |
|---|---|---|
| LLM was hit? | ✅ | |
| Which LLM provider? | ✅ (from URL) | |
| LLM call latency? | ✅ | |
| Tool / external API hit? | ✅ | |
| Which step failed? | ✅ (status code) | |
| Total request latency? | ✅ | |
| Token counts (prompt/completion) | ❌ | LLM Proxy |
| Exact model name (gpt-4o vs 3.5) | ❌ | LLM Proxy |
| LangChain step names | ❌ | Explicit instrumentation |
| Cost per request | ❌ | LLM Proxy |

---

## Team Responsibilities

| Task | Team |
|---|---|
| `buildStartCommand()` in deploy flow | AI Runtime Team (JS service) |
| Inject OTel env vars via Railway API | AI Runtime Team (JS service) |
| OTel Collector service setup | Platform Team |
| AgentOps reads traces → shows dashboard | Platform Team |
| User's Python agent code | User (not our concern) |
