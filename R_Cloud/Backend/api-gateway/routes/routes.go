package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/api-gateway/handlers"
	"github.com/r-cloud/api-gateway/middleware"
	"github.com/r-cloud/api-gateway/websocket"
	"github.com/r-cloud/shared/utils"
)

func RegisterRoutes(
	mw *middleware.Middleware,
	wsHub *websocket.Hub,
	authH *handlers.AuthHandler,
	projectH *handlers.ProjectHandler,
	deploymentH *handlers.DeploymentHandler,
	runtimeH *handlers.RuntimeHandler,
	agentOpsH *handlers.AgentOpsHandler,
	execH *handlers.ExecutionProxyHandler,
	aiH *handlers.AIValidationHandler,
) *mux.Router {
	router := mux.NewRouter()

	// Apply Global Middleware
	router.Use(mw.CORS)
	router.Use(mw.RequestLogger)
	router.Use(mw.RateLimit)
	router.Use(mw.AuthValidator)

	// Health Check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteSuccess(w, http.StatusOK, map[string]string{
			"status":  "healthy",
			"service": "api-gateway",
		}, "API Gateway is operational")
	}).Methods(http.MethodGet)

	// WebSocket Endpoint for Frontend Realtime Event Streams
	router.HandleFunc("/ws", wsHub.HandleWS)

	// API v1 Router
	v1 := router.PathPrefix("/api/v1").Subrouter()

	// Auth Routes
	v1.HandleFunc("/auth/login", authH.Login).Methods(http.MethodPost, http.MethodOptions)
	v1.HandleFunc("/auth/logout", authH.Logout).Methods(http.MethodPost, http.MethodOptions)
	v1.HandleFunc("/auth/profile", authH.Profile).Methods(http.MethodGet, http.MethodOptions)

	// Execution Proxy Routes (Must be declared before general deployment routes)
	v1.HandleFunc("/deployments/{deploymentId}/execute", execH.Execute).Methods(http.MethodPost, http.MethodOptions)
	v1.HandleFunc("/deployments/{deploymentId}/stream", execH.Stream).Methods(http.MethodPost, http.MethodOptions)

	// Project Deployments Route (Must be declared before general project routes)
	v1.HandleFunc("/projects/{projectId}/deployments", deploymentH.Proxy).Methods(http.MethodGet, http.MethodOptions)

	// Deployment Routes
	v1.PathPrefix("/deployments").HandlerFunc(deploymentH.Proxy)

	// Project Routes
	v1.PathPrefix("/projects").HandlerFunc(projectH.Proxy)

	// Runtime Routes
	v1.PathPrefix("/runtimes").HandlerFunc(runtimeH.Proxy)

	// AgentOps Routes (if needed)
	v1.PathPrefix("/agentops").HandlerFunc(agentOpsH.Proxy)

	// AI Validation Agent Routes
	v1.PathPrefix("/ai").HandlerFunc(aiH.Proxy)

	return router
}
