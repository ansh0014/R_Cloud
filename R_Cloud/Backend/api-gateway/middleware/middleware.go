package middleware

import (
	"log"
	"net/http"
	"time"
)

type Middleware struct {
	frontendURL  string
	rateLimiter  *RateLimiter
	jwtValidator *JWTValidator
	apiKeyVal    *APIKeyValidator
}

func NewMiddleware(frontendURL string, jwtSecret string) *Middleware {
	return &Middleware{
		frontendURL:  frontendURL,
		rateLimiter:  NewRateLimiter(),
		jwtValidator: NewJWTValidator(jwtSecret),
		apiKeyVal:    NewAPIKeyValidator(),
	}
}

func (m *Middleware) CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = m.frontendURL
		}

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-ID, X-API-Key")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (m *Middleware) RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("[%s] %s (%v)", r.Method, r.URL.Path, time.Since(start))
	})
}

func (m *Middleware) RateLimit(next http.Handler) http.Handler {
	return m.rateLimiter.Middleware(next)
}

func (m *Middleware) AuthValidator(next http.Handler) http.Handler {
	return m.apiKeyVal.Middleware(m.jwtValidator.Middleware(next))
}
