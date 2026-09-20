package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/api-gateway/proxy"
	"github.com/r-cloud/shared/utils"
)

type ExecutionProxyHandler struct {
	runtimeServiceURL string
	proxy             *proxy.ServiceProxy
}

func NewExecutionProxyHandler(runtimeServiceURL string, sp *proxy.ServiceProxy) *ExecutionProxyHandler {
	return &ExecutionProxyHandler{
		runtimeServiceURL: runtimeServiceURL,
		proxy:             sp,
	}
}

type RuntimeResolutionResponse struct {
	RuntimeURL string `json:"runtimeUrl"`
}

func (h *ExecutionProxyHandler) Execute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	deploymentID := vars["deploymentId"]

	if deploymentID == "" {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "Missing deploymentId in URL path")
		return
	}

	runtimeURL, err := h.resolveRuntimeURL(deploymentID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "RUNTIME_NOT_FOUND", fmt.Sprintf("Failed to locate active runtime for deployment %s: %v", deploymentID, err))
		return
	}

	if err := h.proxy.ProxyToRuntime(w, r, runtimeURL, "/execute"); err != nil {
		utils.WriteError(w, http.StatusBadGateway, "RUNTIME_EXECUTION_FAILED", err.Error())
		return
	}
}

func (h *ExecutionProxyHandler) Stream(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	deploymentID := vars["deploymentId"]

	if deploymentID == "" {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "Missing deploymentId in URL path")
		return
	}

	runtimeURL, err := h.resolveRuntimeURL(deploymentID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "RUNTIME_NOT_FOUND", fmt.Sprintf("Failed to locate active runtime for deployment %s: %v", deploymentID, err))
		return
	}

	if err := h.proxy.ProxyToRuntime(w, r, runtimeURL, "/stream"); err != nil {
		utils.WriteError(w, http.StatusBadGateway, "RUNTIME_STREAM_FAILED", err.Error())
		return
	}
}

func (h *ExecutionProxyHandler) resolveRuntimeURL(deploymentID string) (string, error) {
	resp, err := http.Get(h.runtimeServiceURL + "/api/v1/runtimes/by-deployment/" + deploymentID)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("runtime service returned status %d", resp.StatusCode)
	}

	var res struct {
		Data RuntimeResolutionResponse `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}

	if res.Data.RuntimeURL == "" {
		return "", fmt.Errorf("empty runtimeUrl returned")
	}

	return res.Data.RuntimeURL, nil
}
