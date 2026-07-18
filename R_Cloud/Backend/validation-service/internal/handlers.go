package internal

import (
	"encoding/json"
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
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RepoDir == "" {
		writeError(w, http.StatusBadRequest, "repoDir is required")
		return
	}

	result := h.service.Validate(req.RepoDir)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
