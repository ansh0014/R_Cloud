package planner

import "github.com/r-cloud/shared/models"

type ProviderAdapter interface {
	GeneratePlan(req models.PlanRequest) (*models.DeploymentPlan, error)
}
