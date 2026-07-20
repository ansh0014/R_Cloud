package planner

import (
	"fmt"
	"strings"

	"github.com/r-cloud/shared/models"
)

type RailwayAdapter struct{}

func NewRailwayAdapter() *RailwayAdapter {
	return &RailwayAdapter{}
}

func (a *RailwayAdapter) GeneratePlan(req models.PlanRequest) (*models.DeploymentPlan, error) {
	runtime := strings.ToLower(req.Runtime)
	if runtime == "" {
		runtime = "python"
	}

	buildCommand := a.getBuildCommand(runtime)
	startCommand := a.getStartCommand(runtime, req.ValidationResult.Mode)
	services := a.buildServices(req.ValidationResult)

	env := make(map[string]string)
	for k, v := range req.Environment {
		env[k] = v
	}

	return &models.DeploymentPlan{
		Provider:     "railway",
		Mode:         req.ValidationResult.Mode,
		Runtime:      runtime,
		Framework:    req.Framework,
		BuildCommand: buildCommand,
		StartCommand: startCommand,
		Environment:  env,
		Services:     services,
	}, nil
}

func (a *RailwayAdapter) getBuildCommand(runtime string) string {
	switch runtime {
	case "node", "javascript", "typescript":
		return "npm install"
	case "go", "golang":
		return "go build -o app ."
	case "python":
		fallthrough
	default:
		return "pip install -r requirements.txt"
	}
}

func (a *RailwayAdapter) getStartCommand(runtime, mode string) string {
	switch runtime {
	case "node", "javascript", "typescript":
		return "npm start"
	case "go", "golang":
		return "./app"
	case "python":
		fallthrough
	default:
		return "uvicorn main:app --host 0.0.0.0 --port $PORT"
	}
}

func (a *RailwayAdapter) buildServices(vr models.ValidationResult	) []models.ServicePlan {
	if vr.Mode == "microservices" && len(vr.Agents) > 0 {
		var services []models.ServicePlan
		for _, agentID := range vr.Agents {
			services = append(services, models.ServicePlan{
				Name:          fmt.Sprintf("%s-agent", agentID),
				Entrypoint:    fmt.Sprintf("agents/%s.py", agentID),
				ExecuteRoute:  "/execute",
				HealthRoute:   "/health",
				MetadataRoute: "/metadata",
			})
		}
		return services
	}

	return []models.ServicePlan{
		{
			Name:          "main",
			Entrypoint:    "main.py",
			ExecuteRoute:  "/execute",
			HealthRoute:   "/health",
			MetadataRoute: "/metadata",
		},
	}
}

