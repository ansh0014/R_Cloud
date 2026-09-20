package session

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"


	infraredis "github.com/r-cloud/infrastructure/redis"
	"auth/config"
)

// Data holds the session payload stored in Redis.
type Data struct {
	UserID        int    `json:"user_id"`
	GoogleSubject string `json:"google_subject"`
	Email         string `json:"email"`
	Name          string `json:"name"`
	Role          string `json:"role"`
}

// Store manages user sessions backed by the centralized Upstash Redis client.
type Store struct {
	client *infraredis.UpstashClient
	prefix string
	ttl    int // seconds
}

// NewStore creates a session store using the shared infrastructure/redis package.
// Auth service no longer maintains its own Upstash HTTP implementation.
func NewStore(cfg config.UpstashConfig, ttlSeconds int) (*Store, error) {
	client, err := infraredis.ConnectUpstash(cfg.RESTURL, cfg.RESTToken)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Upstash Redis: %w", err)
	}

	return &Store{
		client: client,
		prefix: cfg.KeyPrefix,
		ttl:    ttlSeconds,
	}, nil
}

// Create persists a new session and returns its ID.
func (s *Store) Create(ctx context.Context, data Data) (string, error) {
	id, err := randomID()
	if err != nil {
		return "", err
	}

	key := s.prefix + id
	if err := s.client.Set(ctx, key, data, s.ttl); err != nil {
		return "", fmt.Errorf("session create: %w", err)
	}

	return id, nil
}

// Get retrieves session data by session ID.
func (s *Store) Get(ctx context.Context, id string) (*Data, error) {
	key := s.prefix + id

	raw, err := s.client.Get(ctx, key)
	if err != nil {
		return nil, fmt.Errorf("session get: %w", err)
	}
	if raw == "" {
		return nil, nil
	}

	var d Data
	if err := json.Unmarshal([]byte(raw), &d); err != nil {
		return nil, fmt.Errorf("session decode: %w", err)
	}

	return &d, nil
}

// Delete removes a session by ID (logout).
func (s *Store) Delete(ctx context.Context, id string) error {
	key := s.prefix + id
	return s.client.Delete(ctx, key)
}

func randomID() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate session ID: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

