package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                 string
	DatabaseURL          string
	GitHubToken          string
	GitHubRequestTimeout time.Duration
	ServerWriteTimeout   time.Duration
	ServerReadTimeout    time.Duration
	ShutdownTimeout      time.Duration
	DefaultBranch        string
	GitHubClientID       string
	GitHubClientSecret   string
	GitHubWebhookSecret  string
}


func LoadConfig() (*Config, error) {
	
	_ = godotenv.Load()

	port := os.Getenv("PROJECT_SERVICE_PORT")
	if port == "" {
		return nil, fmt.Errorf("PROJECT_SERVICE_PORT is required")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	githubToken := os.Getenv("GITHUB_TOKEN")
	if githubToken == "" {
		return nil, fmt.Errorf("GITHUB_TOKEN is required")
	}

	githubClientID := os.Getenv("GITHUB_CLIENT_ID")
	if githubClientID == "" {
		return nil, fmt.Errorf("GITHUB_CLIENT_ID is required")
	}

	githubClientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if githubClientSecret == "" {
		return nil, fmt.Errorf("GITHUB_CLIENT_SECRET is required")
	}

	githubWebhookSecret := os.Getenv("GITHUB_WEBHOOK_SECRET")
	if githubWebhookSecret == "" {
		return nil, fmt.Errorf("GITHUB_WEBHOOK_SECRET is required")
	}

	defaultBranch := os.Getenv("DEFAULT_BRANCH")
	if defaultBranch == "" {
		defaultBranch = "main"
	}

	githubTimeout := parseDurationEnv("GITHUB_REQUEST_TIMEOUT_SECONDS", 10)
	serverWriteTimeout := parseDurationEnv("SERVER_WRITE_TIMEOUT_SECONDS", 15)
	serverReadTimeout := parseDurationEnv("SERVER_READ_TIMEOUT_SECONDS", 15)
	shutdownTimeout := parseDurationEnv("SHUTDOWN_TIMEOUT_SECONDS", 10)

	return &Config{
		Port:                 port,
		DatabaseURL:          databaseURL,
		GitHubToken:          githubToken,
		DefaultBranch:        defaultBranch,
		GitHubRequestTimeout: githubTimeout,
		ServerWriteTimeout:   serverWriteTimeout,
		ServerReadTimeout:    serverReadTimeout,
		ShutdownTimeout:      shutdownTimeout,
		GitHubClientID:       githubClientID,
		GitHubClientSecret:   githubClientSecret,
		GitHubWebhookSecret:  githubWebhookSecret,
	}, nil
}


func parseDurationEnv(key string, defaultSeconds int) time.Duration {
	raw := os.Getenv(key)
	if raw == "" {
		return time.Duration(defaultSeconds) * time.Second
	}

	seconds, err := strconv.Atoi(raw)
	if err != nil {
		return time.Duration(defaultSeconds) * time.Second
	}

	return time.Duration(seconds) * time.Second
}