package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AdminEmail string
	Server     ServerConfig
	GoogleAuth GoogleAuthConfig
	Database   DatabaseConfig
	Upstash    UpstashConfig
	Session    SessionConfig
}

type ServerConfig struct {
	Port        string
	FrontendURL string
}

type GoogleAuthConfig struct {
	ClientID string
}

type DatabaseConfig struct {
	DatabaseURL string
}

type SessionConfig struct {
	Name         string
	TTLSeconds   int
	CookieSecure bool
}

type UpstashConfig struct {
	RESTURL   string
	RESTToken string
	KeyPrefix string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	config := &Config{
		AdminEmail: os.Getenv("ADMIN_EMAIL"),
		Server: ServerConfig{
			Port:        os.Getenv("PORT"),
			FrontendURL: os.Getenv("API_GATEWAY_URL"),
		},
		GoogleAuth: GoogleAuthConfig{
			ClientID: os.Getenv("GOOGLE_CLIENT_ID"),
		},
		Database: DatabaseConfig{
			DatabaseURL: os.Getenv("DATABASE_URL"),
		},
		Upstash: UpstashConfig{
			RESTURL:   os.Getenv("UPSTASH_REDIS_REST_URL"),
			RESTToken: os.Getenv("UPSTASH_REDIS_REST_TOKEN"),
			KeyPrefix: valueOrDefault(os.Getenv("UPSTASH_SESSION_PREFIX"), "auth:session:"),
		},
		Session: SessionConfig{
			Name:         os.Getenv("SESSION_NAME"),
			TTLSeconds:   intOrDefault(os.Getenv("SESSION_TTL_SECONDS"), 604800),
			CookieSecure: os.Getenv("SESSION_COOKIE_SECURE") == "true",
		},
	}

	if err := config.Validate(); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *Config) Validate() error {
	if c.Server.Port == "" {
		return fmt.Errorf("PORT is required")
	}
	if c.Server.FrontendURL == "" {
		return fmt.Errorf("FRONTEND_URL is required")
	}
	if c.GoogleAuth.ClientID == "" {
		return fmt.Errorf("GOOGLE_CLIENT_ID is required")
	}
	if c.Database.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.Upstash.RESTURL == "" {
		return fmt.Errorf("UPSTASH_REDIS_REST_URL is required")
	}
	if c.Upstash.RESTToken == "" {
		return fmt.Errorf("UPSTASH_REDIS_REST_TOKEN is required")
	}
	if c.Session.Name == "" {
		return fmt.Errorf("SESSION_NAME is required")
	}
	if c.Session.TTLSeconds <= 0 {
		return fmt.Errorf("SESSION_TTL_SECONDS must be positive")
	}
	return nil
}

func valueOrDefault(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}

func intOrDefault(value string, fallback int) int {
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return parsed
}

func (c *Config) GetDatabaseDSN() string {
	return c.Database.DatabaseURL
}
