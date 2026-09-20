package middleware

import (
	"net/http"
	"strings"

	"github.com/r-cloud/shared/utils"
)

type APIKeyValidator struct{}

func NewAPIKeyValidator() *APIKeyValidator {
	return &APIKeyValidator{}
}

func (a *APIKeyValidator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey != "" {
			if !strings.HasPrefix(apiKey, "rc_") && !strings.HasPrefix(apiKey, "sk_") {
				utils.WriteError(w, http.StatusUnauthorized, "INVALID_API_KEY", "Invalid API key format")
				return
			}
			r.Header.Set("X-User-ID", "api_key_user")
		}
		next.ServeHTTP(w, r)
	})
}
