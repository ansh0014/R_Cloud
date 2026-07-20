package planner

import (
	"fmt"
	"strings"

	"github.com/r-cloud/shared/models"
)

type PlannerService struct {
	adapters map[string]ProviderAdapter
}

func NewPlannerService() *PlannerService {
	adapters := make(map[string]ProviderAdapter)
	adapters["railway"] = NewRailwayAdapter()

	return &PlannerService{
		adapters: adapters,
	}
}

func (s *PlannerService) BuildPlan(req models.PlanRequest) (*models.DeploymentPlan, error) {
	provider := strings.ToLower(req.Provider)
	if provider == "" {
		provider = "railway"
	}

	adapter, ok := s.adapters[provider]
	if !ok {
		return nil, fmt.Errorf("unsupported provider %q", provider)
	}

	return adapter.GeneratePlan(req)
}
