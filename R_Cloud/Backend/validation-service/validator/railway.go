package validator

import (
	"fmt"
	"regexp"
)

var railwayProjectNameRegex = regexp.MustCompile(`^[a-zA-Z0-9-_]+$`)

// ValidateRailwayCompatibility checks that configuration parameters meet general Railway limits or rules.
func ValidateRailwayCompatibility(cfg *RagentConfig) []string {
	var errs []string

	if cfg.Application.Name == "" {
		errs = append(errs, "application name in ragent.yaml must not be empty")
	} else if len(cfg.Application.Name) > 100 {
		errs = append(errs, "application name must not exceed 100 characters")
	} else if !railwayProjectNameRegex.MatchString(cfg.Application.Name) {
		errs = append(errs, fmt.Sprintf("invalid application name %q: must contain only alphanumeric characters, dashes, and underscores", cfg.Application.Name))
	}

	return errs
}
