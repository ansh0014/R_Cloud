package planner

import (
	"testing"

	"github.com/r-cloud/shared/models"
)

func TestRailwayAdapterGeneratePlanMicroservices(t *testing.T) {
	adapter := NewRailwayAdapter()

	plan, err := adapter.GeneratePlan(models.PlanRequest{
		ValidationResult: models.ValidationResult{
			Valid: true,
			Mode:  "microservices",
			Agents: []models.RAgentAgent{
				{ID: "planner", Entrypoint: "services/planner.ts"},
				{ID: "researcher", Entrypoint: "workers/researcher.py"},
			},
		},
		Environment: map[string]string{"APP_ENV": "prod"},
		Runtime:     "python",
		Framework:   "langgraph",
	})
	if err != nil {
		t.Fatalf("GeneratePlan returned unexpected error: %v", err)
	}

	if plan.Mode != "microservices" {
		t.Fatalf("expected microservices mode, got %q", plan.Mode)
	}

	if len(plan.Services) != 2 {
		t.Fatalf("expected 2 services for microservices mode, got %d", len(plan.Services))
	}

	if plan.Services[0].Name != "planner-agent" || plan.Services[1].Name != "researcher-agent" {
		t.Fatalf("unexpected generated service names: %#v", plan.Services)
	}
	if plan.Services[0].Entrypoint != "services/planner.ts" || plan.Services[1].Entrypoint != "workers/researcher.py" {
		t.Fatalf("planner did not preserve ragent.yaml entrypoints: %#v", plan.Services)
	}
}

func TestRailwayAdapterGeneratePlanMonolithEntrypoint(t *testing.T) {
	plan, err := NewRailwayAdapter().GeneratePlan(models.PlanRequest{
		ValidationResult: models.ValidationResult{
			Valid:      true,
			Mode:       "monolith",
			Entrypoint: "src/server.js",
		},
	})
	if err != nil {
		t.Fatalf("GeneratePlan returned unexpected error: %v", err)
	}
	if len(plan.Services) != 1 || plan.Services[0].Entrypoint != "src/server.js" {
		t.Fatalf("planner did not preserve monolith entrypoint: %#v", plan.Services)
	}
}
