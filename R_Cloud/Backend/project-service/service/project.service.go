package service

import (
	"errors"
	"fmt"

	"github.com/r-cloud/project-service/github"
	"github.com/r-cloud/project-service/repository"
	"github.com/r-cloud/shared/models"
)

type ProjectService struct {
	repo          *repository.ProjectRepository
	githubClient  *github.GitHubClient
	defaultBranch string
}

func NewProjectService(
	repo *repository.ProjectRepository,
	ghClient *github.GitHubClient,
	defaultBranch string,
) *ProjectService {
	return &ProjectService{
		repo:          repo,
		githubClient:  ghClient,
		defaultBranch: defaultBranch,
	}
}

func (s *ProjectService) CreateProject(userID, name, description string) (*models.Project, error) {
	if name == "" {
		return nil, errors.New("project name is required")
	}

	project := &models.Project{
		UserID:      userID,
		Name:        name,
		Description: description,
	}

	if err := s.repo.Create(project); err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return project, nil
}


func (s *ProjectService) GetProject(projectID string) (*models.Project, error) {
	return s.repo.GetByID(projectID)
}

func (s *ProjectService) ListProjects(userID string) ([]*models.Project, error) {
	return s.repo.ListByUserID(userID)
}
func (s *ProjectService) ConnectGitHub(projectID, repoURL string) (*models.Project, error) {
	project, err := s.repo.GetByID(projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project: %w", err)
	}
	if project == nil {
		return nil, errors.New("project not found")
	}

	repoInfo, err := s.githubClient.ValidateRepository(repoURL)
	if err != nil {
		return nil, fmt.Errorf("github validation failed: %w", err)
	}

	err = s.repo.UpdateGitHubInfo(
		projectID,
		repoInfo.CloneURL,
		repoInfo.Name,
		repoInfo.Owner.Login,
		repoInfo.DefaultBranch,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to save github info: %w", err)
	}

	project.GithubRepoURL = repoInfo.CloneURL
	project.GithubRepoName = repoInfo.Name
	project.GithubOwner = repoInfo.Owner.Login
	project.DefaultBranch = repoInfo.DefaultBranch

	return project, nil
}


func (s *ProjectService) DeleteProject(projectID string) error {
	return s.repo.Delete(projectID)
}

func (s *ProjectService) SyncGitHub(projectID string) (*models.Project, error) {
	project, err := s.repo.GetByID(projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project: %w", err)
	}
	if project == nil {
		return nil, errors.New("project not found")
	}

	if project.GithubRepoURL == "" {
		return nil, errors.New("no github repository is connected to this project")
	}

	repoInfo, err := s.githubClient.ValidateRepository(project.GithubRepoURL)
	if err != nil {
		return nil, fmt.Errorf("github sync validation failed: %w", err)
	}

	err = s.repo.UpdateGitHubInfo(
		projectID,
		repoInfo.CloneURL,
		repoInfo.Name,
		repoInfo.Owner.Login,
		repoInfo.DefaultBranch,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update github info during sync: %w", err)
	}

	project.GithubRepoURL = repoInfo.CloneURL
	project.GithubRepoName = repoInfo.Name
	project.GithubOwner = repoInfo.Owner.Login
	project.DefaultBranch = repoInfo.DefaultBranch

	return project, nil
}

