package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  string
	DatabaseURL           string
	NatsURL               string
	RuntimeServiceAddr    string
	ValidationServiceURL  string
	PlannerServiceURL     string
	CloneBaseDir          string
	ServerWriteTimeout    time.Duration
	ServerReadTimeout     time.Duration
	ShutdownTimeout       time.Duration
	GitTimeout            time.Duration
}

func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	port := os.Getenv("DEPLOYMENT_SERVICE_PORT")
	if port == "" {
		port = "8083"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	runtimeServiceAddr := os.Getenv("RUNTIME_SERVICE_ADDR")
	if runtimeServiceAddr == "" {
		runtimeServiceAddr = "localhost:50051"
	}

	validationServiceURL := os.Getenv("VALIDATION_SERVICE_URL")
	if validationServiceURL == "" {
		validationServiceURL = "http://localhost:8084"
	}

	plannerServiceURL := os.Getenv("PLANNER_SERVICE_URL")
	if plannerServiceURL == "" {
		plannerServiceURL = "http://localhost:8085"
	}

	cloneBaseDir := os.Getenv("CLONE_BASE_DIR")
	if cloneBaseDir == "" {
		cloneBaseDir = "./tmp/clones"
	}

	serverWriteTimeout := parseDurationEnv("SERVER_WRITE_TIMEOUT_SECONDS", 30)
	serverReadTimeout := parseDurationEnv("SERVER_READ_TIMEOUT_SECONDS", 30)
	shutdownTimeout := parseDurationEnv("SHUTDOWN_TIMEOUT_SECONDS", 10)
	gitTimeout := parseDurationEnv("GIT_TIMEOUT_SECONDS", 60)

	return &Config{
		Port:                 port,
		DatabaseURL:          databaseURL,
		NatsURL:              natsURL,
		RuntimeServiceAddr:   runtimeServiceAddr,
		ValidationServiceURL: validationServiceURL,
		PlannerServiceURL:    plannerServiceURL,
		CloneBaseDir:         cloneBaseDir,
		ServerWriteTimeout:   serverWriteTimeout,
		ServerReadTimeout:    serverReadTimeout,
		ShutdownTimeout:      shutdownTimeout,
		GitTimeout:           gitTimeout,
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
