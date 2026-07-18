package validator

import "strings"

func ValidateEndpoints(cfg *RagentConfig) []string {
	var errs []string

	if cfg.Routes.Execute == "" {
		errs = append(errs, "missing routes.execute in ragent.yaml")
	} else if !strings.HasPrefix(cfg.Routes.Execute, "/") {
		errs = append(errs, "routes.execute must start with '/'")
	}

	if cfg.Routes.Health == "" {
		errs = append(errs, "missing routes.health in ragent.yaml")
	} else if !strings.HasPrefix(cfg.Routes.Health, "/") {
		errs = append(errs, "routes.health must start with '/'")
	}

	if cfg.Routes.Metadata == "" {
		errs = append(errs, "missing routes.metadata in ragent.yaml")
	} else if !strings.HasPrefix(cfg.Routes.Metadata, "/") {
		errs = append(errs, "routes.metadata must start with '/'")
	}

	return errs
}
