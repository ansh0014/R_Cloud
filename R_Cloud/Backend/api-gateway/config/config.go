package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                 string
	AuthServiceURL       string
	ProjectServiceURL    string
	DeploymentServiceURL string
	RuntimeServiceURL    string
	AgentOpsServiceURL   string
	NatsURL              string
	FrontendURL          string
	JWTSecret            string
	ServerReadTimeout    time.Duration
	ServerWriteTimeout   time.Duration
}

func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	authURL := getEnv("AUTH_SERVICE_URL", "http://localhost:8081")
	projectURL := getEnv("PROJECT_SERVICE_URL", "http://localhost:8082")
	deploymentURL := getEnv("DEPLOYMENT_SERVICE_URL", "http://localhost:8083")
	runtimeURL := getEnv("RUNTIME_SERVICE_URL", "http://localhost:8084")
	agentOpsURL := getEnv("AGENTOPS_SERVICE_URL", "http://localhost:8085")
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")
	jwtSecret := getEnv("JWT_SECRET", "rcloud-default-secret-key")

	return &Config{
		Port:                 port,
		AuthServiceURL:       authURL,
		ProjectServiceURL:    projectURL,
		DeploymentServiceURL: deploymentURL,
		RuntimeServiceURL:    runtimeURL,
		AgentOpsServiceURL:   agentOpsURL,
		NatsURL:              natsURL,
		FrontendURL:          frontendURL,
		JWTSecret:            jwtSecret,
		ServerReadTimeout:    15 * time.Second,
		ServerWriteTimeout:   30 * time.Second,
	}, nil
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
