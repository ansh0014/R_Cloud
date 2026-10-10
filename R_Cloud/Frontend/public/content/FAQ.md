# Frequently Asked Questions (FAQ)

Everything you need to know about deploying, monitoring, and scaling AI Agents on **R_Cloud**.

---

## 🚀 Getting Started

### 1. What is R_Cloud?
**R_Cloud** is a specialized serverless cloud platform engineered for AI agents, multi-agent swarms, and RAG architectures. We handle code validation, container provisioning, secure secret injection, real-time observability, and high-performance execution routing so developers can focus purely on agent logic.

### 2. What AI frameworks are supported?
R_Cloud supports any Python or Node.js agent framework, including:
- **LangChain** & **LangGraph**
- **CrewAI** & **AutoGen**
- **LlamaIndex**
- **Custom FastAPI / Flask / Express** AI microservices

### 3. How do I deploy my first agent?
1. Push your agent codebase to a Git repository (e.g., GitHub).
2. Add a `ragent.yaml` configuration file to the root of your repo.
3. Sign in to your R_Cloud Dashboard.
4. Click **Deploy Agent Project**, paste your repository URL and branch name.
5. (Optional) Run the **AI Validation Agent** to pre-check code readiness.
6. Click **Trigger Deployment Pipeline**. Your agent will build and go live within seconds!

---

## 🛠️ Configuration & Architecture

### 4. What is `ragent.yaml` and why is it required?
`ragent.yaml` is the platform manifest file that tells R_Cloud how your AI agent runs and which routes to expose.

Here is a minimal example for a monolith agent:
```yaml
application:
  name: "my-ai-agent"
  mode: "monolith"

routes:
  execute: "/execute"
  health: "/health"
  metadata: "/metadata"

environment:
  - "OPENAI_API_KEY"
```

For multi-agent systems, you can specify `mode: "microservices"` and list individual agents and their entrypoint files:
```yaml
application:
  name: "multi-agent-system"
  mode: "microservices"

agents:
  - id: "researcher"
    entrypoint: "agents/researcher.py"
  - id: "writer"
    entrypoint: "agents/writer.py"

routes:
  execute: "/execute"
  health: "/health"
  metadata: "/metadata"
```

### 5. Are LLM API keys (Gemini, OpenAI, Anthropic) mandatory in the database?
**No.** All environment variables and LLM API keys are **completely optional** at the database level. You can add them during deployment or configure your agent to fetch them securely from external vaults.

### 6. What application modes are supported?
- **Monolith Mode (`monolith`):** Deploys your entire repository as a single unified service exposing `/execute`, `/health`, and `/metadata` routes.
- **Microservices Mode (`microservices`):** Each agent defined in `ragent.yaml` is deployed as an isolated micro-container, allowing independent scaling and lifecycle management.

---

## 🌐 Connecting to Frontends (Vercel, Next.js, Mobile)

### 7. How does my frontend (e.g., Vercel / Next.js) communicate with R_Cloud?
Once deployed, R_Cloud provides an execution proxy endpoint:
```http
POST https://api.rcloud.dev/api/v1/deployments/{DEPLOYMENT_ID}/execute
Content-Type: application/json
Authorization: Bearer <YOUR_API_TOKEN>

{
  "prompt": "Hello agent, summarize this document.",
  "stream": true
}
```
You can call this endpoint directly from your Next.js API route, Vercel serverless function, or client frontend. R_Cloud handles load balancing, rate limiting, and forwards the prompt to your running agent container.

### 8. Does R_Cloud support streaming responses (SSE / WebSockets)?
**Yes.** R_Cloud natively supports streaming execution (`/api/v1/deployments/{id}/stream`) and real-time event updates over WebSockets (`/ws`), so your users can see agent thought processes and token generation in real time.

---

## 📊 Monitoring & Observability

### 9. What telemetry metrics does R_Cloud track?
R_Cloud captures out-of-the-box telemetry without requiring complex SDK setups:
- **Execution Latency:** Time taken per prompt/run (in ms).
- **Token Consumption:** Input, output, and total token usage.
- **Container Health:** Live heartbeat checks on `/health`.
- **Trace Logs:** Detailed step-by-step logs from agent thought iterations and tool calls.
- **Success & Failure Rates:** Historical error tracking and alert triggers.

### 10. What happens if my agent crashes or errors?
R_Cloud features automatic health monitoring and circuit breakers:
- If a container crashes, the runtime controller automatically attempts graceful restarts.
- Failure events are logged and streamed immediately to your dashboard so you can diagnose the stack trace.

---

## 🔒 Security & Pricing

### 11. Is my source code and repository data secure?
Yes. Repositories are cloned into temporary, isolated sandboxes solely for validation and container build phases. Temporary clone data is purged after build completion, and secrets are encrypted in transit and at rest.

### 12. How does pricing and resource allocation work?
During our developer preview, R_Cloud offers generous free-tier runtime resources for developers to build, test, and deploy AI agents. Commercial plans with dedicated GPUs, custom subdomains, and enterprise SLAs will be available soon.
