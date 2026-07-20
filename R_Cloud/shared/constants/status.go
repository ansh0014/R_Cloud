package constants

// Deployment Statuses
const (
	StatusPending    = "PENDING"
	StatusValidating = "VALIDATING"
	StatusPlanning   = "PLANNING"
	StatusDeploying  = "DEPLOYING"
	StatusRunning    = "RUNNING"
	StatusFailed     = "FAILED"
	StatusStopped    = "STOPPED"
	StatusDeleted    = "DELETED"
)

// Deployment Modes
const (
	ModeMonolith      = "monolith"
	ModeMicroservices = "microservices"
)
