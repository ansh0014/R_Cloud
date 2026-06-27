---

# Agent-to-Agent (A2A) Deployment

R Agent Cloud supports deploying both single-agent and multi-agent systems.

A deployment can consist of multiple collaborating agents that communicate through an A2A workflow while exposing a single public API endpoint.

Example:

```text
                Client
                   │
                   ▼
              POST /execute
                   │
                   ▼
            Planner Agent
             /           \
            ▼             ▼
   Research Agent   Database Agent
            \             /
             ▼           ▼
            Reviewer Agent
                   │
                   ▼
            Final Response
```

The platform validates the agent topology defined in `ragent.yaml`, deploys the complete agent application, manages runtime communication, and exposes a single endpoint for clients.

Example configuration:

```yaml
application:
  name: customer-support

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

Benefits:

- Deploy complete multi-agent systems.
- Validate agent topology before deployment.
- Single public endpoint for the entire workflow.
- Centralized runtime management.
- AgentOps and observability for the complete application.