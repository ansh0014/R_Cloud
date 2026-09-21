package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"auth/config"
	"auth/models"
	"auth/session"

	"google.golang.org/api/idtoken"
)

type AuthHandler struct {
	userRepo *models.UserRepository
	config   *config.Config
	sessions *session.Store
}

func NewAuthHandler(userRepo *models.UserRepository, cfg *config.Config, sessions *session.Store) (*AuthHandler, error) {
	return &AuthHandler{
		userRepo: userRepo,
		config:   cfg,
		sessions: sessions,
	}, nil
}

type LoginRequest struct {
	IDToken string `json:"idToken"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	token, err := idtoken.Validate(context.Background(), req.IDToken, h.config.GoogleAuth.ClientID)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	googleSubject := token.Subject
	if googleSubject == "" {
		http.Error(w, "Invalid token subject", http.StatusUnauthorized)
		return
	}
	email := ""
	if e, ok := token.Claims["email"].(string); ok {
		email = e
	}
	if email == "" {
		http.Error(w, "Token does not include an email address", http.StatusUnauthorized)
		return
	}
	if verified, ok := token.Claims["email_verified"].(bool); !ok || !verified {
		http.Error(w, "Google account email is not verified", http.StatusUnauthorized)
		return
	}
	name := ""
	if n, ok := token.Claims["name"].(string); ok {
		name = n
	}
	picture := ""
	if p, ok := token.Claims["picture"].(string); ok {
		picture = p
	}

	user, err := h.userRepo.FindByGoogleSubject(googleSubject)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if user == nil {
		// Firebase subjects and Google OIDC subjects are different. Match an
		// existing account by its verified email once, then replace the old
		// provider subject so users keep their original record and role.
		user, err = h.userRepo.FindByEmail(email)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if user == nil {
			role := "user"
			if h.config.AdminEmail != "" && email == h.config.AdminEmail {
				role = "admin"
			}
			user = &models.User{
				GoogleSubject: googleSubject,
				Email:         email,
				Name:          name,
				Picture:       picture,
				Role:          role,
			}
			if err := h.userRepo.Create(user); err != nil {
				http.Error(w, "Failed to create user", http.StatusInternalServerError)
				return
			}
		} else {
			if h.config.AdminEmail != "" && email == h.config.AdminEmail {
				user.Role = "admin"
			}
			user.GoogleSubject = googleSubject
			user.Name = name
			user.Picture = picture
			if err := h.userRepo.Update(user); err != nil {
				http.Error(w, "Failed to migrate user", http.StatusInternalServerError)
				return
			}
		}
	} else {
		if h.config.AdminEmail != "" && email == h.config.AdminEmail {
			user.Role = "admin"
		}
		user.Email = email
		user.Name = name
		user.Picture = picture
		if err := h.userRepo.Update(user); err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}
	}

	sessionID, err := h.sessions.Create(r.Context(), session.Data{UserID: user.ID, GoogleSubject: user.GoogleSubject, Email: user.Email, Name: user.Name, Role: user.Role})
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}
	h.setSessionCookie(w, sessionID, h.config.Session.TTLSeconds)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(h.config.Session.Name); err == nil {
		if err := h.sessions.Delete(r.Context(), cookie.Value); err != nil {
			http.Error(w, "Failed to end session", http.StatusInternalServerError)
			return
		}
	}
	h.setSessionCookie(w, "", -1)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	sessionData, ok := h.currentSession(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.FindByGoogleSubject(sessionData.GoogleSubject)
	if err != nil || user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.ID != sessionData.UserID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "google-identity-auth",
	})
}

func (h *AuthHandler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := h.currentSession(r); !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *AuthHandler) currentSession(r *http.Request) (*session.Data, bool) {
	cookie, err := r.Cookie(h.config.Session.Name)
	if err != nil || cookie.Value == "" {
		return nil, false
	}
	data, err := h.sessions.Get(r.Context(), cookie.Value)
	return data, err == nil && data != nil
}

func (h *AuthHandler) setSessionCookie(w http.ResponseWriter, value string, maxAge int) {
	http.SetCookie(w, &http.Cookie{Name: h.config.Session.Name, Value: value, Path: "/", MaxAge: maxAge, HttpOnly: true, Secure: h.config.Session.CookieSecure, SameSite: http.SameSiteLaxMode})
}

func (h *AuthHandler) CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}
