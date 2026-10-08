package internal

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/r-cloud/validation-service/service"
)

type ValidationHandler struct {
	service *service.ValidationService
}

func NewValidationHandler(svc *service.ValidationService) *ValidationHandler {
	return &ValidationHandler{service: svc}
}

type validateRequest struct {
	RepoDir string `json:"repoDir"`
}

func (h *ValidationHandler) Validate(w http.ResponseWriter, r *http.Request) {
	var req validateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ValidationHandler] Invalid request body: %v", err)
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RepoDir == "" {
		log.Printf("[ValidationHandler] Missing repoDir in request")
		writeError(w, http.StatusBadRequest, "repoDir is required")
		return
	}

	log.Printf("[ValidationHandler] Received validation request for RepoDir: %s", req.RepoDir)
	result := h.service.Validate(req.RepoDir)
	log.Printf("[ValidationHandler] Validation completed: Valid=%t, Mode=%s, Agents=%d, Errors=%v",
		result.Valid, result.Mode, len(result.Agents), result.Errors)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
