package validator

type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Mode   string   `json:"mode,omitempty"`
	Agents []string `json:"agents,omitempty"`
	Errors []string `json:"errors,omitempty"`
}

func Validate(repoDir string) ValidationResult {
	var errs []string

	// 1. Parse ragent.yaml
	cfg, err := ParseRagentYAML(repoDir)
	if err != nil {
		errs = append(errs, err.Error())
		return ValidationResult{
			Valid:  false,
			Errors: errs,
		}
	}

	// 2. Validate workflow/mode
	errs = append(errs, ValidateWorkflow(cfg)...)

	// 3. Validate endpoints/routes
	errs = append(errs, ValidateEndpoints(cfg)...)

	// 4. Validate repository-level structure & agent entrypoints
	errs = append(errs, ValidateRepository(repoDir, cfg)...)

	// 5. Validate environment variables structure
	errs = append(errs, ValidateEnvironment(cfg)...)

	// 6. Validate Railway project compatibility
	errs = append(errs, ValidateRailwayCompatibility(cfg)...)

	// 7. Validate build dependency descriptors existence (warnings / errors)
	errs = append(errs, ValidateDependencies(repoDir)...)

	if len(errs) > 0 {
		return ValidationResult{
			Valid:  false,
			Errors: errs,
		}
	}

	var agents []string
	if cfg.Application.Mode == ModeMicroservices {
		for _, a := range cfg.Agents {
			agents = append(agents, a.ID)
		}
	}

	return ValidationResult{
		Valid:  true,
		Mode:   cfg.Application.Mode,
		Agents: agents,
	}
}
