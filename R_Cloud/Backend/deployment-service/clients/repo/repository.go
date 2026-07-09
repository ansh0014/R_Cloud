package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/r-cloud/shared/models"
)

type DeploymentRepository struct {
	db *sql.DB
}

func NewDeploymentRepository(db *sql.DB) *DeploymentRepository {
	return &DeploymentRepository{db: db}
}

func (r *DeploymentRepository) Create(deployment *models.Deployment) error {
	query := `
		INSERT INTO deployments (project_id, user_id, branch, commit_hash, version, mode, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`

	err := r.db.QueryRow(
		query,
		deployment.ProjectID,
		deployment.UserID,
		deployment.Branch,
		deployment.CommitHash,
		deployment.Version,
		deployment.Mode,
		deployment.Status,
		deployment.CreatedAt,
	).Scan(&deployment.ID)

	if err != nil {
		return fmt.Errorf("failed to insert deployment: %w", err)
	}

	return nil
}

func (r *DeploymentRepository) UpdateStatus(deploymentID, status string) error {
	query := `UPDATE deployments SET status = $1 WHERE id = $2`

	_, err := r.db.Exec(query, status, deploymentID)
	if err != nil {
		return fmt.Errorf("failed to update deployment status: %w", err)
	}

	return nil
}

func (r *DeploymentRepository) MarkCompleted(deploymentID, status string) error {
	completedAt := time.Now().UTC()
	query := `UPDATE deployments SET status = $1, completed_at = $2 WHERE id = $3`

	_, err := r.db.Exec(query, status, completedAt, deploymentID)
	if err != nil {
		return fmt.Errorf("failed to mark deployment completed: %w", err)
	}

	return nil
}

func (r *DeploymentRepository) GetByID(deploymentID string) (*models.Deployment, error) {
	query := `
		SELECT id, project_id, user_id, branch,
		       COALESCE(commit_hash, ''),
		       COALESCE(version, ''),
		       mode, status, created_at, completed_at
		FROM deployments
		WHERE id = $1
	`

	var d models.Deployment
	var completedAt sql.NullTime

	err := r.db.QueryRow(query, deploymentID).Scan(
		&d.ID,
		&d.ProjectID,
		&d.UserID,
		&d.Branch,
		&d.CommitHash,
		&d.Version,
		&d.Mode,
		&d.Status,
		&d.CreatedAt,
		&completedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch deployment: %w", err)
	}

	if completedAt.Valid {
		d.CompletedAt = &completedAt.Time
	}

	return &d, nil
}

func (r *DeploymentRepository) ListByProjectID(projectID string) ([]*models.Deployment, error) {
	query := `
		SELECT id, project_id, user_id, branch,
		       COALESCE(commit_hash, ''),
		       COALESCE(version, ''),
		       mode, status, created_at, completed_at
		FROM deployments
		WHERE project_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}
	defer rows.Close()

	var deployments []*models.Deployment

	for rows.Next() {
		var d models.Deployment
		var completedAt sql.NullTime

		if err := rows.Scan(
			&d.ID,
			&d.ProjectID,
			&d.UserID,
			&d.Branch,
			&d.CommitHash,
			&d.Version,
			&d.Mode,
			&d.Status,
			&d.CreatedAt,
			&completedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan deployment row: %w", err)
		}

		if completedAt.Valid {
			d.CompletedAt = &completedAt.Time
		}

		deployments = append(deployments, &d)
	}

	return deployments, nil
}
