package handlers

import (
	"net/http"

	"github.com/r-cloud/api-gateway/proxy"
)

type RuntimeHandler struct {
	runtimeURL string
	proxy      *proxy.ServiceProxy
}

func NewRuntimeHandler(runtimeURL string, sp *proxy.ServiceProxy) *RuntimeHandler {
	return &RuntimeHandler{
		runtimeURL: runtimeURL,
		proxy:      sp,
	}
}

func (h *RuntimeHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	_ = h.proxy.Forward(w, r, h.runtimeURL, "")
}
