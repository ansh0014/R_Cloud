package events

// NATS Subject constants
const (
	SubjectDeploymentCreated   = "deployment.created"
	SubjectDeploymentValidated = "deployment.validated"
	SubjectDeploymentPlanned   = "deployment.planned"
	SubjectDeploymentCompleted = "deployment.completed"
	SubjectDeploymentFailed    = "deployment.failed"

	SubjectRuntimeStarted   = "runtime.started"
	SubjectRuntimeStopped   = "runtime.stopped"
	SubjectRuntimeRestarted = "runtime.restarted"
	SubjectRuntimeFailed    = "runtime.failed"

	SubjectHealthFailed = "health.failed"
)
