package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/r-cloud/shared/models"
)


type ProjectRepository struct {
	db *sql.DB
}
func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(project *models.Project) error {
	query := `
		INSERT INTO projects (user_id, name, description, github_repo_url, github_repo_name, github_owner, default_branch, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	now := time.Now()
	project.CreatedAt = now
	project.UpdatedAt = now

	err := r.db.QueryRow(
		query,
		project.UserID,
		project.Name,
		project.Description,
		project.GithubRepoURL,
		project.GithubRepoName,
		project.GithubOwner,
		project.DefaultBranch,
		project.CreatedAt,
		project.UpdatedAt,
	).Scan(&project.ID)

	if err != nil {
		return fmt.Errorf("insert project failed: %w", err)
	}

	return nil
}

func (r *ProjectRepository) GetByID(id string) (*models.Project, error) {
	query := `
		SELECT id, user_id, name, 
		       COALESCE(description, ''), 
		       COALESCE(github_repo_url, ''), 
		       COALESCE(github_repo_name, ''), 
		       COALESCE(github_owner, ''), 
		       COALESCE(default_branch, ''), 
		       created_at, updated_at
		FROM projects
		WHERE id = $1
	`

	var project models.Project
	err := r.db.QueryRow(query, id).Scan(
		&project.ID,
		&project.UserID,
		&project.Name,
		&project.Description,
		&project.GithubRepoURL,
		&project.GithubRepoName,
		&project.GithubOwner,
		&project.DefaultBranch,
		&project.CreatedAt,
		&project.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("fetch project by id failed: %w", err)
	}

	return &project, nil
}

func (r *ProjectRepository) ListByUserID(userID string) ([]*models.Project, error) {
	query := `
		SELECT id, user_id, name, 
		       COALESCE(description, ''), 
		       COALESCE(github_repo_url, ''), 
		       COALESCE(github_repo_name, ''), 
		       COALESCE(github_owner, ''), 
		       COALESCE(default_branch, ''), 
		       created_at, updated_at
		FROM projects
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("list projects by user failed: %w", err)
	}
	defer rows.Close()

	var projects []*models.Project

	for rows.Next() {
		var project models.Project
		err := rows.Scan(
			&project.ID,
			&project.UserID,
			&project.Name,
			&project.Description,
			&project.GithubRepoURL,
			&project.GithubRepoName,
			&project.GithubOwner,
			&project.DefaultBranch,
			&project.CreatedAt,
			&project.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan project row failed: %w", err)
		}

		projects = append(projects, &project)
	}

	return projects, nil
}


func (r *ProjectRepository) UpdateGitHubInfo(id, repoURL, repoName, owner, branch string) error {
	query := `
		UPDATE projects
		SET github_repo_url = $1, github_repo_name = $2, github_owner = $3, default_branch = $4, updated_at = $5
		WHERE id = $6
	`

	_, err := r.db.Exec(query, repoURL, repoName, owner, branch, time.Now(), id)
	if err != nil {
		return fmt.Errorf("update github info failed: %w", err)
	}

	return nil
}


func (r *ProjectRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete project failed: %w", err)
	}

	return nil
}
