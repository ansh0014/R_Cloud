package models

import "time"

// Agent represents an individual active agent within a runtime deployment.
type Agent struct {
	ID               string    `json:"id"`
	RuntimeID        string    `json:"runtimeId"`
	Name             string    `json:"name"`
	Framework        string    `json:"framework,omitempty"`
	Version          string    `json:"version,omitempty"`
	Capabilities     []string  `json:"capabilities,omitempty"`
	AgentURL         string    `json:"agentUrl,omitempty"`
	RailwayServiceID string    `json:"railwayServiceId,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
}
