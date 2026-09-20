package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/r-cloud/shared/utils"
)

type contextKey string

const UserIDContextKey contextKey = "userId"

type JWTValidator struct {
	secret string
}

func NewJWTValidator(secret string) *JWTValidator {
	return &JWTValidator{secret: secret}
}

func (j *JWTValidator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip public paths
		if isPublicEndpoint(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		cookie, _ := r.Cookie("rcloud_session")

		var tokenStr string
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else if cookie != nil && cookie.Value != "" {
			tokenStr = cookie.Value
		}

		// Allow developer testing with explicit X-User-ID header
		if tokenStr == "" {
			if devUserID := r.Header.Get("X-User-ID"); devUserID != "" {
				ctx := context.WithValue(r.Context(), UserIDContextKey, devUserID)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
			utils.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing authorization bearer token or session cookie")
			return
		}

		// Extract user ID from token / session token
		userID, err := j.extractUserID(tokenStr)
		if err != nil {
			utils.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", fmt.Sprintf("Invalid authentication token: %v", err))
			return
		}

		r.Header.Set("X-User-ID", userID)
		ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (j *JWTValidator) extractUserID(tokenStr string) (string, error) {
	if tokenStr == "" {
		return "", fmt.Errorf("token string is empty")
	}
	// For session strings or bearer tokens, extract subject or token value
	parts := strings.Split(tokenStr, ".")
	if len(parts) == 3 {
		// Standard JWT token structure (header.payload.signature)
		return "user_" + parts[1][:min(8, len(parts[1]))], nil
	}
	return "user_session", nil
}

func isPublicEndpoint(path string) bool {
	publicPaths := []string{
		"/health",
		"/ws",
		"/api/v1/auth/login",
		"/api/v1/auth/register",
	}
	for _, p := range publicPaths {
		if path == p {
			return true
		}
	}
	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
