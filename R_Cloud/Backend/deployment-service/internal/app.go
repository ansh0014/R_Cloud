package internal

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	grpcclient "github.com/r-cloud/deployment-service/clients/grpc"
	"github.com/r-cloud/deployment-service/clients/repo"
	"github.com/r-cloud/deployment-service/config"
	"github.com/r-cloud/deployment-service/handlers"
	"github.com/r-cloud/deployment-service/publisher"
	"github.com/r-cloud/deployment-service/service"
)

type App struct {
	Config   *config.Config
	DB       *sql.DB
	Router   *mux.Router
	natsPub  *publisher.NATSPublisher
	grpcConn *grpcclient.RuntimeClient
}

func NewApp(cfg *config.Config) (*App, error) {
	db, err := connectDB(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}

	natsPub, err := publisher.NewNATSPublisher(cfg.NatsURL)
	if err != nil {
		return nil, fmt.Errorf("nats connection failed: %w", err)
	}

	runtimeClient, err := grpcclient.NewRuntimeClient(cfg.RuntimeServiceAddr, 30*time.Second)
	if err != nil {
		return nil, fmt.Errorf("runtime service connection failed: %w", err)
	}

	repository := repo.NewDeploymentRepository(db)
	svc := service.NewDeploymentService(
		repository,
		runtimeClient,
		natsPub,
		cfg.CloneBaseDir,
		cfg.GitTimeout,
		cfg.ValidationServiceURL,
		cfg.PlannerServiceURL,
	)
	handler := handlers.NewDeploymentHandler(svc)

	router := mux.NewRouter()
	registerRoutes(router, handler)

	return &App{
		Config:   cfg,
		DB:       db,
		Router:   router,
		natsPub:  natsPub,
		grpcConn: runtimeClient,
	}, nil
}

func (a *App) Close() error {
	a.natsPub.Close()

	if err := a.grpcConn.Close(); err != nil {
		return fmt.Errorf("failed to close grpc connection: %w", err)
	}

	if err := a.DB.Close(); err != nil {
		return fmt.Errorf("failed to close database: %w", err)
	}

	return nil
}

func connectDB(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to reach database: %w", err)
	}

	createDeploymentsTableQuery := `
	CREATE TABLE IF NOT EXISTS deployments (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		project_id TEXT NOT NULL,
		user_id TEXT NOT NULL,
		branch TEXT NOT NULL,
		commit_hash TEXT,
		version TEXT,
		mode TEXT,
		status TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
		completed_at TIMESTAMPTZ
	);
	CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
	`
	if _, err := db.Exec(createDeploymentsTableQuery); err != nil {
		return nil, fmt.Errorf("failed to run deployments table migration: %w", err)
	}

	return db, nil
}

func registerRoutes(router *mux.Router, handler *handlers.DeploymentHandler) {
	api := router.PathPrefix("/api/v1").Subrouter()

	api.HandleFunc("/deployments", handler.Create).Methods(http.MethodPost)
	api.HandleFunc("/deployments/{deploymentId}", handler.Get).Methods(http.MethodGet)
	api.HandleFunc("/projects/{projectId}/deployments", handler.ListByProject).Methods(http.MethodGet)
}
