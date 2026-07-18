package validator

import (
	"fmt"
	"regexp"
)

var envVarNameRegex = regexp.MustCompile(`^[A-Z_][A-Z0-9_]*$`)

func ValidateEnvironment(cfg *RagentConfig) []string {
	var errs []string

	for _, envVar := range cfg.Env {
		if !envVarNameRegex.MatchString(envVar) {
			errs = append(errs, fmt.Sprintf("invalid environment variable declaration name %q: must be alphanumeric/uppercase starting with a letter or underscore", envVar))
		}
	}

	return errs
}
