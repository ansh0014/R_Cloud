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

	if cfg.Application.Mode == ModeMonolith {
		if cfg.Application.Entrypoint == "" {
			errs = append(errs, "monolith mode requires application.entrypoint in ragent.yaml")
		} else if err := validateEntrypoint(repoDir, cfg.Application.Entrypoint, "application"); err != "" {
			errs = append(errs, err)
		}
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

			if err := validateEntrypoint(repoDir, agent.Entrypoint, fmt.Sprintf("agent %q", agent.ID)); err != "" {
				errs = append(errs, err)
			}
		}
	}

	return errs
}

func validateEntrypoint(repoDir, entrypoint, owner string) string {
	entrypointPath := filepath.Join(repoDir, entrypoint)
	info, err := os.Stat(entrypointPath)
	if err != nil {
		return fmt.Sprintf("entrypoint file %q for %s not found in repository", entrypoint, owner)
	}
	if info.IsDir() {
		return fmt.Sprintf("entrypoint %q for %s must be a file, not a directory", entrypoint, owner)
	}
	return ""
}
