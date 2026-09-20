package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type AgentOpsHandler struct {
	agentOpsURL string
	proxy       *proxy.ServiceProxy
}

func NewAgentOpsHandler(agentOpsURL string, sp *proxy.ServiceProxy) *AgentOpsHandler {
	return &AgentOpsHandler{
		agentOpsURL: agentOpsURL,
		proxy:       sp,
	}
}

func (h *AgentOpsHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.agentOpsURL, "")
}
