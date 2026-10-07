package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type AIValidationHandler struct {
	aiURL string
	proxy *proxy.ServiceProxy
}

func NewAIValidationHandler(aiURL string, sp *proxy.ServiceProxy) *AIValidationHandler {
	return &AIValidationHandler{
		aiURL: aiURL,
		proxy: sp,
	}
}

func (h *AIValidationHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.aiURL, "/api/v1/ai")
}
