package internal

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/r-cloud/project-service/config"
	"github.com/r-cloud/project-service/github"
	"github.com/r-cloud/project-service/handlers"
	"github.com/r-cloud/project-service/repository"
	"github.com/r-cloud/project-service/service"
)


type App struct {
	Config *config.Config
	DB     *sql.DB
	Router *mux.Router
}


func NewApp(cfg *config.Config) (*App, error) {
	db, err := connectDB(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}

	ghClient := github.NewGitHubClient(cfg.GitHubToken, cfg.GitHubRequestTimeout)
	repo := repository.NewProjectRepository(db)
	svc := service.NewProjectService(repo, ghClient, cfg.DefaultBranch)
	handler := handlers.NewProjectHandler(svc)

	router := mux.NewRouter()
	registerRoutes(router, handler)

	return &App{
		Config: cfg,
		DB:     db,
		Router: router,
	}, nil
}

func connectDB(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to reach database: %w", err)
	}

	return db, nil
}


func registerRoutes(router *mux.Router, handler *handlers.ProjectHandler) {
	api := router.PathPrefix("/api/v1").Subrouter()

	api.HandleFunc("/projects", handler.Create).Methods(http.MethodPost)
	api.HandleFunc("/projects", handler.List).Methods(http.MethodGet)
	api.HandleFunc("/projects/{projectId}", handler.Get).Methods(http.MethodGet)
	api.HandleFunc("/projects/{projectId}", handler.Delete).Methods(http.MethodDelete)
	api.HandleFunc("/projects/{projectId}/github", handler.ConnectGitHub).Methods(http.MethodPost)
	api.HandleFunc("/projects/{projectId}/sync", handler.SyncGitHub).Methods(http.MethodPost)
}
