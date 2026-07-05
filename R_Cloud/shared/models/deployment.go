package models

import "time"

// Deployment represents a execution and deployment release of a project.
type Deployment struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"projectId"`
	UserID      string     `json:"userId"`
	Branch      string     `json:"branch"`
	CommitHash  string     `json:"commitHash,omitempty"`
	Version     string     `json:"version,omitempty"`
	Mode        string     `json:"mode"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"createdAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}
