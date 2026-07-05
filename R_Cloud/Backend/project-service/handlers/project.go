package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/project-service/service"
	"github.com/r-cloud/shared/utils"
)


type ProjectHandler struct {
	service *service.ProjectService
}
func NewProjectHandler(s *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{service: s}
}


type CreateProjectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}


type ConnectGitHubRequest struct {
	RepoURL string `json:"repoUrl"`
}
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		utils.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing X-User-ID header")
		return
	}

	var req CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	project, err := h.service.CreateProject(userID, req.Name, req.Description)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, project, "Project created")
}


func (h *ProjectHandler) Get(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["projectId"]

	project, err := h.service.GetProject(projectID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	if project == nil {
		utils.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Project not found")
		return
	}

	utils.WriteSuccess(w, http.StatusOK, project, "")
}


func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		utils.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing X-User-ID header")
		return
	}

	projects, err := h.service.ListProjects(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusOK, projects, "")
}

func (h *ProjectHandler) ConnectGitHub(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["projectId"]

	var req ConnectGitHubRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid request body")
		return
	}

	project, err := h.service.ConnectGitHub(projectID, req.RepoURL)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "GITHUB_CONNECTION_FAILED", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusOK, project, "GitHub repository connected")
}


func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["projectId"]

	if err := h.service.DeleteProject(projectID); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	utils.WriteSuccess(w, http.StatusOK, nil, "Project deleted")
}
