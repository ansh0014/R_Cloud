package handlers

import (
	"encoding/json"
	"log"
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
		log.Printf("[PlanHandler] Invalid request payload: %v", err)
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	log.Printf("[PlanHandler] Received plan request: Mode=%s, Provider=%s, Runtime=%s, Framework=%s, Agents=%d",
		req.ValidationResult.Mode, req.Provider, req.Runtime, req.Framework, len(req.ValidationResult.Agents))

	if !req.ValidationResult.Valid {
		log.Printf("[PlanHandler] Rejected: project validation result is invalid")
		writeError(w, http.StatusBadRequest, "cannot plan deployment for invalid project")
		return
	}

	plan, err := h.service.BuildPlan(req)
	if err != nil {
		log.Printf("[PlanHandler] BuildPlan failed: %v", err)
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	log.Printf("[PlanHandler] Plan created successfully: Provider=%s, Mode=%s, Services=%d",
		plan.Provider, plan.Mode, len(plan.Services))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(plan)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
