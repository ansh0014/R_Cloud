package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/r-cloud/shared/utils"
)

type RateLimitRule struct {
	MaxRequests int
	Window      time.Duration
}

type clientWindow struct {
	count     int
	startTime time.Time
}

type RateLimiter struct {
	mu     sync.Mutex
	limits map[string]*clientWindow
	rules  map[string]RateLimitRule
}

func NewRateLimiter() *RateLimiter {
	rl := &RateLimiter{
		limits: make(map[string]*clientWindow),
		rules: map[string]RateLimitRule{
			"/api/v1/deployments": {MaxRequests: 20, Window: time.Minute},
			"/api/v1/auth":        {MaxRequests: 10, Window: time.Minute},
			"/execute":            {MaxRequests: 100, Window: time.Minute},
			"default":             {MaxRequests: 100, Window: time.Minute},
		},
	}

	// Periodic cleanup of expired rate limit entries every 5 minutes
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientKey := r.RemoteAddr
		if userID := r.Header.Get("X-User-ID"); userID != "" {
			clientKey = userID
		}

		path := r.URL.Path
		rule := rl.rules["default"]

		for endpoint, customRule := range rl.rules {
			if endpoint != "default" && strings.Contains(path, endpoint) {
				rule = customRule
				break
			}
		}

		key := clientKey + ":" + path

		rl.mu.Lock()
		win, exists := rl.limits[key]
		now := time.Now()

		if !exists || now.Sub(win.startTime) > rule.Window {
			rl.limits[key] = &clientWindow{
				count:     1,
				startTime: now,
			}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		win.count++
		if win.count > rule.MaxRequests {
			rl.mu.Unlock()
			utils.WriteError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Rate limit exceeded. Please try again later.")
			return
		}
		rl.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for key, win := range rl.limits {
		if now.Sub(win.startTime) > 5*time.Minute {
			delete(rl.limits, key)
		}
	}
}
