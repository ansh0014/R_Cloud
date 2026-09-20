package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type DeploymentHandler struct {
	deploymentURL string
	proxy         *proxy.ServiceProxy
}

func NewDeploymentHandler(deploymentURL string, sp *proxy.ServiceProxy) *DeploymentHandler {
	return &DeploymentHandler{
		deploymentURL: deploymentURL,
		proxy:         sp,
	}
}

func (h *DeploymentHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.deploymentURL, "")
}
