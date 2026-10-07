package internal

import (
	"fmt"

	"github.com/gorilla/mux"
	"github.com/r-cloud/api-gateway/config"
	"github.com/r-cloud/api-gateway/handlers"
	"github.com/r-cloud/api-gateway/middleware"
	"github.com/r-cloud/api-gateway/proxy"
	"github.com/r-cloud/api-gateway/routes"
	"github.com/r-cloud/api-gateway/websocket"
)

type App struct {
	Config *config.Config
	Router *mux.Router
	wsHub  *websocket.Hub
}

func NewApp(cfg *config.Config) (*App, error) {
	serviceProxy := proxy.NewServiceProxy()

	wsHub, err := websocket.NewHub(cfg.NatsURL)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize websocket hub: %w", err)
	}

	mw := middleware.NewMiddleware(cfg.FrontendURL, cfg.JWTSecret)

	authH := handlers.NewAuthHandler(cfg.AuthServiceURL, serviceProxy)
	projectH := handlers.NewProjectHandler(cfg.ProjectServiceURL, serviceProxy)
	deploymentH := handlers.NewDeploymentHandler(cfg.DeploymentServiceURL, serviceProxy)
	runtimeH := handlers.NewRuntimeHandler(cfg.RuntimeServiceURL, serviceProxy)
	agentOpsH := handlers.NewAgentOpsHandler(cfg.AgentOpsServiceURL, serviceProxy)
	execH := handlers.NewExecutionProxyHandler(cfg.RuntimeServiceURL, serviceProxy)
    aiH := handlers.NewAIValidationHandler(cfg.AIValidationURL, serviceProxy)
	router := routes.RegisterRoutes(mw, wsHub, authH, projectH, deploymentH, runtimeH, agentOpsH, execH, aiH)

	return &App{
		Config: cfg,
		Router: router,
		wsHub:  wsHub,
	}, nil
}

func (a *App) Close() error {
	if a.wsHub != nil {
		a.wsHub.Close()
	}
	return nil
}
