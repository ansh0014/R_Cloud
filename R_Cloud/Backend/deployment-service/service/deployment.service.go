package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
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

type DeploymentService struct {
	repo                  *repo.DeploymentRepository
	runtimeClient         *grpcclient.RuntimeClient
	publisher             *publisher.NATSPublisher
	cloneBaseDir          string
	gitTimeout            time.Duration
	validationServiceURL  string
	plannerServiceURL     string
	breaker               *CircuitBreaker
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
		breaker:              NewCircuitBreaker(5, 30*time.Second),
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
		Mode:      "monolith",
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

	// Execute deployment pipeline asynchronously to avoid HTTP client timeout
	go s.executePipeline(deployment.ID, req, event)

	return deployment, nil
}

func (s *DeploymentService) executePipeline(deploymentID string, req DeployRequest, event publisher.DeploymentEvent) {
	bgCtx, cancel := context.WithTimeout(context.Background(), 15*time.Minute)
	defer cancel()

	repoDir, err := githubclient.CloneRepository(bgCtx, req.RepoURL, req.Branch, s.cloneBaseDir, req.RepoName, s.gitTimeout)
	if err != nil {
		log.Printf("[DeploymentService] Repository clone failed for %s: %v", deploymentID, err)
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}
	defer githubclient.Cleanup(repoDir)

	commitHash, err := githubclient.GetHeadCommitHash(repoDir)
	if err != nil {
		log.Printf("[DeploymentService] Failed to read commit hash for %s: %v", deploymentID, err)
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}

	validationResult, err := s.callValidationService(bgCtx, repoDir)
	if err != nil {
		log.Printf("[DeploymentService] Validation service error for %s: %v", deploymentID, err)
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}

	if !validationResult.Valid {
		log.Printf("[DeploymentService] Validation failed for %s: %s", deploymentID, strings.Join(validationResult.Errors, ", "))
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}

	deployPlan, err := s.callPlannerService(bgCtx, validationResult, req.EnvVars)
	if err != nil {
		log.Printf("[DeploymentService] Deployment planner error for %s: %v", deploymentID, err)
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}

	if err := s.repo.UpdateStatus(deploymentID, "DEPLOYING"); err != nil {
		log.Printf("[DeploymentService] Failed to update status to DEPLOYING for %s: %v", deploymentID, err)
		return
	}

	runtimeReq := grpcclient.CreateRuntimeRequest{
		DeploymentID: deploymentID,
		Plan:         deployPlan,
	}

	_, err = s.runtimeClient.CreateRuntime(bgCtx, runtimeReq)
	if err != nil {
		log.Printf("[DeploymentService] Runtime service call failed for %s: %v", deploymentID, err)
		s.failDeployment(bgCtx, deploymentID, event)
		return
	}

	if err := s.repo.MarkCompleted(deploymentID, "RUNNING"); err != nil {
		log.Printf("[DeploymentService] Failed to mark deployment as running for %s: %v", deploymentID, err)
		return
	}

	event.Status = "RUNNING"
	event.Timestamp = time.Now().UTC()
	_ = s.publisher.PublishCompleted(bgCtx, event)
	log.Printf("[DeploymentService] Deployment pipeline completed successfully for %s (commit %s)", deploymentID, commitHash)
}

func (s *DeploymentService) GetDeployment(deploymentID string) (*models.Deployment, error) {
	return s.repo.GetByID(deploymentID)
}

func (s *DeploymentService) ListDeployments(projectID string) ([]*models.Deployment, error) {
	return s.repo.ListByProjectID(projectID)
}

func (s *DeploymentService) callValidationService(ctx context.Context, repoDir string) (*ValidationResult, error) {
	if !s.breaker.CanExecute() {
		return nil, ErrCircuitBreakerOpen
	}

	body, _ := json.Marshal(map[string]string{"repoDir": repoDir})

	reqCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost,
		s.validationServiceURL+"/validate",
		strings.NewReader(string(body)),
	)
	if err != nil {
		s.breaker.RecordFailure()
		return nil, fmt.Errorf("failed to build validation request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		s.breaker.RecordFailure()
		return nil, fmt.Errorf("validation service unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.breaker.RecordFailure()
		return nil, fmt.Errorf("validation service returned status %s", resp.Status)
	}

	var result ValidationResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		s.breaker.RecordFailure()
		return nil, fmt.Errorf("failed to parse validation response: %w", err)
	}

	s.breaker.RecordSuccess()
	return &result, nil
}

func (s *DeploymentService) callPlannerService(ctx context.Context, validation *ValidationResult, envVars map[string]string) (*grpcclient.DeploymentPlan, error) {
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

	var plan grpcclient.DeploymentPlan
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
