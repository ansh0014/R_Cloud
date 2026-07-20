package events

import "time"

type DeploymentCreatedEvent struct {
	DeploymentID string    `json:"deploymentId"`
	ProjectID    string    `json:"projectId"`
	UserID       string    `json:"userId"`
	Branch       string    `json:"branch"`
	Mode         string    `json:"mode"`
	Timestamp    time.Time `json:"timestamp"`
}

type DeploymentCompletedEvent struct {
	DeploymentID string    `json:"deploymentId"`
	ProjectID    string    `json:"projectId"`
	RuntimeID    string    `json:"runtimeId"`
	RuntimeURL   string    `json:"runtimeUrl"`
	Timestamp    time.Time `json:"timestamp"`
}

type DeploymentFailedEvent struct {
	DeploymentID string    `json:"deploymentId"`
	ProjectID    string    `json:"projectId"`
	Reason       string    `json:"reason"`
	Timestamp    time.Time `json:"timestamp"`
}
