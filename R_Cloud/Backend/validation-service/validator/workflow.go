package validator

import "fmt"

const (
	ModeMonolith      = "monolith"
	ModeMicroservices = "microservices"
)

func ValidateWorkflow(cfg *RagentConfig) []string {
	var errs []string
	mode := cfg.Application.Mode

	if mode != ModeMonolith && mode != ModeMicroservices {
		errs = append(errs, fmt.Sprintf("invalid application mode %q: must be %q or %q", mode, ModeMonolith, ModeMicroservices))
	}

	return errs
}
