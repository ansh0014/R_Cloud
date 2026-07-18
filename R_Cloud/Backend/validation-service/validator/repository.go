package validator

import (
	"fmt"
	"os"
	"path/filepath"
)

func ValidateRepository(repoDir string, cfg *RagentConfig) []string {
	var errs []string

	// Check if repository directory exists
	info, err := os.Stat(repoDir)
	if err != nil || !info.IsDir() {
		errs = append(errs, fmt.Sprintf("repository directory %s not found or inaccessible", repoDir))
		return errs
	}

	// Validate agent entrypoints if in microservices mode
	if cfg.Application.Mode == ModeMicroservices {
		if len(cfg.Agents) == 0 {
			errs = append(errs, "microservices mode requires at least one agent defined in ragent.yaml")
			return errs
		}

		for _, agent := range cfg.Agents {
			if agent.ID == "" {
				errs = append(errs, "agent defined in ragent.yaml must have an 'id'")
				continue
			}

			if agent.Entrypoint == "" {
				errs = append(errs, fmt.Sprintf("agent %q has no entrypoint specified", agent.ID))
				continue
			}

			entrypointPath := filepath.Join(repoDir, agent.Entrypoint)
			agentInfo, err := os.Stat(entrypointPath)
			if err != nil {
				errs = append(errs, fmt.Sprintf("entrypoint file %q for agent %q not found in repository", agent.Entrypoint, agent.ID))
			} else if agentInfo.IsDir() {
				errs = append(errs, fmt.Sprintf("entrypoint %q for agent %q must be a file, not a directory", agent.Entrypoint, agent.ID))
			}
		}
	}

	return errs
}
