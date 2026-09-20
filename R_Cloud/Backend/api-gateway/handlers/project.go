package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type ProjectHandler struct {
	projectURL string
	proxy      *proxy.ServiceProxy
}

func NewProjectHandler(projectURL string, sp *proxy.ServiceProxy) *ProjectHandler {
	return &ProjectHandler{
		projectURL: projectURL,
		proxy:      sp,
	}
}

func (h *ProjectHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.projectURL, "")
}
