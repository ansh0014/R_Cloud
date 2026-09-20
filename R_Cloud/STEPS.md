# R Agent Cloud — Local Setup & Execution Guide (STEPS.md)

This document provides complete instructions for configuring environment variables, initializing infrastructure, and running the **R Agent Cloud** platform end-to-end.

---

## 🏗️ System Architecture & Port Matrix

| Service | Technology | Port / Interface | Directory |
| :--- | :--- | :--- | :--- |
| **API Gateway** | Go (Gorilla Mux) | `:8080` (HTTP & WS) | `Backend/api-gateway` |
| **Auth Service** | Go (Google OIDC + Redis) | `:8081` (HTTP) | `Backend/Auth` |
| **Project Service** | Go (GitHub API + PostgreSQL) | `:8082` (HTTP) | `Backend/project-service` |
| **Deployment Service** | Go (PostgreSQL + gRPC Client) | `:8083` (HTTP) | `Backend/deployment-service` |
| **Runtime Service** | TypeScript / Go | `:8084` (HTTP) / `:50051` (gRPC) | `Backend/runtime-service` |
| **Validation Service** | Go (Deterministic rule engine) | `:8086` (HTTP) | `Backend/validation-service` |
| **AI Validation Agent** | Python (FastAPI + OpenAI SDK) | `:8087` (HTTP) | `Ai-Agent/ai-validation-agent` |
| **Frontend** | React + Vite + Tailwind | `:5173` (HTTP) | `Frontend` |
| **NATS Server** | NATS Message Broker | `:4222` (TCP) | Infrastructure |
| **PostgreSQL** | PostgreSQL DB | `:5432` (TCP) | Infrastructure |

---

## 📋 Prerequisites

Before starting the platform, ensure you have installed:

- **Go**: `v1.22+`
- **Node.js**: `v20+` & `npm`
- **Python**: `v3.11+`
- **PostgreSQL**: `v15+`
- **NATS Server**: Local instance or Docker (`docker run -p 4222:4222 nats:latest`)
- **GitHub OAuth App & Personal Access Token**: Required for repository scanning, webhook events, and project integration.
- **Railway Account & API Token**: Required for real runtime provisioning on Railway.

---

## ⚙️ Environment Variables Guidelines

Create a `.env` file in each respective directory using the configurations below:

### 1. Auth Service (`Backend/Auth/.env`)
```env
PORT=8081
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rcloud_auth?sslmode=disable
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
SESSION_TTL_SECONDS=86400
SESSION_COOKIE_SECURE=false
FRONTEND_URL=http://localhost:5173
```

### 2. API Gateway (`Backend/api-gateway/.env`)
```env
PORT=8080
AUTH_SERVICE_URL=http://localhost:8081
PROJECT_SERVICE_URL=http://localhost:8082
DEPLOYMENT_SERVICE_URL=http://localhost:8083
RUNTIME_SERVICE_URL=http://localhost:8084
NATS_URL=nats://localhost:4222
FRONTEND_URL=http://localhost:5173
JWT_SECRET=rcloud-super-secret-jwt-key
```

### 3. Project Service & GitHub Connection (`Backend/project-service/.env`)
```env
PROJECT_SERVICE_PORT=8082
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rcloud_project?sslmode=disable
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
DEFAULT_BRANCH=main
GITHUB_REQUEST_TIMEOUT_SECONDS=10
SERVER_WRITE_TIMEOUT_SECONDS=15
SERVER_READ_TIMEOUT_SECONDS=15
SHUTDOWN_TIMEOUT_SECONDS=10
```

### 4. Deployment Service (`Backend/deployment-service/.env`)
```env
PORT=8083
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rcloud_deployment?sslmode=disable
NATS_URL=nats://localhost:4222
RUNTIME_SERVICE_ADDR=localhost:50051
VALIDATION_SERVICE_URL=http://localhost:8086
AI_VALIDATION_AGENT_URL=http://localhost:8087
PLANNER_SERVICE_URL=http://localhost:8085
CLONE_BASE_DIR=./tmp/clones
GIT_TIMEOUT=60s
```

### 5. Validation Service (`Backend/validation-service/.env`)
```env
PORT=8086
SERVER_READ_TIMEOUT=15s
SERVER_WRITE_TIMEOUT=30s
SHUTDOWN_TIMEOUT=10s
```

### 6. AI Validation Agent (`Ai-Agent/ai-validation-agent/.env`)
```env
LLM_API_KEY=sk-proj-your-openai-api-key
LLM_MODEL=gpt-4-turbo-preview
PORT=8087
```

### 7. Runtime Service (`Backend/runtime-service/.env`)
```env
PORT=8084
GRPC_PORT=50051
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rcloud_runtime?sslmode=disable
RAILWAY_API_TOKEN=your_railway_api_token
NATS_URL=nats://localhost:4222
```

### 8. Frontend (`Frontend/.env`)
```env
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

---

## 🔑 GitHub OAuth App Setup Guide

To obtain `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_TOKEN`:

1. Go to **GitHub Settings** -> **Developer Settings** -> **OAuth Apps** -> **New OAuth App**.
2. Set **Application Name**: `R Agent Cloud`
3. Set **Homepage URL**: `http://localhost:5173`
4. Set **Authorization callback URL**: `http://localhost:5173/auth/callback`
5. Generate **Client Secret** and copy both Client ID & Secret to `Backend/project-service/.env` and `Frontend/.env`.
6. Go to **Personal Access Tokens (Tokens classic)**, generate a token with `repo` scope, and set it as `GITHUB_TOKEN`.

---

## 🚀 Step-by-Step Execution Sequence

### Step 1: Start Infrastructure (NATS & PostgreSQL)
Start a local NATS broker:
```bash
docker run -d --name rcloud-nats -p 4222:4222 nats:latest
```
Ensure PostgreSQL is running and create the databases (`rcloud_auth`, `rcloud_deployment`, `rcloud_project`, `rcloud_runtime`).

### Step 2: Run Auth Service
```bash
cd Backend/Auth
go run main.go
```

### Step 3: Run Project Service (GitHub Integration)
```bash
cd Backend/project-service
go run cmd/main.go
```

### Step 4: Run Validation Service
```bash
cd Backend/validation-service
go run cmd/main.go
```

### Step 5: Run AI Validation Agent
```bash
cd Ai-Agent/ai-validation-agent
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8087 --reload
```

### Step 6: Run Deployment Service
```bash
cd Backend/deployment-service
go run cmd/main.go
```

### Step 7: Run API Gateway
```bash
cd Backend/api-gateway
go run cmd/main.go
```

### Step 8: Start Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## 🧪 End-to-End Execution & Testing Checklist

1. **Access Web Dashboard**: Open `http://localhost:5173` in your web browser.
2. **Login & GitHub Connect**: Sign in via Google OAuth and connect your GitHub account.
3. **Attach AI Agent Repository**:
   - Select repository from GitHub integration containing `ragent.yaml`.
   - The platform parses `ragent.yaml` and executes static validation (`:8086`) and AI Validation Agent advisory check (`:8087`).
4. **Deploy AI Agent**:
   - Click **Deploy**. `DeploymentService` receives the request, publishes NATS events, and provisions Railway containers via `RuntimeService`.
   - Real-time updates appear on Frontend via WebSocket (`ws://localhost:8080/ws`).
5. **Execute AI Agent**:
   - Issue a request to `POST http://localhost:8080/api/v1/deployments/{deploymentId}/execute`.
   - API Gateway forwards the prompt directly to the deployed Railway agent runtime and returns the result to your client!
