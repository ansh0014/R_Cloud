package events

import "time"

type RuntimeStartedEvent struct {
	RuntimeID    string    `json:"runtimeId"`
	DeploymentID string    `json:"deploymentId"`
	RuntimeURL   string    `json:"runtimeUrl"`
	Timestamp    time.Time `json:"timestamp"`
}

type RuntimeFailedEvent struct {
	RuntimeID    string    `json:"runtimeId"`
	DeploymentID string    `json:"deploymentId"`
	Reason       string    `json:"reason"`
	Timestamp    time.Time `json:"timestamp"`
}

type RuntimeStoppedEvent struct {
	RuntimeID    string    `json:"runtimeId"`
	DeploymentID string    `json:"deploymentId"`
	Timestamp    time.Time `json:"timestamp"`
}
