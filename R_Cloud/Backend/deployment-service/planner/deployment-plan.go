package planner

import (
	"fmt"
	"os"
	"path/filepath"
)

type DeploymentPlan struct {
	Mode   string
	Agents []AgentConfig
}

func BuildDeploymentPlan(repoDir string) (*DeploymentPlan, error) {
	cfg, err := ParseRagentYAML(repoDir)
	if err != nil {
		return nil, err
	}

	if err := validateConfig(cfg, repoDir); err != nil {
		return nil, err
	}

	return &DeploymentPlan{
		Mode:   cfg.Application.Mode,
		Agents: cfg.Agents,
	}, nil
}

func validateConfig(cfg *RagentConfig, repoDir string) error {
	if cfg.Application.Mode != "monolith" && cfg.Application.Mode != "microservices" {
		return fmt.Errorf("invalid mode %q: must be 'monolith' or 'microservices'", cfg.Application.Mode)
	}

	if cfg.Routes.Execute == "" || cfg.Routes.Health == "" || cfg.Routes.Metadata == "" {
		return fmt.Errorf("ragent.yaml must define routes.execute, routes.health, and routes.metadata")
	}

	if cfg.Application.Mode == "microservices" {
		if len(cfg.Agents) == 0 {
			return fmt.Errorf("microservices mode requires at least one agent in ragent.yaml")
		}

		for _, agent := range cfg.Agents {
			entrypointPath := filepath.Join(repoDir, agent.Entrypoint)
			if _, err := os.Stat(entrypointPath); os.IsNotExist(err) {
				return fmt.Errorf("entrypoint file %q not found for agent %q", agent.Entrypoint, agent.ID)
			}
		}
	}

	return nil
}
