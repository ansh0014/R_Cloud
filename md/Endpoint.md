# Agent Runtime API

Every deployed agent exposes a standard Runtime API.

This allows the platform to communicate with every agent in a consistent way, regardless of the framework (LangGraph, CrewAI, OpenAI Agents SDK, etc.).

---

## POST /execute

Execute an agent synchronously.

### Purpose

Runs the complete workflow and returns the final response after execution finishes.

### Request

```json
{
  "session_id": "abc123",
  "input": "Explain Binary Search",
  "context": {},
  "metadata": {}
}
```

### Response

```json
{
  "success": true,
  "response": "Binary Search is...",
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 350
  },
  "latency": 842
}
```

Use Cases

- Chat APIs
- REST APIs
- Backend Services

---

## POST /stream

Execute an agent with streaming output.

### Purpose

Streams tokens to the client while the agent is executing.

### Request

Same as `/execute`.

### Response

Server-Sent Events (SSE) or WebSocket stream.

Example

```
Thinking...
Searching...
Generating...
Done.
```

Use Cases

- Chat UI
- Long-running workflows
- Real-time agent execution

---

## GET /health

Health check endpoint.

### Purpose

Used by:

- Runtime Manager
- Kubernetes
- Load Balancer
- Monitoring System

### Response

```json
{
    "status":"healthy",
    "version":"1.0.0",
    "uptime":"12h",
    "model":"gpt-5"
}
```

Checks

- Runtime Alive
- Model Available
- Database Connected
- Memory Connected
- Tool Registry Loaded

---

## GET /metadata

Returns runtime metadata.

### Purpose

Allows the platform to discover agent capabilities.

### Response

```json
{
    "name":"Research Agent",
    "version":"1.0.0",
    "framework":"LangGraph",
    "model":"gpt-5",
    "supports_streaming":true,
    "tools":[
        "search",
        "calculator",
        "database"
    ]
}
```

The dashboard uses this endpoint to display runtime information.

The deployment service also uses this endpoint to verify compatibility.

---

# Runtime API Summary

| Endpoint | Method | Purpose |
|-----------|---------|----------|
| `/execute` | POST | Execute agent and return final response |
| `/stream` | POST | Execute agent with streaming response |
| `/health` | GET | Runtime health check |
| `/metadata` | GET | Agent runtime information |