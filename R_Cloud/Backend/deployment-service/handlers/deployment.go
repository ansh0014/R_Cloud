package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/deployment-service/service"
	"github.com/r-cloud/shared/utils"
)

type DeploymentHandler struct {
	service *service.DeploymentService
}

func NewDeploymentHandler(svc *service.DeploymentService) *DeploymentHandler {
	return &DeploymentHandler{service: svc}
}

type CreateDeploymentRequest struct {
	ProjectID string            `json:"projectId"`
	RepoURL   string            `json:"repoUrl"`
	RepoName  string            `json:"repoName"`
	Branch    string            `json:"branch"`
	EnvVars   map[string]string `json:"envVars"`
}

func (h *DeploymentHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		utils.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing X-User-ID header")
		return
	}

	var req CreateDeploymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	if req.ProjectID == "" || req.RepoURL == "" || req.Branch == "" {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "projectId, repoUrl, and branch are required")
		return
	}

	deployReq := service.DeployRequest{
		ProjectID: req.ProjectID,
		UserID:    userID,
		RepoURL:   req.RepoURL,
		RepoName:  req.RepoName,
		Branch:    req.Branch,
		EnvVars:   req.EnvVars,
	}

	deployment, err := h.service.Deploy(r.Context(), deployReq)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "DEPLOYMENT_FAILED", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, deployment, "Deployment started")
}

func (h *DeploymentHandler) Get(w http.ResponseWriter, r *http.Request) {
	deploymentID := mux.Vars(r)["deploymentId"]

	deployment, err := h.service.GetDeployment(deploymentID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	if deployment == nil {
		utils.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Deployment not found")
		return
	}

	utils.WriteSuccess(w, http.StatusOK, deployment, "")
}

func (h *DeploymentHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["projectId"]

	deployments, err := h.service.ListDeployments(projectID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusOK, deployments, "")
}
