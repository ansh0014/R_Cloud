package models

import "time"

// Runtime represents the container or cluster resources where agents run.
type Runtime struct {
	ID               string    `json:"id"`
	DeploymentID     string    `json:"deploymentId"`
	RuntimeURL       string    `json:"runtimeUrl"`
	Provider         string    `json:"provider"`
	RailwayProjectID string    `json:"railwayProjectId,omitempty"`
	Status           string    `json:"status"`
	Health           string    `json:"health"`
	RestartCount     int       `json:"restartCount"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}
