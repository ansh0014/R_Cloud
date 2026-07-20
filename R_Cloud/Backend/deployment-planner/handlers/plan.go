package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/r-cloud/deployment-planner/planner"
	"github.com/r-cloud/shared/models"
)

type PlanHandler struct {
	service *planner.PlannerService
}

func NewPlanHandler(svc *planner.PlannerService) *PlanHandler {
	return &PlanHandler{service: svc}
}

func (h *PlanHandler) CreatePlan(w http.ResponseWriter, r *http.Request) {
	var req models.PlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if !req.ValidationResult.Valid {
		writeError(w, http.StatusBadRequest, "cannot plan deployment for invalid project")
		return
	}

	plan, err := h.service.BuildPlan(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(plan)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
