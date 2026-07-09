package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	githubclient "github.com/r-cloud/deployment-service/clients/github"
	grpcclient "github.com/r-cloud/deployment-service/clients/grpc"
	"github.com/r-cloud/deployment-service/clients/repo"
	"github.com/r-cloud/deployment-service/publisher"
	"github.com/r-cloud/shared/models"
)

type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Mode   string   `json:"mode"`
	Agents []Agent  `json:"agents"`
	Errors []string `json:"errors"`
}

type Agent struct {
	ID         string `json:"id"`
	Entrypoint string `json:"entrypoint"`
}

type ServicePlan struct {
	Name         string `json:"name"`
	Entrypoint   string `json:"entrypoint"`
	ExecuteRoute string `json:"executeRoute"`
	HealthRoute  string `json:"healthRoute"`
	MetadataRoute string `json:"metadataRoute"`
}

type DeploymentPlan struct {
	Provider     string            `json:"provider"`
	Mode         string            `json:"mode"`
	Runtime      string            `json:"runtime"`
	Framework    string            `json:"framework"`
	BuildCommand string            `json:"buildCommand"`
	StartCommand string            `json:"startCommand"`
	Environment  map[string]string `json:"environment"`
	Services     []ServicePlan     `json:"services"`
}

type DeploymentService struct {
	repo                  *repo.DeploymentRepository
	runtimeClient         *grpcclient.RuntimeClient
	publisher             *publisher.NATSPublisher
	cloneBaseDir          string
	gitTimeout            time.Duration
	validationServiceURL  string
	plannerServiceURL     string
}

func NewDeploymentService(
	r *repo.DeploymentRepository,
	runtimeClient *grpcclient.RuntimeClient,
	pub *publisher.NATSPublisher,
	cloneBaseDir string,
	gitTimeout time.Duration,
	validationServiceURL string,
	plannerServiceURL string,
) *DeploymentService {
	return &DeploymentService{
		repo:                 r,
		runtimeClient:        runtimeClient,
		publisher:            pub,
		cloneBaseDir:         cloneBaseDir,
		gitTimeout:           gitTimeout,
		validationServiceURL: validationServiceURL,
		plannerServiceURL:    plannerServiceURL,
	}
}

type DeployRequest struct {
	ProjectID string
	UserID    string
	RepoURL   string
	RepoName  string
	Branch    string
	EnvVars   map[string]string
}

func (s *DeploymentService) Deploy(ctx context.Context, req DeployRequest) (*models.Deployment, error) {
	deployment := &models.Deployment{
		ProjectID: req.ProjectID,
		UserID:    req.UserID,
		Branch:    req.Branch,
		Status:    "VALIDATING",
		CreatedAt: time.Now().UTC(),
	}

	if err := s.repo.Create(deployment); err != nil {
		return nil, fmt.Errorf("failed to create deployment record: %w", err)
	}

	event := publisher.DeploymentEvent{
		DeploymentID: deployment.ID,
		ProjectID:    deployment.ProjectID,
		UserID:       deployment.UserID,
		Status:       "VALIDATING",
		Timestamp:    time.Now().UTC(),
	}
	_ = s.publisher.PublishCreated(ctx, event)

	repoDir, err := githubclient.CloneRepository(ctx, req.RepoURL, req.Branch, s.cloneBaseDir, req.RepoName, s.gitTimeout)
	if err != nil {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("repository clone failed: %w", err)
	}
	defer githubclient.Cleanup(repoDir)

	commitHash, err := githubclient.GetHeadCommitHash(repoDir)
	if err != nil {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("failed to read commit hash: %w", err)
	}

	validationResult, err := s.callValidationService(ctx, repoDir)
	if err != nil {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("validation service error: %w", err)
	}

	if !validationResult.Valid {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("validation failed: %s", strings.Join(validationResult.Errors, ", "))
	}

	deployPlan, err := s.callPlannerService(ctx, validationResult, req.EnvVars)
	if err != nil {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("deployment planner error: %w", err)
	}

	if err := s.repo.UpdateStatus(deployment.ID, "DEPLOYING"); err != nil {
		return nil, fmt.Errorf("failed to update deployment status to DEPLOYING: %w", err)
	}

	runtimeReq := grpcclient.CreateRuntimeRequest{
		DeploymentID: deployment.ID,
		Plan:         deployPlan,
	}

	_, err = s.runtimeClient.CreateRuntime(ctx, runtimeReq)
	if err != nil {
		s.failDeployment(ctx, deployment.ID, event)
		return nil, fmt.Errorf("runtime service call failed: %w", err)
	}

	deployment.CommitHash = commitHash
	deployment.Mode = deployPlan.Mode
	deployment.Status = "RUNNING"

	if err := s.repo.MarkCompleted(deployment.ID, "RUNNING"); err != nil {
		return nil, fmt.Errorf("failed to mark deployment as running: %w", err)
	}

	event.Status = "RUNNING"
	event.Timestamp = time.Now().UTC()
	_ = s.publisher.PublishCompleted(ctx, event)

	return deployment, nil
}

func (s *DeploymentService) GetDeployment(deploymentID string) (*models.Deployment, error) {
	return s.repo.GetByID(deploymentID)
}

func (s *DeploymentService) ListDeployments(projectID string) ([]*models.Deployment, error) {
	return s.repo.ListByProjectID(projectID)
}

func (s *DeploymentService) callValidationService(ctx context.Context, repoDir string) (*ValidationResult, error) {
	body, _ := json.Marshal(map[string]string{"repoDir": repoDir})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		s.validationServiceURL+"/validate",
		strings.NewReader(string(body)),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to build validation request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("validation service unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("validation service returned status %s", resp.Status)
	}

	var result ValidationResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to parse validation response: %w", err)
	}

	return &result, nil
}

func (s *DeploymentService) callPlannerService(ctx context.Context, validation *ValidationResult, envVars map[string]string) (*DeploymentPlan, error) {
	payload := map[string]interface{}{
		"validationResult": validation,
		"environment":      envVars,
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		s.plannerServiceURL+"/plan",
		strings.NewReader(string(body)),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to build planner request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("deployment planner unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("deployment planner returned status %s", resp.Status)
	}

	var plan DeploymentPlan
	if err := json.NewDecoder(resp.Body).Decode(&plan); err != nil {
		return nil, fmt.Errorf("failed to parse planner response: %w", err)
	}

	return &plan, nil
}

func (s *DeploymentService) failDeployment(ctx context.Context, deploymentID string, event publisher.DeploymentEvent) {
	_ = s.repo.MarkCompleted(deploymentID, "FAILED")

	event.Status = "FAILED"
	event.Timestamp = time.Now().UTC()
	_ = s.publisher.PublishFailed(ctx, event)
}
