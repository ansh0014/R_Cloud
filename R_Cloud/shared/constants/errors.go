package constants

import "errors"

var (
	ErrNotFound          = errors.New("resource not found")
	ErrInvalidInput      = errors.New("invalid request payload")
	ErrValidationFailed  = errors.New("repository validation failed")
	ErrPlanningFailed    = errors.New("deployment planning failed")
	ErrDeploymentFailed  = errors.New("deployment execution failed")
	ErrUnauthorized      = errors.New("unauthorized access")
	ErrInternalError     = errors.New("internal server error")
)
