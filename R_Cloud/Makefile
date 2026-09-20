# ==============================================================================
# R Agent Cloud - Unified WSL / Linux Makefile
# ==============================================================================

.PHONY: help install check-env proto docker-build docker-up docker-down docker-logs nats run-gateway run-auth run-project run-deployment run-runtime run-planner run-validation run-ai-agent run-frontend run-all clean

# Default Target
.DEFAULT_GOAL := help

help: ## Display available commands
	@echo "R Agent Cloud - WSL Execution Commands:"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------------------------
# Protobuf & Environment Checks
# ------------------------------------------------------------------------------

proto: ## Generate Go code from protobuf definitions via Docker protoc
	@echo "Generating Protobuf & gRPC code..."
	bash scripts/proto-gen.sh

check-env: ## Verify existence of all required .env files
	@echo "Checking service .env files..."
	@test -f Backend/api-gateway/.env || (echo "[MISSING] Backend/api-gateway/.env" && exit 1)
	@test -f Backend/Auth/.env || (echo "[MISSING] Backend/Auth/.env" && exit 1)
	@test -f Backend/project-service/.env || (echo "[MISSING] Backend/project-service/.env" && exit 1)
	@test -f Backend/deployment-service/.env || (echo "[MISSING] Backend/deployment-service/.env" && exit 1)
	@test -f Backend/runtime-service/.env || (echo "[MISSING] Backend/runtime-service/.env" && exit 1)
	@test -f Backend/validation-service/.env || (echo "[MISSING] Backend/validation-service/.env" && exit 1)
	@test -f Backend/deployment-planner/.env || (echo "[MISSING] Backend/deployment-planner/.env" && exit 1)
	@test -f Frontend/.env || (echo "[MISSING] Frontend/.env" && exit 1)
	@test -f ../Ai-Agent/ai-validation-agent/.env || (echo "[MISSING] Ai-Agent/ai-validation-agent/.env" && exit 1)
	@echo "All service .env files are present and configured!"

install: ## Install dependencies for Frontend, Runtime Service, and AI Validation Agent
	@echo "Installing Runtime Service dependencies..."
	cd Backend/runtime-service && npm install
	@echo "Installing Frontend dependencies..."
	cd Frontend && npm install
	@echo "Installing AI Validation Agent dependencies..."
	cd ../Ai-Agent/ai-validation-agent && pip install -r requirements.txt
	@echo "All dependencies installed!"

# ------------------------------------------------------------------------------
# Full Docker Compose Stack
# ------------------------------------------------------------------------------

docker-build: ## Build Docker images for all microservices
	docker-compose build

docker-up: check-env ## Start complete platform stack using Docker Compose
	docker-compose up -d

docker-down: ## Stop all Docker Compose services
	docker-compose down

docker-logs: ## Follow logs of all Docker Compose services
	docker-compose logs -f

# ------------------------------------------------------------------------------
# Infrastructure Services
# ------------------------------------------------------------------------------

nats: ## Start NATS Server in Docker
	@echo "Starting NATS message broker..."
	docker run -d --name rcloud-nats -p 4222:4222 nats:latest || docker start rcloud-nats

# ------------------------------------------------------------------------------
# Individual Service Launchers (For multi-terminal / WSL development)
# ------------------------------------------------------------------------------

run-gateway: ## Run API Gateway (:8080)
	cd Backend/api-gateway && go run cmd/main.go

run-auth: ## Run Auth Service (:8081)
	cd Backend/Auth && go run main.go

run-project: ## Run Project Service (:8082)
	cd Backend/project-service && go run cmd/main.go

run-deployment: ## Run Deployment Service (:8083)
	cd Backend/deployment-service && go run cmd/main.go

run-runtime: ## Run Runtime Service (:8084 HTTP / :50051 gRPC)
	cd Backend/runtime-service && npm run dev

run-planner: ## Run Deployment Planner Service (:8085)
	cd Backend/deployment-planner && go run cmd/main.go

run-validation: ## Run Static Validation Service (:8086)
	cd Backend/validation-service && go run cmd/main.go

run-ai-agent: ## Run AI Validation Agent with Gemini (:8087)
	cd ../Ai-Agent/ai-validation-agent && uvicorn main:app --host 0.0.0.0 --port 8087 --reload

run-frontend: ## Run Frontend React Dashboard (:5173)
	cd Frontend && npm run dev

# ------------------------------------------------------------------------------
# Orchestration
# ------------------------------------------------------------------------------

run-all: check-env ## Run all core backend microservices, AI Agent, and frontend concurrently in background
	@echo "Starting all R Agent Cloud microservices in WSL..."
	@(cd Backend/Auth && go run main.go) &
	@(cd Backend/project-service && go run cmd/main.go) &
	@(cd Backend/validation-service && go run cmd/main.go) &
	@(cd Backend/deployment-planner && go run cmd/main.go) &
	@(cd ../Ai-Agent/ai-validation-agent && uvicorn main:app --host 0.0.0.0 --port 8087) &
	@(cd Backend/runtime-service && npm run dev) &
	@(cd Backend/deployment-service && go run cmd/main.go) &
	@sleep 2
	@(cd Backend/api-gateway && go run cmd/main.go) &
	@(cd Frontend && npm run dev) &
	@echo "All services started! Press Ctrl+C or kill processes to stop."
	@wait

clean: ## Remove temporary files, build artifacts, and clones
	rm -rf Backend/deployment-service/tmp/clones
	rm -rf tmp/
