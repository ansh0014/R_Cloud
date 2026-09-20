package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type AuthHandler struct {
	authURL string
	proxy   *proxy.ServiceProxy
}

func NewAuthHandler(authURL string, sp *proxy.ServiceProxy) *AuthHandler {
	return &AuthHandler{
		authURL: authURL,
		proxy:   sp,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.authURL, "/api/v1")
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.authURL, "/api/v1")
}

func (h *AuthHandler) Profile(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.authURL, "/api/v1/auth")
}
